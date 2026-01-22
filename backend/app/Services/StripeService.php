<?php

namespace App\Services;

use App\Models\Task;
use App\Models\Payment;
use App\Models\User;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Checkout\Session;
use Stripe\Transfer;

class StripeService
{
    public function __construct()
    {
        $apiKey = config('services.stripe.secret');
        if (!$apiKey) {
            throw new \Exception('Stripe API key is not configured');
        }
        Stripe::setApiKey($apiKey);
    }

    /**
     * Create a Stripe Checkout Session for task payment
     * @param Task $task
     * @param float $totalAmount Total amount to charge (including fees)
     * @param float $baseAmount Original amount for prestataire (without fees)
     * @param int|null $offerId The offer being accepted (for escrow payment)
     */
    public function createCheckoutSession(Task $task, float $totalAmount, float $baseAmount, ?int $offerId = null): array
    {
        // Get prestataire from accepted offer
        $offer = \App\Models\Offer::find($offerId);
        $prestataire = $offer ? User::find($offer->prestataire_id) : null;
        
        // Calculate platform commission: 0% for first 3 orders, 10% after
        $platformFee = 0;
        if ($prestataire && $prestataire->completed_orders_count >= 3) {
            $platformFee = round($baseAmount * 0.10, 2); // 10% commission
        }
        
        $fee = round($totalAmount - $baseAmount, 2);
        
        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => "Paiement pour: {$task->title}",
                        'description' => "Montant prestataire: {$baseAmount}€ + Frais: {$fee}€",
                    ],
                    'unit_amount' => (int) round($totalAmount * 100), // Stripe uses cents
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => config('app.frontend_url') . "/tasks/{$task->id}?payment=success&offer_id=" . ($offerId ?? ''),
            'cancel_url' => config('app.frontend_url') . "/tasks/{$task->id}?payment=cancelled",
            'metadata' => [
                'task_id' => $task->id,
                'client_id' => $task->client_id,
                'offer_id' => $offerId, // Offer to accept after payment
                'base_amount' => $baseAmount, // Amount for prestataire
                'total_amount' => $totalAmount,
                'fee' => $fee,
                'platform_fee' => $platformFee, // 0% or 10% commission
                'prestataire_id' => $prestataire?->id,
                'completed_orders' => $prestataire?->completed_orders_count ?? 0,
            ],
            // Application fee for Stripe Connect (platform commission)
            'payment_intent_data' => $platformFee > 0 && $prestataire?->stripe_account_id ? [
                'application_fee_amount' => (int) round($platformFee * 100),
                'transfer_data' => [
                    'destination' => $prestataire->stripe_account_id,
                ],
            ] : [],
        ]);

        return [
            'session_id' => $session->id,
            'url' => $session->url,
            'platform_fee' => $platformFee,
            'prestataire_receives' => $baseAmount - $platformFee,
        ];
    }

    /**
     * Calculate platform commission based on prestataire's completed orders
     * First 3 orders: 0% commission
     * 4+ orders: 10% commission
     */
    public function calculatePlatformFee(User $prestataire, float $amount): float
    {
        if ($prestataire->completed_orders_count < 3) {
            return 0; // 0% for first 3 orders
        }
        return round($amount * 0.10, 2); // 10% for subsequent orders
    }

    /**
     * Get prestataire commission info
     */
    public function getPrestataireCommissionInfo(User $prestataire): array
    {
        $completedOrders = $prestataire->completed_orders_count;
        $commissionRate = $completedOrders < 3 ? 0 : 10;
        $ordersUntilCommission = $completedOrders < 3 ? (3 - $completedOrders) : 0;
        
        return [
            'completed_orders' => $completedOrders,
            'commission_rate' => $commissionRate,
            'orders_until_commission' => $ordersUntilCommission,
            'status' => $completedOrders < 3 ? 'free_trial' : 'standard',
        ];

    }

    /**
     * Create a Payment Intent for custom payment flow
     */
    public function createPaymentIntent(Task $task, int $amount): PaymentIntent
    {
        return PaymentIntent::create([
            'amount' => $amount * 100,
            'currency' => 'eur',
            'metadata' => [
                'task_id' => $task->id,
                'client_id' => $task->client_id,
            ],
        ]);
    }

    /**
     * Retrieve a Payment Intent
     */
    public function retrievePaymentIntent(string $paymentIntentId): PaymentIntent
    {
        return PaymentIntent::retrieve($paymentIntentId);
    }

    /**
     * Handle successful payment
     */
    public function handleSuccessfulPayment(Task $task, string $stripePaymentId, int $amount): Payment
    {
        $payment = Payment::create([
            'task_id' => $task->id,
            'client_id' => $task->client_id,
            'prestataire_id' => $task->prestataire_id,
            'amount' => $amount,
            'status' => 'completed',
            'stripe_payment_id' => $stripePaymentId,
            'paid_at' => now(),
        ]);

        // Update task status if needed
        if ($task->status === 'assigned') {
            $task->update(['status' => 'in_progress']);
        }

        return $payment;
    }

    /**
     * Process refund
     */
    public function refund(string $paymentIntentId, ?int $amount = null): \Stripe\Refund
    {
        $params = ['payment_intent' => $paymentIntentId];
        
        if ($amount !== null) {
            $params['amount'] = $amount * 100;
        }

        return \Stripe\Refund::create($params);
    }

    /**
     * Transfer funds to prestataire's connected account
     * Called when client confirms task completion
     * 
     * @param Payment $payment The payment record
     * @param User $prestataire The prestataire to pay
     * @return Transfer|null
     */
    public function transferToPrestataire(Payment $payment, User $prestataire): ?Transfer
    {
        if (!$prestataire->stripe_account_id) {
            throw new \Exception('Le prestataire n\'a pas de compte Stripe configuré');
        }

        if ($prestataire->stripe_account_status !== 'active') {
            throw new \Exception('Le compte Stripe du prestataire n\'est pas actif');
        }

        // Amount in cents
        $amountCents = (int) round($payment->amount * 100);

        $transfer = Transfer::create([
            'amount' => $amountCents,
            'currency' => 'eur',
            'destination' => $prestataire->stripe_account_id,
            'transfer_group' => 'task_' . $payment->task_id,
            'metadata' => [
                'payment_id' => $payment->id,
                'task_id' => $payment->task_id,
                'prestataire_id' => $prestataire->id,
            ],
        ]);

        return $transfer;
    }

    /**
     * Check if prestataire can receive payments
     */
    public function canReceivePayments(User $prestataire): bool
    {
        if (!$prestataire->stripe_account_id) {
            return false;
        }

        try {
            $account = \Stripe\Account::retrieve($prestataire->stripe_account_id);
            return $account->payouts_enabled && $account->charges_enabled;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get prestataire's Stripe account balance
     */
    public function getAccountBalance(User $prestataire): ?array
    {
        if (!$prestataire->stripe_account_id) {
            return null;
        }

        try {
            $balance = \Stripe\Balance::retrieve([
                'stripe_account' => $prestataire->stripe_account_id,
            ]);

            return [
                'available' => collect($balance->available)->sum('amount') / 100,
                'pending' => collect($balance->pending)->sum('amount') / 100,
                'currency' => 'EUR',
            ];
        } catch (\Exception $e) {
            return null;
        }
    }
}
