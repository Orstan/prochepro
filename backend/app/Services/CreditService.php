<?php

namespace App\Services;

use App\Mail\ReferralBonusMail;
use App\Models\CreditPackage;
use App\Models\CreditTransaction;
use App\Models\Notification;
use App\Models\Referral;
use App\Models\User;
use App\Models\UserCredit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Services\WebPushService;

class CreditService
{
    /**
     * Ініціалізує кредити для нового користувача
     */
    public function initializeUserCredits(User $user): void
    {
        // Генеруємо реферальний код
        if (!$user->referral_code) {
            $user->update(['referral_code' => User::generateReferralCode()]);
        }

        // Створюємо записи кредитів для обох ролей (3 безкоштовних кредити при реєстрації)
        UserCredit::firstOrCreate(
            ['user_id' => $user->id, 'type' => 'client'],
            ['balance' => 3, 'used_free_credit' => false]
        );
        UserCredit::firstOrCreate(
            ['user_id' => $user->id, 'type' => 'prestataire'],
            ['balance' => 3, 'used_free_credit' => false]
        );
    }

    /**
     * Перевіряє чи може користувач створити завдання
     * Клієнти можуть створювати оголошення безкоштовно без обмежень
     */
    public function canCreateTask(User $user): array
    {
        // Клієнти можуть створювати оголошення безкоштовно
        return ['allowed' => true, 'reason' => 'free', 'balance' => 0];
    }

    /**
     * Перевіряє чи може prestataire відправити офер
     */
    public function canSendOffer(User $user): array
    {
        $credits = UserCredit::firstOrCreate(
            ['user_id' => $user->id, 'type' => 'prestataire'],
            ['balance' => 0, 'used_free_credit' => false]
        );

        // Перший раз безкоштовно
        if (!$credits->used_free_credit) {
            return ['allowed' => true, 'reason' => 'free', 'balance' => $credits->balance];
        }

        // Перевіряємо безліміт
        if ($credits->hasActiveUnlimited()) {
            return ['allowed' => true, 'reason' => 'unlimited', 'balance' => $credits->balance];
        }

        // Перевіряємо баланс
        if ($credits->balance > 0) {
            return ['allowed' => true, 'reason' => 'credits', 'balance' => $credits->balance];
        }

        return ['allowed' => false, 'reason' => 'no_credits', 'balance' => 0];
    }

    /**
     * Використовує кредит при створенні завдання
     * Клієнти можуть створювати оголошення безкоштовно - кредити не списуються
     */
    public function useTaskCredit(User $user, int $taskId): bool
    {
        // Клієнти можуть створювати оголошення безкоштовно
        // Перевіряємо реферальний бонус тільки для першого оголошення
        $credits = UserCredit::firstOrCreate(
            ['user_id' => $user->id, 'type' => 'client'],
            ['balance' => 0, 'used_free_credit' => false]
        );

        if (!$credits->used_free_credit) {
            $credits->update(['used_free_credit' => true]);
            $this->checkAndRewardReferral($user, 'client');
        }

        return true;
    }

    /**
     * Використовує кредит при відправці офера
     */
    public function useOfferCredit(User $user, int $offerId): bool
    {
        return DB::transaction(function () use ($user, $offerId) {
            $credits = UserCredit::where('user_id', $user->id)
                ->where('type', 'prestataire')
                ->lockForUpdate()
                ->first();

            if (!$credits) {
                return false;
            }

            // Перший раз безкоштовно
            if (!$credits->used_free_credit) {
                $credits->update(['used_free_credit' => true]);
                
                CreditTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'prestataire',
                    'action' => 'use',
                    'amount' => -1,
                    'balance_after' => $credits->balance,
                    'offer_id' => $offerId,
                    'description' => 'Première offre gratuite',
                ]);

                // Перевіряємо реферальний бонус
                $this->checkAndRewardReferral($user, 'prestataire');

                return true;
            }

            // Безліміт
            if ($credits->hasActiveUnlimited()) {
                CreditTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'prestataire',
                    'action' => 'use',
                    'amount' => 0,
                    'balance_after' => $credits->balance,
                    'offer_id' => $offerId,
                    'description' => 'Offre avec abonnement illimité',
                ]);

