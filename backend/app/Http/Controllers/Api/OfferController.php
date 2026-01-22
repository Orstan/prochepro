<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OfferAcceptedMail;
use App\Models\Notification;
use App\Models\Offer;
use App\Models\Task;
use App\Models\User;
use App\Services\CreditService;
use App\Services\SmsService;
use App\Services\WebPushService;
use App\Services\TelegramNotificationService;
use App\Events\OfferCreated;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    public function index(Task $task): JsonResponse
    {
        $offers = $task->offers()
            ->with([
                'prestataire',
                'prestataire.achievements' => function ($query) {
                    $query->with('achievement')->orderBy('earned_at', 'desc')->limit(1);
                }
            ])
            ->latest()
            ->get();

        // Add gamification info for each prestataire
        $offers->transform(function ($offer) {
            if ($offer->prestataire) {
                // Get latest achievement (already eager loaded)
                $latestAchievement = null;
                try {
                    $latestUserAchievement = $offer->prestataire->achievements->first();
                    
                    if ($latestUserAchievement && $latestUserAchievement->achievement) {
                        $latestAchievement = [
                            'icon' => $latestUserAchievement->achievement->icon,
                            'name' => $latestUserAchievement->achievement->name,
                        ];
                    }
                } catch (\Exception $e) {
                    // Ignore if gamification tables don't exist
                }

                $offer->prestataire = [
                    'id' => $offer->prestataire->id,
                    'name' => $offer->prestataire->name,
                    'avatar' => $offer->prestataire->avatar,
                    'level' => $offer->prestataire->level ?? 1,
                    'latest_badge' => $latestAchievement,
                ];
            }
            return $offer;
        });

        return response()->json($offers);
    }

    public function indexByPrestataire(Request $request): JsonResponse
    {
        $query = Offer::query()->with('task');

        if ($request->filled('prestataire_id')) {
            $query->where('prestataire_id', (int) $request->input('prestataire_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $offers = $query->latest()->limit(10)->get();

        return response()->json($offers);
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'prestataire_id' => ['required', 'integer', 'exists:users,id'],
            'price' => ['nullable', 'integer', 'min:0'],
            'message' => ['nullable', 'string'],
        ]);

        // Check if user is verified
        $user = User::findOrFail($validated['prestataire_id']);
        
        if (!$user->is_verified) {
            return response()->json([
                'message' => 'Vous devez vérifier votre identité avant de pouvoir envoyer des offres.',
                'verification_required' => true,
                'verification_status' => $user->verification_status,
            ], 403);
        }

        // REMOVED: Credits check - New pricing model allows unlimited offers
        // Commission is now 0% for first 3 completed orders, 10% after

        $offer = Offer::create([
            'task_id' => $task->id,
            'prestataire_id' => $validated['prestataire_id'],
            'price' => $validated['price'] ?? null,
            'message' => $validated['message'] ?? null,
            'status' => 'pending',
        ]);

        // REMOVED: Credit deduction - No longer needed

        // Notify client about new offer
        if ($task->client_id) {
            Notification::create([
                'user_id' => $task->client_id,
                'type' => 'new_offer',
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'offer_id' => $offer->id,
                    'prestataire_name' => $user->name,
                    'price' => $offer->price,
                ],
            ]);

            $client = User::find($task->client_id);
            if ($client) {
                // Push notification
                if ($client->push_notifications !== false) {
                    $webPush = new WebPushService();
                    $priceText = $offer->price ? " - {$offer->price}€" : "";
                    $webPush->sendToUser(
                        $client,
                        'Nouvelle offre',
                        "{$user->name} a fait une offre pour \"{$task->title}\"{$priceText}",
                        '/tasks/' . $task->id,
                        'offer-' . $offer->id
                    );
                }

                // Email notification to client
                if ($client->email && $client->email_notifications !== false) {
                    try {
                        Mail::raw(
                            "Bonjour {$client->name},\n\n" .
                            "Bonne nouvelle ! {$user->name} a fait une offre pour votre tâche \"{$task->title}\".\n\n" .
                            ($offer->price ? "Prix proposé : {$offer->price}€\n\n" : "") .
                            "Connectez-vous pour voir les détails et accepter l'offre :\n" .
                            config('app.frontend_url') . "/tasks/{$task->id}\n\n" .
                            "L'équipe ProchePro",
                            function ($mail) use ($client) {
                                $mail->to($client->email)
                                    ->subject('Nouvelle offre pour votre tâche - ProchePro');
                            }
                        );
                    } catch (\Exception $e) {
                        \Log::error('Failed to send new offer email: ' . $e->getMessage());
                    }
                }

                // SMS notification to client
                if ($client->phone && $client->sms_notifications_enabled) {
                    $smsService = new SmsService();
                    $smsService->sendNewOfferSms($client->phone, $client->name, $task->title);
                }
                
                // Telegram notification to client
                TelegramNotificationService::notifyNewOffer($client, $offer);
            }
        }

        // Fire event for email automation
        event(new OfferCreated($offer));

        // Check if prestataire needs to connect Stripe
        $needsStripe = empty($user->stripe_account_id);

        return response()->json([
            'offer' => $offer,
            'prestataire_needs_stripe' => $needsStripe,
        ], 201);
    }

    /**
     * Accept an offer - requires payment first
     * This method now only validates and returns payment info
     * Actual acceptance happens after payment via confirmAcceptWithPayment
     */
    public function accept(Request $request, Task $task, Offer $offer): JsonResponse
    {
        if ($offer->task_id !== $task->id) {
            return response()->json([
                'message' => 'Cette offre ne correspond pas à cette tâche.',
            ], 422);
        }

        // Check if prestataire has bank details (warning only, not blocking)
        $prestataire = User::find($offer->prestataire_id);
        $bankDetailsWarning = null;
        if ($prestataire && empty($prestataire->iban)) {
            $bankDetailsWarning = 'Le prestataire doit renseigner ses coordonnées bancaires pour recevoir les paiements automatiquement.';
        }

        // Check if offer has a price
        if (!$offer->price || $offer->price <= 0) {
            return response()->json([
                'message' => 'Cette offre n\'a pas de prix défini.',
                'error_code' => 'no_price',
            ], 422);
        }

        // Return payment required response - frontend should redirect to payment
        return response()->json([
            'message' => 'Paiement requis pour accepter cette offre.',
            'payment_required' => true,
            'offer_id' => $offer->id,
            'task_id' => $task->id,
            'amount' => $offer->price,
            'prestataire_id' => $offer->prestataire_id,
            'prestataire_name' => $prestataire?->name,
            'bank_details_warning' => $bankDetailsWarning,
        ]);
    }

    /**
     * Confirm offer acceptance after successful payment
     * Called by PaymentController after payment is confirmed
     */
    public function confirmAcceptAfterPayment(Task $task, Offer $offer): void
    {
        // Позначаємо вибраний офер як accepted
        $offer->update(['status' => 'accepted']);

        // Всі інші офери цієї задачі робимо rejected
        Offer::where('task_id', $task->id)
            ->where('id', '!=', $offer->id)
            ->update(['status' => 'rejected']);

        // Переводимо задачу в статус in_progress
        $task->update(['status' => 'in_progress']);

        // Створюємо сповіщення для виконавця про прийняття його оферу
        if ($offer->prestataire_id) {
            Notification::create([
                'user_id' => (int) $offer->prestataire_id,
                'type' => 'offer_accepted',
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'offer_id' => $offer->id,
                ],
            ]);

            $prestataire = User::find($offer->prestataire_id);
            if ($prestataire) {
                // Push notification
                if ($prestataire->push_notifications !== false) {
                    $webPush = new WebPushService();
                    $webPush->sendToUser(
                        $prestataire,
                        'Offre acceptée ! 🎉',
                        "Votre offre pour \"{$task->title}\" a été acceptée",
                        '/messages/' . $task->id,
                        'offer-accepted-' . $offer->id
                    );
                }

                // Email-сповіщення виконавцю (якщо увімкнено)
                if ($prestataire->email && $prestataire->email_notifications !== false) {
                    Mail::to($prestataire->email)->queue(new OfferAcceptedMail([
                        'task_id' => $task->id,
                        'task_title' => $task->title,
                    ]));
                }

                // SMS notification to prestataire
                if ($prestataire->phone && $prestataire->sms_notifications_enabled) {
                    $smsService = new SmsService();
                    $client = User::find($task->client_id);
                    $smsService->sendOfferAcceptedSms($prestataire->phone, $client?->name ?? 'Client', $task->title);
                }
                
                // Telegram notification to prestataire
                TelegramNotificationService::notifyOfferAccepted($prestataire, $offer);
            }
        }
    }

    public function withdraw(Task $task, Offer $offer): JsonResponse
    {
        if ($offer->task_id !== $task->id) {
            return response()->json([
                'message' => 'Cette offre ne correspond pas à cette tâche.',
            ], 422);
        }

        // Only allow withdrawing pending offers
        if ($offer->status !== 'pending') {
            return response()->json([
                'message' => 'Seules les offres en attente peuvent être retirées.',
            ], 422);
        }

        $offer->update(['status' => 'withdrawn']);

        // Notify client
        if ($task->client_id) {
            Notification::create([
                'user_id' => $task->client_id,
                'type' => 'offer_withdrawn',
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'offer_id' => $offer->id,
                ],
            ]);

            // Push notification
            $client = User::find($task->client_id);
            if ($client && $client->push_notifications !== false) {
                $webPush = new WebPushService();
                $webPush->sendToUser(
                    $client,
                    'Offre retirée',
                    "Une offre pour \"{$task->title}\" a été retirée",
                    '/tasks/' . $task->id,
                    'offer-withdrawn-' . $offer->id
                );
            }
        }

        return response()->json([
            'message' => 'Offre retirée avec succès.',
            'offer' => $offer->fresh(),
        ]);
    }
}
