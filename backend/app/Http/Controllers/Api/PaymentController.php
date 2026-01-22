<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PaymentStatusChangedMail;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Task;
use App\Models\User;
use App\Services\StripeService;
use App\Services\WebPushService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected ?StripeService $stripeService = null;

    public function __construct()
    {
        // StripeService is optional - only initialize if Stripe is configured
        if (config('services.stripe.secret')) {
            try {
                $this->stripeService = app(StripeService::class);
            } catch (\Exception $e) {
                // Stripe not configured, continue without it
            }
        }
    }

    public function showForTask(Task $task): JsonResponse
    {
        $payment = Payment::query()
            ->where('task_id', $task->id)
            ->latest()
            ->first();

        return response()->json($payment);
    }

    /**
     * Create Stripe Checkout Session
     */
    public function createCheckoutSession(Request $request, Task $task): JsonResponse
    {
        if (!$this->stripeService) {
            return response()->json([
                'message' => 'Stripe n\'est pas configuré. Utilisez le paiement simulé.',
            ], 400);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'base_amount' => ['nullable', 'numeric', 'min:0'], // Original amount for prestataire
            'offer_id' => ['required', 'integer', 'exists:offers,id'], // Offer being accepted
        ]);

        $baseAmount = $validated['base_amount'] ?? $validated['amount'];

        try {
            $session = $this->stripeService->createCheckoutSession(
                $task, 
                (float) $validated['amount'],
                (float) $baseAmount,
                (int) $validated['offer_id']
            );
            
            return response()->json($session);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de la session de paiement.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Stripe webhook
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                $this->handleSuccessfulCheckout($session);
                break;
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $this->handleSuccessfulPayment($paymentIntent);
                break;
        }

        return response()->json(['status' => 'success']);
    }

    protected function handleSuccessfulCheckout($session): void
    {
        $taskId = $session->metadata->task_id ?? null;
        $clientId = $session->metadata->client_id ?? null;
        $offerId = $session->metadata->offer_id ?? null;
        $baseAmount = $session->metadata->base_amount ?? null; // Amount for prestataire
        $paymentMethod = $session->metadata->payment_method ?? 'online'; // online or cash

        if (!$taskId) return;

        $task = Task::find($taskId);
        if (!$task) return;

        // Get offer from metadata or find accepted one
        $offer = null;
        if ($offerId) {
            $offer = \App\Models\Offer::find($offerId);
            
            // Accept the offer after successful payment (escrow model)
            if ($offer && $offer->status === 'pending') {
                $offerController = new \App\Http\Controllers\Api\OfferController();
                $offerController->confirmAcceptAfterPayment($task, $offer);
            }
        }
        
        // Get accepted offer (either just accepted or previously accepted)
        $acceptedOffer = $offer ?? \App\Models\Offer::where('task_id', $taskId)
            ->where('status', 'accepted')
            ->first();

        $prestataireId = $acceptedOffer?->prestataire_id;

        // Handle cash payment differently
        if ($paymentMethod === 'cash') {
            $totalAmount = (float) ($session->metadata->total_amount ?? 0);
            $platformFee = (float) ($session->metadata->platform_fee ?? 0);
            $providerAmount = (float) ($session->metadata->provider_amount ?? 0);

            $payment = Payment::create([
                'task_id' => $task->id,
                'client_id' => $clientId,
                'prestataire_id' => $prestataireId,
                'amount' => $totalAmount, // Full task amount
                'platform_fee' => $platformFee, // 10% commission paid
                'provider_amount' => $providerAmount, // Amount prestataire will receive in cash
                'currency' => 'EUR',
                'status' => 'authorized', // Waiting for cash exchange
                'payment_method' => 'cash',
                'provider' => 'stripe',
                'provider_payment_id' => $session->payment_intent,
            ]);

            // Notify prestataire about cash payment
            if ($prestataireId) {
                Notification::create([
                    'user_id' => $prestataireId,
                    'type' => 'cash_payment_confirmed',
                    'data' => [
                        'task_id' => $task->id,
                        'task_title' => $task->title,
                        'amount' => $providerAmount,
                        'message' => "Le client a choisi le paiement en espèces. Vous recevrez {$providerAmount}€ en main propre.",
                    ],
                ]);

                $prestataire = User::find($prestataireId);
                if ($prestataire && $prestataire->push_notifications !== false) {
                    $webPush = new WebPushService();
                    $webPush->sendToUser(
                        $prestataire,
                        'Paiement en espèces 💵',
                        "Vous recevrez {$providerAmount}€ en espèces pour \"{$task->title}\"",
                        '/tasks/' . $task->id,
                        'cash-payment-' . $payment->id
                    );
                }
            }

            return;
        }

        // Standard online payment
        $totalPaid = $session->amount_total / 100; // Total paid by client
        $prestataireAmount = $baseAmount ? (float) $baseAmount : $totalPaid;

        $payment = Payment::create([
            'task_id' => $task->id,
            'client_id' => $clientId,
            'prestataire_id' => $prestataireId,
            'amount' => $prestataireAmount, // Amount for prestataire (without fees)
            'currency' => 'EUR',
            'status' => 'authorized', // Payment authorized, waiting for task completion
            'payment_method' => 'online',
            'provider' => 'stripe',
            'provider_payment_id' => $session->payment_intent,
        ]);

        // Create notification for prestataire
        if ($prestataireId) {
            Notification::create([
                'user_id' => $prestataireId,
                'type' => 'payment_received',
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'amount' => $prestataireAmount,
                ],
            ]);

            // Push notification
            $prestataire = User::find($prestataireId);
            if ($prestataire && $prestataire->push_notifications !== false) {
                $webPush = new WebPushService();
                $webPush->sendToUser(
                    $prestataire,
                    'Paiement reçu 💰',
                    "Paiement de {$prestataireAmount}€ reçu pour \"{$task->title}\"",
                    '/dashboard',
                    'payment-' . $payment->id
                );
            }
        }
    }

    protected function handleSuccessfulPayment($paymentIntent): void
    {
        // Additional handling if needed
    }

    public function payForTask(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => ['required', 'integer', 'exists:users,id'],
            'prestataire_id' => ['required', 'integer', 'exists:users,id'],
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        $payment = Payment::create([
            'task_id' => $task->id,
            'client_id' => $validated['client_id'],
            'prestataire_id' => $validated['prestataire_id'],
            'amount' => $validated['amount'],
            'currency' => 'EUR',
            'status' => 'authorized',
            'provider' => 'fake',
            'provider_payment_id' => null,
        ]);

        // Сповіщення про авторизацію платежу для клієнта
        Notification::create([
            'user_id' => (int) $validated['client_id'],
            'type' => 'payment_status_changed',
            'data' => [
                'task_id' => $task->id,
                'task_title' => $task->title,
                'status' => 'authorized',
                'amount' => $validated['amount'],
            ],
        ]);

        $client = User::find($validated['client_id']);
        if ($client) {
            // Push notification
            if ($client->push_notifications !== false) {
                $webPush = new WebPushService();
                $webPush->sendToUser(
                    $client,
                    'Paiement autorisé',
                    "Votre paiement de {$validated['amount']}€ pour \"{$task->title}\" a été autorisé",
                    '/tasks/' . $task->id,
                    'payment-auth-' . $payment->id
                );
            }

            // Email notification
            if ($client->email && $client->email_notifications !== false) {
                Mail::to($client->email)->queue(new PaymentStatusChangedMail([
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'status' => 'authorized',
                    'amount' => $validated['amount'],
                ]));
            }
        }

        return response()->json($payment, 201);
    }

    /**
     * Confirm payment after Stripe redirect (fallback if webhook didn't process)
     */
    public function confirmPayment(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        // Check if payment already exists
        $existingPayment = Payment::where('task_id', $task->id)
            ->whereIn('status', ['authorized', 'captured', 'completed'])
            ->first();

        if ($existingPayment) {
            return response()->json($existingPayment);
        }

        // Get accepted offer to find amount and prestataire
        $acceptedOffer = \App\Models\Offer::where('task_id', $task->id)
            ->where('status', 'accepted')
            ->first();

        if (!$acceptedOffer) {
            return response()->json([
                'message' => 'Aucune offre acceptée trouvée.',
            ], 422);
        }

        $amount = $acceptedOffer->price ?? $task->budget_max ?? $task->budget_min ?? 0;

        // Create payment record
        $payment = Payment::create([
            'task_id' => $task->id,
            'client_id' => $validated['client_id'],
            'prestataire_id' => $acceptedOffer->prestataire_id,
            'amount' => $amount,
            'currency' => 'EUR',
            'status' => 'authorized',
            'provider' => 'stripe',
            'provider_payment_id' => null,
        ]);

        // Create notification for prestataire
        Notification::create([
            'user_id' => $acceptedOffer->prestataire_id,
            'type' => 'payment_received',
            'data' => [
                'task_id' => $task->id,
                'task_title' => $task->title,
                'amount' => $amount,
            ],
        ]);

        return response()->json($payment, 201);
    }

    /**
     * Release payment to prestataire after client confirms task completion
     * This triggers the actual transfer to prestataire's Stripe Connect account
     */
    public function releasePayment(Request $request, Task $task): JsonResponse
    {
        $user = $request->user();

        // Only client can release payment
        if (!$user || $user->id !== $task->client_id) {
            return response()->json([
                'message' => 'Seul le client peut libérer le paiement.',
            ], 403);
        }

        // Find the authorized payment
        $payment = Payment::where('task_id', $task->id)
            ->where('status', 'authorized')
            ->first();

        if (!$payment) {
            return response()->json([
                'message' => 'Aucun paiement autorisé trouvé pour cette tâche.',
            ], 404);
        }

        // Get prestataire
        $prestataire = User::find($payment->prestataire_id);
        if (!$prestataire) {
            return response()->json([
                'message' => 'Prestataire non trouvé.',
            ], 404);
        }

        // Check if prestataire has Stripe Connect account
        if (!$prestataire->stripe_account_id) {
            // Fallback: mark as completed but manual payout needed
            $payment->update([
                'status' => 'completed',
            ]);

            // Notify admin for manual payout
            Notification::create([
                'user_id' => User::where('is_admin', true)->first()?->id ?? 1,
                'type' => 'manual_payout_needed',
                'data' => [
                    'payment_id' => $payment->id,
                    'task_id' => $task->id,
                    'prestataire_id' => $prestataire->id,
                    'prestataire_name' => $prestataire->name,
                    'amount' => $payment->amount,
                    'reason' => 'Prestataire sans compte Stripe Connect',
                ],
            ]);

            return response()->json([
                'message' => 'Paiement confirmé. Le prestataire sera payé manuellement (pas de compte Stripe).',
                'payment' => $payment,
                'transfer_status' => 'manual',
            ]);
        }

        // Try to transfer via Stripe Connect
        try {
            if (!$this->stripeService) {
                throw new \Exception('Stripe non configuré');
            }

            $transfer = $this->stripeService->transferToPrestataire($payment, $prestataire);

            // Update payment status
            $payment->update([
                'status' => 'completed',
                'provider_transfer_id' => $transfer->id,
            ]);

            // Update task status
            $task->update(['status' => 'completed']);
            
            // Increment completed_orders_count for prestataire (for commission tracking)
            if ($prestataire) {
                $prestataire->increment('completed_orders_count');
            }

            // Notify prestataire
            Notification::create([
                'user_id' => $prestataire->id,
                'type' => 'payment_released',
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'amount' => $payment->amount,
                ],
            ]);

            // Push notification
            if ($prestataire->push_notifications !== false) {
                $webPush = new WebPushService();
                $webPush->sendToUser(
                    $prestataire,
                    'Paiement reçu ! 💰',
                    "{$payment->amount}€ ont été transférés sur votre compte pour \"{$task->title}\"",
                    '/dashboard',
                    'payment-released-' . $payment->id
                );
            }

            // Email notification
            if ($prestataire->email && $prestataire->email_notifications !== false) {
                Mail::to($prestataire->email)->queue(new PaymentStatusChangedMail([
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'status' => 'released',
                    'amount' => $payment->amount,
                ]));
            }

            return response()->json([
                'message' => 'Paiement libéré avec succès !',
                'payment' => $payment,
                'transfer_id' => $transfer->id,
                'transfer_status' => 'completed',
            ]);

        } catch (\Exception $e) {
            // Log error but still mark as needing manual payout
            \Log::error('Stripe transfer failed: ' . $e->getMessage(), [
                'payment_id' => $payment->id,
                'prestataire_id' => $prestataire->id,
            ]);

            $payment->update([
                'status' => 'transfer_failed',
            ]);

            // Notify admin
            Notification::create([
                'user_id' => User::where('is_admin', true)->first()?->id ?? 1,
                'type' => 'transfer_failed',
                'data' => [
                    'payment_id' => $payment->id,
                    'task_id' => $task->id,
                    'prestataire_id' => $prestataire->id,
                    'error' => $e->getMessage(),
                    'amount' => $payment->amount,
                ],
            ]);

            return response()->json([
                'message' => 'Erreur lors du transfert. L\'équipe sera notifiée.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create Checkout Session for cash payment (10% platform fee only)
     */
    public function createCashCheckoutSession(Request $request, Task $task): JsonResponse
    {
        if (!$this->stripeService) {
            return response()->json([
                'message' => 'Stripe n\'est pas configuré.',
            ], 400);
        }

        $validated = $request->validate([
            'total_amount' => ['required', 'numeric', 'min:1'], // Full task amount
            'offer_id' => ['required', 'integer', 'exists:offers,id'],
        ]);

        // Get prestataire to check commission rate
        $offer = \App\Models\Offer::find($validated['offer_id']);
        $prestataire = $offer ? User::find($offer->prestataire_id) : null;
        
        $totalAmount = (float) $validated['total_amount'];
        
        // CASH payments: ALWAYS 15% commission (no free orders for cash)
        $platformFee = round($totalAmount * 0.15, 2); // 15% commission for cash
        
        // Stripe minimum is 0.50€
        if ($platformFee < 0.50) {
            $platformFee = 0.50;
        }
        
        $providerAmount = $totalAmount - $platformFee; // Amount prestataire will receive in cash

        try {
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => "Commission ProchePro - {$task->title}",
                            'description' => "Commission de 15% pour paiement en espèces. Le prestataire recevra {$providerAmount}€ en espèces.",
                        ],
                        'unit_amount' => (int) round($platformFee * 100),
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => config('app.frontend_url') . '/tasks/' . $task->id . '?payment=cash_success',
                'cancel_url' => config('app.frontend_url') . '/tasks/' . $task->id . '?payment=cancelled',
                'metadata' => [
                    'task_id' => $task->id,
                    'client_id' => $task->client_id,
                    'offer_id' => $validated['offer_id'],
                    'payment_method' => 'cash',
                    'total_amount' => $totalAmount,
                    'platform_fee' => $platformFee,
                    'provider_amount' => $providerAmount,
                ],
            ]);

            return response()->json([
                'url' => $session->url,
                'session_id' => $session->id,
                'platform_fee' => $platformFee,
                'provider_amount' => $providerAmount,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de la session.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Prestataire confirms cash receipt from client
     */
    public function confirmCashReceived(Request $request, Task $task): JsonResponse
    {
        $user = $request->user();

        // Get accepted offer
        $acceptedOffer = \App\Models\Offer::where('task_id', $task->id)
            ->where('status', 'accepted')
            ->first();

        if (!$acceptedOffer) {
            return response()->json([
                'message' => 'Aucune offre acceptée trouvée.',
            ], 404);
        }

        // Only prestataire can confirm cash receipt
        if (!$user || $user->id !== $acceptedOffer->prestataire_id) {
            return response()->json([
                'message' => 'Seul le prestataire peut confirmer la réception.',
            ], 403);
        }

        // Check if payment exists and is cash
        $payment = Payment::where('task_id', $task->id)
            ->where('payment_method', 'cash')
            ->first();

        if (!$payment) {
            return response()->json([
                'message' => 'Aucun paiement en espèces trouvé.',
            ], 404);
        }

        // Update task with cash received timestamp
        $task->update([
            'cash_received_at' => now(),
        ]);

        // Notify client that prestataire received cash
        Notification::create([
            'user_id' => $task->client_id,
            'type' => 'cash_received_by_prestataire',
            'data' => [
                'task_id' => $task->id,
                'task_title' => $task->title,
                'amount' => $payment->provider_amount,
                'prestataire_name' => $user->name,
            ],
        ]);

        // Push notification to client
        $client = User::find($task->client_id);
        if ($client && $client->push_notifications !== false) {
            $webPush = new WebPushService();
            $webPush->sendToUser(
                $client,
                'Paiement reçu ✓',
                "{$user->name} a confirmé avoir reçu le paiement en espèces pour \"{$task->title}\"",
                '/tasks/' . $task->id,
                'cash-received-' . $task->id
            );
        }

        return response()->json([
            'message' => 'Réception du paiement confirmée.',
            'task' => $task->fresh(),
        ]);
    }

    /**
     * Client confirms task completion for cash payment
     */
    public function confirmCashTaskCompletion(Request $request, Task $task): JsonResponse
    {
        $user = $request->user();

        // Only client can confirm
        if (!$user || $user->id !== $task->client_id) {
            return response()->json([
                'message' => 'Seul le client peut confirmer.',
            ], 403);
        }

        // Check if payment is cash
        $payment = Payment::where('task_id', $task->id)
            ->where('payment_method', 'cash')
            ->first();

        if (!$payment) {
            return response()->json([
                'message' => 'Aucun paiement en espèces trouvé.',
            ], 404);
        }

        // Check if prestataire confirmed cash receipt
        if (!$task->cash_received_at) {
            return response()->json([
                'message' => 'Le prestataire n\'a pas encore confirmé la réception du paiement.',
            ], 400);
        }

        // Update task and payment
        $task->update([
            'status' => 'completed',
            'cash_confirmed_by_client_at' => now(),
        ]);

        $payment->update([
            'status' => 'completed',
        ]);
        
        // Get prestataire and increment completed orders
        $acceptedOffer = \App\Models\Offer::where('task_id', $task->id)
            ->where('status', 'accepted')
            ->first();

        if ($acceptedOffer) {
            $prestataire = User::find($acceptedOffer->prestataire_id);
            
            // Increment completed_orders_count for commission tracking
            if ($prestataire) {
                $prestataire->increment('completed_orders_count');
            }

            // Notify prestataire
            Notification::create([
                'user_id' => $prestataire->id,
                'type' => 'task_completed',
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'payment_method' => 'cash',
                ],
            ]);

            // Push notification
            if ($prestataire && $prestataire->push_notifications !== false) {
                $webPush = new WebPushService();
                $webPush->sendToUser(
                    $prestataire,
                    'Tâche terminée ! 🎉',
                    "La tâche \"{$task->title}\" a été marquée comme terminée.",
                    '/tasks/' . $task->id,
                    'task-completed-' . $task->id
                );
            }
        }

        return response()->json([
            'message' => 'Tâche terminée avec succès !',
            'task' => $task->fresh(),
            'payment' => $payment,
        ]);
    }

    /**
     * Check if prestataire can receive automatic payments
     */
    public function checkPrestatairePayoutStatus(Request $request, int $prestataireId): JsonResponse
    {
        $prestataire = User::find($prestataireId);

        if (!$prestataire) {
            return response()->json(['can_receive' => false, 'reason' => 'not_found']);
        }

        if (!$prestataire->stripe_account_id) {
            return response()->json([
                'can_receive' => false,
                'reason' => 'no_stripe_account',
                'message' => 'Le prestataire n\'a pas configuré son compte de paiement.',
            ]);
        }

        if ($prestataire->stripe_account_status !== 'active') {
            return response()->json([
                'can_receive' => false,
                'reason' => 'account_not_active',
                'status' => $prestataire->stripe_account_status,
                'message' => 'Le compte de paiement du prestataire n\'est pas encore actif.',
            ]);
        }

        // Verify with Stripe
        if ($this->stripeService) {
            $canReceive = $this->stripeService->canReceivePayments($prestataire);
            return response()->json([
                'can_receive' => $canReceive,
                'reason' => $canReceive ? 'ready' : 'stripe_not_ready',
            ]);
        }

        return response()->json([
            'can_receive' => true,
            'reason' => 'ready',
        ]);
    }
}
