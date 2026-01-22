<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendNewTaskNotifications;
use App\Mail\TaskCompletedMail;
use App\Mail\PaymentStatusChangedMail;
use App\Mail\PayoutRequestMail;
use App\Models\Notification;
use App\Models\Offer;
use App\Models\Payment;
use App\Models\Task;
use App\Models\User;
use App\Services\CreditService;
use App\Services\GamificationService;
use App\Services\WebPushService;
use App\Services\TelegramNotificationService;
use App\Events\TaskCreated;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Get available insurance options
     */
    public function insuranceOptions(): JsonResponse
    {
        return response()->json([
            'options' => Task::INSURANCE_OPTIONS,
            'guarantee_text' => 'Le prestataire s\'engage à réaliser la mission avec soin et professionnalisme. En cas de dommages causés lors de l\'exécution, le prestataire assume l\'entière responsabilité et s\'engage à réparer ou indemniser le client.',
        ]);
    }

    /**
     * Get task counts by subcategory
     */
    public function countsByCategory(): JsonResponse
    {
        $counts = Task::where('status', 'published')
            ->whereNotNull('subcategory')
            ->selectRaw('subcategory, COUNT(*) as count')
            ->groupBy('subcategory')
            ->pluck('count', 'subcategory')
            ->toArray();

        return response()->json($counts);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Task::query();

        if ($request->filled('client_id')) {
            $query->where('client_id', (int) $request->input('client_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Sort by promoted_until DESC (TOP announcements first), then by created_at DESC
        $perPage = $request->input('per_page', 10);
        $tasks = $query
            ->orderByRaw('IF(promoted_until IS NOT NULL AND promoted_until > NOW(), 0, 1) ASC')
            ->orderByDesc('promoted_until')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json($tasks);
    }

    public function show(Task $task): JsonResponse
    {
        $task->load('client:id,name,avatar');
        return response()->json($task);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => ['required', 'integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'budget_min' => ['nullable', 'numeric', 'min:0'],
            'budget_max' => ['nullable', 'numeric', 'min:0'],
            'location_type' => ['nullable', 'string', 'in:on_site,remote'],
            'category' => ['required', 'string', 'max:100'],
            'subcategory' => ['nullable', 'string', 'max:150'],
            'city' => ['nullable', 'string', 'max:255'],
            'district_code' => ['nullable', 'string', 'max:10'],
            'district_name' => ['nullable', 'string', 'max:100'],
            'zone' => ['nullable', 'string', 'max:50'],
            'insurance_level' => ['nullable', 'string', 'in:basic,standard,premium'],
        ]);

        // Calculate insurance fee if selected
        $insuranceLevel = $validated['insurance_level'] ?? null;
        $insuranceFee = null;
        if ($insuranceLevel && isset(Task::INSURANCE_OPTIONS[$insuranceLevel])) {
            $insuranceFee = Task::INSURANCE_OPTIONS[$insuranceLevel]['fee'];
        }

        $task = Task::create([
            'client_id' => $validated['client_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'budget_min' => $validated['budget_min'] ?? null,
            'budget_max' => $validated['budget_max'] ?? null,
            'location_type' => $validated['location_type'] ?? 'remote',
            'city' => $validated['city'] ?? null,
            'district_code' => $validated['district_code'] ?? null,
            'district_name' => $validated['district_name'] ?? null,
            'zone' => $validated['zone'] ?? null,
            'category' => $validated['category'],
            'subcategory' => $validated['subcategory'] ?? null,
            'status' => 'published',
            'insurance_level' => $insuranceLevel,
            'insurance_fee' => $insuranceFee,
        ]);

        // Dispatch job to send notifications to eligible prestataires
        SendNewTaskNotifications::dispatch($task);

        // Fire event for email automation
        event(new TaskCreated($task));

        return response()->json($task, 201);
    }

    public function guestPublish(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'budget_min' => ['nullable', 'numeric', 'min:0'],
            'budget_max' => ['nullable', 'numeric', 'min:0'],
            'location_type' => ['nullable', 'string', 'in:on_site,remote'],
            'category' => ['required', 'string', 'max:100'],
            'subcategory' => ['nullable', 'string', 'max:150'],
            'city' => ['nullable', 'string', 'max:255'],
            'district_code' => ['nullable', 'string', 'max:10'],
            'district_name' => ['nullable', 'string', 'max:100'],
            'zone' => ['nullable', 'string', 'max:50'],
            'insurance_level' => ['nullable', 'string', 'in:basic,standard,premium'],
        ]);

        // Перевіряємо чи email вже існує
        $existingUser = User::where('email', $validated['email'])->first();
        
        if ($existingUser) {
            return response()->json([
                'message' => 'Un compte existe déjà avec cet email. Veuillez vous connecter.',
            ], 422);
        }

        // Генеруємо випадковий пароль
        $password = bin2hex(random_bytes(4)); // 8 символів
        
        // Створюємо користувача з обома ролями
        $user = User::create([
            'name' => explode('@', $validated['email'])[0],
            'email' => $validated['email'],
            'password' => bcrypt($password),
            'role' => 'client', // Default active role
            'roles' => ['client', 'prestataire'], // Both roles
            'email_verified_at' => now(),
            'referral_code' => User::generateReferralCode(),
        ]);

        // Initialize credits
        $creditService = app(CreditService::class);
        $creditService->initializeUserCredits($user);

        // Create API token for auto-login
        $token = $user->createToken('auth-token')->plainTextToken;

        // Обчислюємо insurance fee
        $insuranceLevel = $validated['insurance_level'] ?? null;
        $insuranceFee = null;
        if ($insuranceLevel && isset(Task::INSURANCE_OPTIONS[$insuranceLevel])) {
            $insuranceFee = Task::INSURANCE_OPTIONS[$insuranceLevel]['fee'];
        }

        // Створюємо оголошення
        $task = Task::create([
            'client_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'budget_min' => $validated['budget_min'] ?? null,
            'budget_max' => $validated['budget_max'] ?? null,
            'location_type' => $validated['location_type'] ?? 'remote',
            'city' => $validated['city'] ?? null,
            'district_code' => $validated['district_code'] ?? null,
            'district_name' => $validated['district_name'] ?? null,
            'zone' => $validated['zone'] ?? null,
            'category' => $validated['category'],
            'subcategory' => $validated['subcategory'] ?? null,
            'status' => 'published',
            'insurance_level' => $insuranceLevel,
            'insurance_fee' => $insuranceFee,
        ]);

        // Відправляємо email з даними доступу
        try {
            Mail::to($user->email)->queue(new \App\Mail\GuestAccountCreated($user, $password, $task));
        } catch (\Exception $e) {
            \Log::error('Failed to send guest account email: ' . $e->getMessage());
            // Продовжуємо навіть якщо email не відправився
        }

        // Dispatch job to send notifications to eligible prestataires
        SendNewTaskNotifications::dispatch($task);

        return response()->json([
            'message' => 'Annonce publiée avec succès',
            'task_id' => $task->id,
            'user' => $user->fresh(), // Свіжі дані користувача
            'token' => $token, // Токен для автоматичного логіну
        ], 201);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        // Only allow updating published or draft tasks
        if (!in_array($task->status, ['published', 'draft'])) {
            return response()->json([
                'message' => 'Cette tâche ne peut plus être modifiée.',
            ], 422);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'budget_min' => ['nullable', 'numeric', 'min:0'],
            'budget_max' => ['nullable', 'numeric', 'min:0'],
            'location_type' => ['nullable', 'string', 'in:on_site,remote'],
            'category' => ['sometimes', 'string', 'max:100'],
            'subcategory' => ['nullable', 'string', 'max:150'],
            'city' => ['nullable', 'string', 'max:255'],
        ]);

        $task->update($validated);

        return response()->json($task);
    }

    public function destroy(Task $task): JsonResponse
    {
        // Only allow deleting published or draft tasks
        if (!in_array($task->status, ['published', 'draft'])) {
            return response()->json([
                'message' => 'Cette tâche ne peut plus être supprimée.',
            ], 422);
        }

        $task->delete();

        return response()->json([
            'message' => 'Tâche supprimée avec succès.',
        ]);
    }

    public function cancel(Task $task): JsonResponse
    {
        // Only allow cancelling published or assigned tasks
        if (!in_array($task->status, ['published', 'assigned'])) {
            return response()->json([
                'message' => 'Cette tâche ne peut pas être annulée.',
            ], 422);
        }

        $task->update(['status' => 'cancelled']);

        // Notify prestataire if task was assigned
        if ($task->prestataire_id) {
            Notification::create([
                'user_id' => $task->prestataire_id,
                'type' => 'task_cancelled',
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                ],
            ]);

            $prestataire = User::find($task->prestataire_id);
            if ($prestataire && $prestataire->push_notifications !== false) {
                $webPush = new WebPushService();
                $webPush->sendToUser(
                    $prestataire,
                    'Tâche annulée',
                    "La tâche \"{$task->title}\" a été annulée",
                    '/dashboard',
                    'task-cancelled-' . $task->id
                );
            }
        }

        return response()->json($task);
    }

    public function complete(Task $task): JsonResponse
    {
        if ($task->status !== 'in_progress') {
            return response()->json([
                'message' => 'Seules les tâches en cours peuvent être marquées comme terminées.',
            ], 422);
        }

        // Переконуємось, що є авторизований платіж перед завершенням задачі
        $authorizedPayment = Payment::query()
            ->where('task_id', $task->id)
            ->where('status', 'authorized')
            ->first();

        if (!$authorizedPayment) {
            return response()->json([
                'message' => 'La tâche doit être payée avant de pouvoir être marquée comme terminée.',
            ], 422);
        }

        $task->update(['status' => 'completed']);

        Payment::query()
            ->where('id', $authorizedPayment->id)
            ->update(['status' => 'captured']);

        // Нотифікація про зміну статусу платежу на captured для клієнта
        if ($task->client_id) {
            Notification::create([
                'user_id' => (int) $task->client_id,
                'type' => 'payment_status_changed',
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'status' => 'captured',
                    'amount' => $authorizedPayment->amount,
                ],
            ]);

            $client = User::find($task->client_id);
            if ($client && $client->email && $client->email_notifications !== false) {
                Mail::to($client->email)->queue(new PaymentStatusChangedMail([
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'status' => 'captured',
                    'amount' => $authorizedPayment->amount,
                ]));
            }
        }

        // Створюємо сповіщення для клієнта про завершення задачі
        if ($task->client_id) {
            Notification::create([
                'user_id' => (int) $task->client_id,
                'type' => 'task_completed',
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                ],
            ]);

            $client = User::find($task->client_id);
            if ($client) {
                // Push notification
                if ($client->push_notifications !== false) {
                    $webPush = new WebPushService();
                    $webPush->sendToUser(
                        $client,
                        'Tâche terminée ✅',
                        "La tâche \"{$task->title}\" a été marquée comme terminée",
                        '/tasks/' . $task->id,
                        'task-completed-' . $task->id
                    );
                }

                // Email notification
                if ($client->email && $client->email_notifications !== false) {
                    Mail::to($client->email)->queue(new TaskCompletedMail([
                        'task_id' => $task->id,
                        'task_title' => $task->title,
                    ]));
                }
                
                // Telegram notification
                TelegramNotificationService::notifyTaskCompleted($client, $task);
            }
        }

        // Також сповіщення для виконавця, якщо є прийнята офера
        $acceptedOffer = Offer::query()
            ->where('task_id', $task->id)
            ->where('status', 'accepted')
            ->first();

        if ($acceptedOffer && $acceptedOffer->prestataire_id) {
            Notification::create([
                'user_id' => (int) $acceptedOffer->prestataire_id,
                'type' => 'task_completed',
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                ],
            ]);

            $prestataire = User::find($acceptedOffer->prestataire_id);
            if ($prestataire) {
                // Push notification
                if ($prestataire->push_notifications !== false) {
                    $webPush = new WebPushService();
                    $webPush->sendToUser(
                        $prestataire,
                        'Mission terminée ✅',
                        "La mission \"{$task->title}\" est terminée. Paiement en cours de traitement.",
                        '/dashboard',
                        'task-completed-prestataire-' . $task->id
                    );
                }

                // Email notification
                if ($prestataire->email && $prestataire->email_notifications !== false) {
                    Mail::to($prestataire->email)->queue(new TaskCompletedMail([
                        'task_id' => $task->id,
                        'task_title' => $task->title,
                    ]));
                }
                
                // Telegram notification
                TelegramNotificationService::notifyTaskCompleted($prestataire, $task);
            }

            // Send payout request email to admin
            if ($prestataire && $authorizedPayment) {
                $adminEmail = config('mail.admin_email', 'info@prochepro.fr');
                try {
                    Mail::to($adminEmail)->queue(new PayoutRequestMail(
                        $task,
                        $prestataire,
                        (float) $authorizedPayment->amount
                    ));
                } catch (\Exception $e) {
                    \Log::error('Failed to send payout request email: ' . $e->getMessage());
                }
            }

            // Update gamification stats for prestataire
            if ($prestataire) {
                $gamificationService = app(GamificationService::class);
                $gamificationService->updateUserStatsAfterTask($prestataire, $task);
            }
        }

        return response()->json($task->fresh());
    }

    public function uploadImages(Request $request, Task $task): JsonResponse
    {
        $request->validate([
            'images' => ['required', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'], // 5MB max per image
        ]);

        $uploadedImages = [];
        $existingImages = $task->images ?? [];

        if ($request->hasFile('images')) {
            $imagesPath = public_path('task_images');
            if (!is_dir($imagesPath)) {
                mkdir($imagesPath, 0755, true);
            }

            foreach ($request->file('images') as $image) {
                $filename = 'task_' . $task->id . '_' . time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $image->move($imagesPath, $filename);
                $uploadedImages[] = '/task_images/' . $filename;
            }
        }

        $allImages = array_merge($existingImages, $uploadedImages);
        
        // Limit to 10 images total
        if (count($allImages) > 10) {
            $allImages = array_slice($allImages, -10);
        }

        $task->update(['images' => $allImages]);

        return response()->json([
            'images' => $allImages,
            'message' => 'Images téléchargées avec succès.',
        ]);
    }

    public function deleteImage(Request $request, Task $task): JsonResponse
    {
        $request->validate([
            'image_url' => ['required', 'string'],
        ]);

        $images = $task->images ?? [];
        $imageUrl = $request->input('image_url');

        $images = array_filter($images, fn($img) => $img !== $imageUrl);
        
        // Delete file from disk
        $filePath = public_path($imageUrl);
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        $task->update(['images' => array_values($images)]);

        return response()->json([
            'images' => array_values($images),
            'message' => 'Image supprimée.',
        ]);
    }

    /**
     * Get contact info for a task - only available when offer is accepted
     * Client sees prestataire phone, prestataire sees client phone
     */
    public function getContactInfo(Request $request, Task $task): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $userId = $request->user_id;
        $user = User::findOrFail($userId);

        // Check if there's an accepted offer for this task
        $acceptedOffer = Offer::where('task_id', $task->id)
            ->where('status', 'accepted')
            ->first();

        if (!$acceptedOffer) {
            return response()->json([
                'message' => 'Aucune offre acceptée pour cette tâche.',
                'phone' => null,
            ], 403);
        }

        // Determine which user's phone to return
        $contactPhone = null;
        $contactName = null;

        if ($userId === $task->client_id) {
            // Client wants prestataire's phone
            $prestataire = User::find($acceptedOffer->prestataire_id);
            if ($prestataire) {
                $contactPhone = $prestataire->phone;
                $contactName = $prestataire->name;
            }
        } elseif ($userId === $acceptedOffer->prestataire_id) {
            // Prestataire wants client's phone
            $client = User::find($task->client_id);
            if ($client) {
                $contactPhone = $client->phone;
                $contactName = $client->name;
            }
        } else {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à voir ces informations.',
                'phone' => null,
            ], 403);
        }

        return response()->json([
            'phone' => $contactPhone,
            'name' => $contactName,
        ]);
    }
}
