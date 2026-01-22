<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewReviewMail;
use App\Models\Notification;
use App\Models\Review;
use App\Models\Task;
use App\Models\User;
use App\Services\GamificationService;
use App\Services\WebPushService;
use App\Services\TelegramNotificationService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => ['required', 'integer', 'exists:users,id'],
            'prestataire_id' => ['required', 'integer', 'exists:users,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['nullable', 'string'],
        ]);

        if ($task->status !== 'completed') {
            return response()->json([
                'message' => 'La tâche doit être terminée avant de laisser un avis.',
            ], 422);
        }

        $review = Review::create([
            'task_id' => $task->id,
            'client_id' => $validated['client_id'],
            'prestataire_id' => $validated['prestataire_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'photos' => $validated['photos'] ?? null,
            'direction' => 'client_to_prestataire',
        ]);

        // Сповіщення для виконавця про новий відгук від клієнта
        Notification::create([
            'user_id' => $validated['prestataire_id'],
            'type' => 'review_from_client',
            'data' => [
                'task_id' => $task->id,
                'task_title' => $task->title,
                'rating' => $validated['rating'],
            ],
        ]);

        $prestataire = User::find($validated['prestataire_id']);
        if ($prestataire) {
            // Push notification with smart notification for high ratings
            if ($prestataire->push_notifications !== false) {
                $webPush = new WebPushService();
                
                // Use smart notification for 5-star ratings
                if ($validated['rating'] === 5) {
                    $webPush->notifyHighRating($prestataire, $validated['rating'], $task->title);
                } else {
                    // Regular notification for other ratings
                    $stars = str_repeat('⭐', $validated['rating']);
                    $webPush->sendToUser(
                        $prestataire,
                        'Nouvel avis reçu ' . $stars,
                        "Vous avez reçu un avis pour \"{$task->title}\"",
                        '/dashboard',
                        'review-' . $review->id
                    );
                }
            }

            // Email notification
            if ($prestataire->email && $prestataire->email_notifications !== false) {
                Mail::to($prestataire->email)->queue(new NewReviewMail([
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'rating' => $validated['rating'],
                ]));
            }
            
            // Telegram notification
            try {
                TelegramNotificationService::notifyNewReview(
                    $prestataire,
                    $validated['rating'],
                    $validated['comment'] ?? '',
                    $task
                );
            } catch (\Throwable $e) {
                \Log::error('Telegram review notification failed', ['error' => $e->getMessage()]);
            }

            // Update gamification stats for prestataire
            $gamificationService = app(GamificationService::class);
            $gamificationService->updateUserStatsAfterReview($prestataire);
        }

        return response()->json($review, 201);
    }

    public function showForTask(Task $task): JsonResponse
    {
        $reviews = $task->reviews()->with(['client', 'prestataire'])->get();

        return response()->json($reviews);
    }

    public function storeFromPrestataire(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'prestataire_id' => ['required', 'integer', 'exists:users,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['nullable', 'string'],
        ]);

        if ($task->status !== 'completed') {
            return response()->json([
                'message' => 'La tâche doit être terminée avant de laisser un avis.',
            ], 422);
        }

        if ($task->client_id === null) {
            return response()->json([
                'message' => 'La tâche n\'a pas de client associé.',
            ], 422);
        }

        $review = Review::create([
            'task_id' => $task->id,
            'client_id' => $task->client_id,
            'prestataire_id' => $validated['prestataire_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'photos' => $validated['photos'] ?? null,
            'direction' => 'prestataire_to_client',
        ]);

        // Сповіщення для клієнта про новий відгук від виконавця
        Notification::create([
            'user_id' => (int) $task->client_id,
            'type' => 'review_from_prestataire',
            'data' => [
                'task_id' => $task->id,
                'task_title' => $task->title,
                'rating' => $validated['rating'],
            ],
        ]);

        $client = User::find($task->client_id);
        if ($client) {
            // Push notification
            if ($client->push_notifications !== false) {
                $webPush = new WebPushService();
                $stars = str_repeat('⭐', $validated['rating']);
                $webPush->sendToUser(
                    $client,
                    'Nouvel avis reçu ' . $stars,
                    "Le prestataire vous a laissé un avis pour \"{$task->title}\"",
                    '/dashboard',
                    'review-client-' . $review->id
                );
            }

            // Email notification
            if ($client->email && $client->email_notifications !== false) {
                Mail::to($client->email)->queue(new NewReviewMail([
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'rating' => $validated['rating'],
                ]));
            }
        }

        return response()->json($review, 201);
    }

    public function indexForPrestataire(int $prestataireId): JsonResponse
    {
        $reviews = Review::query()
            ->where('prestataire_id', $prestataireId)
            ->where('direction', 'client_to_prestataire')
            ->with(['task', 'client'])
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    public function indexForClient(int $clientId): JsonResponse
    {
        $reviews = Review::query()
            ->where('client_id', $clientId)
            ->where('direction', 'prestataire_to_client')
            ->with(['task', 'prestataire'])
            ->latest()
            ->get();

        return response()->json($reviews);
    }
}