                return true;
            }

            // Використовуємо кредит
            if ($credits->balance > 0) {
                $newBalance = $credits->balance - 1;
                $credits->update(['balance' => $newBalance]);
                
                CreditTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'prestataire',
                    'action' => 'use',
                    'amount' => -1,
                    'balance_after' => $newBalance,
                    'offer_id' => $offerId,
                    'description' => 'Utilisation d\'un crédit pour offre',
                ]);

                return true;
            }

            return false;
        });
    }

    /**
     * Купівля пакету кредитів
     */
    public function purchasePackage(User $user, CreditPackage $package, ?string $paymentProvider = null, ?string $paymentId = null): bool
    {
        return DB::transaction(function () use ($user, $package, $paymentProvider, $paymentId) {
            $credits = UserCredit::firstOrCreate(
                ['user_id' => $user->id, 'type' => $package->type],
                ['balance' => 0, 'used_free_credit' => false]
            );

            // Безліміт
            if ($package->isUnlimited()) {
                $expiresAt = now()->addDays($package->validity_days);
                $credits->update([
                    'has_unlimited' => true,
                    'unlimited_expires_at' => $expiresAt,
                ]);

                CreditTransaction::create([
                    'user_id' => $user->id,
                    'type' => $package->type,
                    'action' => 'purchase',
                    'amount' => 0,
                    'balance_after' => $credits->balance,
                    'credit_package_id' => $package->id,
                    'description' => "Achat du forfait {$package->name} (illimité jusqu'au " . $expiresAt->format('d/m/Y') . ")",
                    'payment_provider' => $paymentProvider,
                    'payment_id' => $paymentId,
                ]);
            } else {
                // Звичайний пакет
                $newBalance = $credits->balance + $package->credits;
                $credits->update(['balance' => $newBalance]);

                CreditTransaction::create([
                    'user_id' => $user->id,
                    'type' => $package->type,
                    'action' => 'purchase',
                    'amount' => $package->credits,
                    'balance_after' => $newBalance,
                    'credit_package_id' => $package->id,
                    'description' => "Achat du forfait {$package->name} (+{$package->credits} crédits)",
                    'payment_provider' => $paymentProvider,
                    'payment_id' => $paymentId,
                ]);
            }

            // Сповіщення
            Notification::create([
                'user_id' => $user->id,
                'type' => 'credits_purchased',
                'data' => [
                    'package_name' => $package->name,
                    'credits' => $package->credits,
                    'is_unlimited' => $package->isUnlimited(),
                ],
            ]);

            // Push notification
            if ($user->push_notifications !== false) {
                $webPush = new WebPushService();
                $message = $package->isUnlimited() 
                    ? "Forfait {$package->name} activé - Offres illimitées !"
                    : "Forfait {$package->name} - +{$package->credits} crédits";
                $webPush->sendToUser(
                    $user,
                    'Achat confirmé ✅',
                    $message,
                    '/pricing',
                    'credits-' . $package->id
                );
            }

            return true;
        });
    }

    /**
     * Перевіряє та нараховує реферальний бонус
     */
    protected function checkAndRewardReferral(User $user, string $type): void
    {
        // Перевіряємо чи є реферал
        $referral = Referral::where('referred_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$referral) {
            return;
        }

        // Позначаємо реферал як завершений
        $referral->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Нараховуємо бонус рефералу (тому кого запросили)
        if (!$referral->referred_rewarded) {
            $this->addReferralBonus($user, $type);
            $referral->update(['referred_rewarded' => true]);

            // Сповіщення та email для реферала
            Notification::create([
                'user_id' => $user->id,
                'type' => 'referral_bonus',
                'data' => [
                    'credit_type' => $type,
                    'message' => 'Vous avez reçu 5€ gratuits grâce à votre parrainage !',
                ],
            ]);

            // Push notification
            if ($user->push_notifications !== false) {
                $webPush = new WebPushService();
                $webPush->sendToUser(
                    $user,
                    'Bonus parrainage 🎁',
                    'Vous avez reçu 5€ gratuits grâce à votre parrainage !',
                    '/pricing',
                    'referral-bonus-' . $user->id
                );
            }

            if ($user->email && $user->email_notifications !== false) {
                try {
                    Mail::to($user->email)->send(new ReferralBonusMail([
                        'user_name' => $user->name,
                        'credit_type' => $type,
                    ]));
                } catch (\Exception $e) {
                    // ignore mail errors
                }
            }
        }

        // Нараховуємо бонус тому хто запросив
        if (!$referral->referrer_rewarded) {
            $referrer = User::find($referral->referrer_id);
            if ($referrer) {
                // Визначаємо тип кредиту для того хто запросив (за його роллю)
                $referrerType = $referrer->role === 'prestataire' ? 'prestataire' : 'client';
                $this->addReferralBonus($referrer, $referrerType);
                $referral->update(['referrer_rewarded' => true]);

                // Сповіщення
                Notification::create([
                    'user_id' => $referrer->id,
                    'type' => 'referral_bonus',
                    'data' => [
                        'referred_name' => $user->name,
                        'credit_type' => $referrerType,
                        'message' => "Votre filleul {$user->name} a effectué sa première action ! Vous avez reçu 5€ gratuits.",
                    ],
                ]);

                // Push notification
                if ($referrer->push_notifications !== false) {
                    $webPush = new WebPushService();
                    $webPush->sendToUser(
                        $referrer,
                        'Bonus parrainage 🎁',
                        "Votre filleul {$user->name} a effectué sa première action ! +5€ gratuits",
                        '/pricing',
                        'referral-referrer-' . $referrer->id
                    );
                }

                // Email для того хто запросив
                if ($referrer->email && $referrer->email_notifications !== false) {
                    try {
                        Mail::to($referrer->email)->send(new ReferralBonusMail([
                            'user_name' => $referrer->name,
                            'referred_name' => $user->name,
                            'credit_type' => $referrerType,
                        ]));
                    } catch (\Exception $e) {
                        // ignore mail errors
                    }
                }
            }
        }
    }

    /**
     * Додає реферальний бонус (5€ = 5 кредитів)
     */
    public function addReferralBonus(User $user, string $type): void
    {
        $credits = UserCredit::firstOrCreate(
            ['user_id' => $user->id, 'type' => $type],
            ['balance' => 0, 'used_free_credit' => false]
        );

        $bonusAmount = 5; // 5€ = 5 кредитів
        $newBalance = $credits->balance + $bonusAmount;
        $credits->update(['balance' => $newBalance]);

        CreditTransaction::create([
            'user_id' => $user->id,
            'type' => $type,
            'action' => 'referral',
            'amount' => $bonusAmount,
            'balance_after' => $newBalance,
            'description' => 'Bonus de parrainage (+5€)',
        ]);
    }

    /**
     * Отримує баланс кредитів користувача
     */
    public function getUserCredits(User $user): array
    {
        $clientCredits = UserCredit::firstOrCreate(
            ['user_id' => $user->id, 'type' => 'client'],
            ['balance' => 0, 'used_free_credit' => false]
        );

        $prestataireCredits = UserCredit::firstOrCreate(
            ['user_id' => $user->id, 'type' => 'prestataire'],
            ['balance' => 0, 'used_free_credit' => false]
        );

        return [
            'client' => [
                'balance' => $clientCredits->balance,
                'has_free' => !$clientCredits->used_free_credit,
                'has_unlimited' => false,
            ],
            'prestataire' => [
                'balance' => $prestataireCredits->balance,
                'has_free' => !$prestataireCredits->used_free_credit,
                'has_unlimited' => $prestataireCredits->hasActiveUnlimited(),
                'unlimited_expires_at' => $prestataireCredits->unlimited_expires_at,
            ],
        ];
    }

    /**
     * Створює Stripe Checkout Session для покупки пакету кредитів
     */
    public function createStripeCheckoutSession(User $user, CreditPackage $package): array
    {
        $apiKey = config('services.stripe.secret');
        if (!$apiKey) {
            throw new \Exception('Stripe API key is not configured');
        }
        
        Stripe::setApiKey($apiKey);

        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => $package->name,
                        'description' => $package->description ?? "Forfait {$package->name}",
                    ],
                    'unit_amount' => (int) ($package->price * 100), // Stripe uses cents
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => config('app.frontend_url') . "/pricing?payment=success&package={$package->id}",
            'cancel_url' => config('app.frontend_url') . "/pricing?payment=cancelled",
            'customer_email' => $user->email,
            'metadata' => [
                'user_id' => $user->id,
                'package_id' => $package->id,
                'package_type' => $package->type,
            ],
        ]);

        return [
            'session_id' => $session->id,
            'url' => $session->url,
        ];
    }
}
