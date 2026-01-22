<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromotionPackage;
use App\Models\PromotionPurchase;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;
use Carbon\Carbon;

class PromotionController extends Controller
{
    /**
     * Get all active packages for public view
     */
    public function packages(): JsonResponse
    {
        $packages = PromotionPackage::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('days')
            ->get();

        return response()->json($packages);
    }

    /**
     * Get user's promotion purchases
     */
    public function myPurchases(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $purchases = PromotionPurchase::where('user_id', $validated['user_id'])
            ->with(['task', 'package'])
            ->latest()
            ->get();

        return response()->json($purchases);
    }

    /**
     * Create Stripe checkout session for package purchase
     */
    public function createCheckout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package_id' => ['required', 'integer', 'exists:promotion_packages,id'],
            'task_id' => ['required', 'integer', 'exists:tasks,id'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $package = PromotionPackage::findOrFail($validated['package_id']);
        $task = Task::findOrFail($validated['task_id']);

        if (!$package->is_active) {
            return response()->json([
                'message' => 'This package is not available',
            ], 400);
        }

        // Verify task belongs to user
        if ($task->client_id !== $validated['user_id']) {
            return response()->json([
                'message' => 'You can only promote your own tasks',
            ], 403);
        }

        // Create pending purchase record
        $purchase = PromotionPurchase::create([
            'user_id' => $validated['user_id'],
            'task_id' => $validated['task_id'],
            'package_id' => $package->id,
            'days' => $package->days,
            'price' => $package->price,
            'is_free' => false,
            'status' => 'pending',
        ]);

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => $package->name,
                            'description' => $package->description ?? "Promouvoir l'annonce: {$task->title}",
                        ],
                        'unit_amount' => (int) ($package->price * 100),
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => config('app.frontend_url') . '/dashboard/promotions?session_id={CHECKOUT_SESSION_ID}&success=true',
                'cancel_url' => config('app.frontend_url') . '/pricing?cancelled=true',
                'client_reference_id' => (string) $purchase->id,
                'metadata' => [
                    'purchase_id' => $purchase->id,
                    'task_id' => $task->id,
                    'user_id' => $validated['user_id'],
                    'type' => 'promotion',
                ],
            ]);

            $purchase->payment_intent_id = $session->id;
            $purchase->save();

            return response()->json([
                'url' => $session->url,
                'session_id' => $session->id,
                'purchase_id' => $purchase->id,
            ]);

        } catch (\Exception $e) {
            $purchase->delete();

            \Log::error('Promotion checkout error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'package_id' => $package->id,
                'task_id' => $task->id,
                'user_id' => $validated['user_id'],
            ]);

            return response()->json([
                'message' => 'Failed to create checkout session',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Stripe webhook handler for promotion payments
     */
    public function stripeWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $purchaseId = $session->metadata->purchase_id ?? null;

            if ($purchaseId) {
                $purchase = PromotionPurchase::find($purchaseId);

                if ($purchase && $purchase->status === 'pending') {
                    $startsAt = Carbon::now();
                    $expiresAt = $startsAt->copy()->addDays($purchase->days);

                    $purchase->status = 'completed';
                    $purchase->starts_at = $startsAt;
                    $purchase->expires_at = $expiresAt;
                    $purchase->save();

                    // Apply promotion to task
                    $purchase->applyToTask();
                }
            }
        }

        return response()->json(['status' => 'success']);
    }
}
