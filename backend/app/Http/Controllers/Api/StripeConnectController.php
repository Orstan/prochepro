<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Account;
use Stripe\AccountLink;

class StripeConnectController extends Controller
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
     * Create a Stripe Connect account for prestataire and return onboarding URL
     */
    public function createConnectAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        // Check if user already has a Stripe account
        if ($user->stripe_account_id) {
            // Check account status and return appropriate response
            try {
                $account = Account::retrieve($user->stripe_account_id);
                
                if ($account->details_submitted) {
                    return response()->json([
                        'message' => 'Compte Stripe déjà configuré',
                        'status' => 'active',
                        'payouts_enabled' => $account->payouts_enabled,
                        'charges_enabled' => $account->charges_enabled,
                    ]);
                }
                
                // Account exists but onboarding not complete - create new link
                $accountLink = $this->createAccountLink($user->stripe_account_id);
                
                return response()->json([
                    'url' => $accountLink->url,
                    'status' => 'pending',
                ]);
            } catch (\Exception $e) {
                // Account doesn't exist anymore, create new one
                $user->update([
                    'stripe_account_id' => null,
                    'stripe_account_status' => null,
                ]);
            }
        }

        try {
            // Create Express account for the prestataire
            $account = Account::create([
                'type' => 'express',
                'country' => 'FR',
                'email' => $user->email,
                'capabilities' => [
                    'card_payments' => ['requested' => true],
                    'transfers' => ['requested' => true],
                ],
                'business_type' => 'individual',
                'business_profile' => [
                    'mcc' => '7299', // Miscellaneous Personal Services
                    'url' => config('app.frontend_url') . '/prestataires/' . $user->id,
                ],
                'metadata' => [
                    'user_id' => $user->id,
                    'platform' => 'prochepro',
                ],
            ]);

            // Save account ID to user
            $user->update([
                'stripe_account_id' => $account->id,
                'stripe_account_status' => 'pending',
            ]);

            // Create account link for onboarding
            $accountLink = $this->createAccountLink($account->id);

            return response()->json([
                'url' => $accountLink->url,
                'account_id' => $account->id,
                'status' => 'pending',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du compte Stripe',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create account link for onboarding
     */
    private function createAccountLink(string $accountId): AccountLink
    {
        return AccountLink::create([
            'account' => $accountId,
            'refresh_url' => config('app.frontend_url') . '/profile/bank?refresh=true',
            'return_url' => config('app.frontend_url') . '/profile/bank?success=true',
            'type' => 'account_onboarding',
        ]);
    }

    /**
     * Get Stripe Connect account status
     */
    public function getAccountStatus(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        if (!$user->stripe_account_id) {
            return response()->json([
                'has_account' => false,
                'status' => null,
                'payouts_enabled' => false,
                'charges_enabled' => false,
            ]);
        }

        try {
            $account = Account::retrieve($user->stripe_account_id);

            // Update local status if changed
            $newStatus = $account->details_submitted ? 'active' : 'pending';
            if ($account->requirements->disabled_reason) {
                $newStatus = 'restricted';
            }

            if ($user->stripe_account_status !== $newStatus) {
                $user->update([
                    'stripe_account_status' => $newStatus,
                    'stripe_onboarding_completed_at' => $account->details_submitted ? now() : null,
                ]);
            }

            return response()->json([
                'has_account' => true,
                'status' => $newStatus,
                'payouts_enabled' => $account->payouts_enabled,
                'charges_enabled' => $account->charges_enabled,
                'details_submitted' => $account->details_submitted,
                'requirements' => [
                    'currently_due' => $account->requirements->currently_due ?? [],
                    'eventually_due' => $account->requirements->eventually_due ?? [],
                    'disabled_reason' => $account->requirements->disabled_reason,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'has_account' => false,
                'status' => 'error',
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create a new onboarding link (for users who need to complete onboarding)
     */
    public function createOnboardingLink(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        if (!$user->stripe_account_id) {
            return response()->json([
                'message' => 'Aucun compte Stripe trouvé. Créez d\'abord un compte.',
            ], 400);
        }

        try {
            $accountLink = $this->createAccountLink($user->stripe_account_id);

            return response()->json([
                'url' => $accountLink->url,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du lien',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Stripe Connect webhook events
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.connect_webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        switch ($event->type) {
            case 'account.updated':
                $account = $event->data->object;
                $this->handleAccountUpdated($account);
                break;
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Handle account.updated event
     */
    private function handleAccountUpdated($account): void
    {
        $user = User::where('stripe_account_id', $account->id)->first();
        
        if (!$user) {
            return;
        }

        $status = 'pending';
        if ($account->details_submitted) {
            $status = 'active';
        }
        if ($account->requirements->disabled_reason ?? null) {
            $status = 'restricted';
        }

        $user->update([
            'stripe_account_status' => $status,
            'stripe_onboarding_completed_at' => $account->details_submitted ? now() : null,
        ]);
    }

    /**
     * Get Stripe dashboard login link for prestataire
     */
    public function getDashboardLink(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->stripe_account_id) {
            return response()->json(['message' => 'Aucun compte Stripe'], 400);
        }

        try {
            $loginLink = \Stripe\Account::createLoginLink($user->stripe_account_id);

            return response()->json([
                'url' => $loginLink->url,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du lien',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
