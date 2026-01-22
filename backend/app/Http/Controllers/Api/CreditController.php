<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CreditPackage;
use App\Models\CreditTransaction;
use App\Models\Referral;
use App\Models\User;
use App\Models\UserCredit;
use App\Services\CreditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreditController extends Controller
{
    protected CreditService $creditService;

    public function __construct(CreditService $creditService)
    {
        $this->creditService = $creditService;
    }

    /**
     * Отримати всі доступні пакети
     */
    public function packages(): JsonResponse
    {
        $packages = CreditPackage::active()
            ->orderBy('type')
            ->orderBy('sort_order')
            ->get();

        // Знаходимо базову ціну за кредит для кожного типу (з першого пакету)
        $basePricePerCredit = [];
        foreach (['client', 'prestataire'] as $type) {
            $firstPackage = $packages->where('type', $type)->first();
            if ($firstPackage && $firstPackage->credits > 0) {
                $basePricePerCredit[$type] = (float) $firstPackage->price / $firstPackage->credits;
            }
        }

        $packages = $packages->map(function ($package) use ($basePricePerCredit) {
            // Автоматично генеруємо перший feature з актуальною кількістю кредитів
            $features = $package->features ?? [];
            if ($package->credits !== null) {
                $creditWord = $package->type === 'client' ? 'annonces' : 'offres';
                $dynamicFeature = $package->credits . ' ' . $creditWord;
                
                // Замінюємо перший feature або додаємо якщо немає
                if (!empty($features)) {
                    $features[0] = $dynamicFeature;
                } else {
                    array_unshift($features, $dynamicFeature);
                }

                // Розраховуємо відсоток економії порівняно з базовим пакетом
                if (isset($basePricePerCredit[$package->type]) && $package->credits > 0) {
                    $basePrice = $basePricePerCredit[$package->type];
                    $currentPricePerCredit = (float) $package->price / $package->credits;
                    
                    if ($currentPricePerCredit < $basePrice) {
                        $savingsPercent = round((1 - $currentPricePerCredit / $basePrice) * 100);
                        if ($savingsPercent > 0) {
                            // Шукаємо і замінюємо існуючий feature з "Économisez" або додаємо новий
                            $savingsFeature = "Économisez {$savingsPercent}%";
                            $savingsIndex = null;
                            foreach ($features as $i => $f) {
                                if (strpos($f, 'Économisez') !== false || strpos($f, 'Economisez') !== false) {
                                    $savingsIndex = $i;
                                    break;
                                }
                            }
                            if ($savingsIndex !== null) {
                                $features[$savingsIndex] = $savingsFeature;
                            } else {
                                // Додаємо після другого feature (support)
                                array_splice($features, 2, 0, [$savingsFeature]);
                            }
                        }
                    }
                }
            } else {
                // Для unlimited пакетів
                $unlimitedWord = $package->type === 'client' ? 'Annonces illimitées' : 'Offres illimitées';
                if (!empty($features)) {
                    $features[0] = $unlimitedWord;
                } else {
                    array_unshift($features, $unlimitedWord);
                }
            }
            $package->features = $features;
            return $package;
        });

        return response()->json([
            'client' => $packages->where('type', 'client')->values(),
            'prestataire' => $packages->where('type', 'prestataire')->values(),
        ]);
    }

    /**
     * Отримати баланс кредитів користувача
     */
    public function balance(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::findOrFail($request->user_id);
        $credits = $this->creditService->getUserCredits($user);

        return response()->json($credits);
    }

    /**
     * Перевірити чи може створити завдання
     */
    public function canCreateTask(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::findOrFail($request->user_id);
        $result = $this->creditService->canCreateTask($user);

        return response()->json($result);
    }

    /**
     * Перевірити чи може відправити офер
     */
    public function canSendOffer(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::findOrFail($request->user_id);
        $result = $this->creditService->canSendOffer($user);

        return response()->json($result);
    }

    /**
     * Купити пакет (симуляція)
     */
    public function purchase(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'package_id' => ['required', 'integer', 'exists:credit_packages,id'],
        ]);

        $user = User::findOrFail($request->user_id);
        $package = CreditPackage::findOrFail($request->package_id);

        if (!$package->is_active) {
            return response()->json([
                'message' => 'Ce forfait n\'est plus disponible.',
            ], 400);
        }

        $success = $this->creditService->purchasePackage($user, $package, 'simulation', 'SIM_' . uniqid());

        if ($success) {
            $credits = $this->creditService->getUserCredits($user);
            return response()->json([
                'message' => 'Achat effectué avec succès.',
                'credits' => $credits,
            ]);
        }

        return response()->json([
            'message' => 'Erreur lors de l\'achat.',
        ], 500);
    }

    /**
     * Створити Stripe Checkout Session для покупки пакету
     */
    public function createCheckoutSession(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'package_id' => ['required', 'integer', 'exists:credit_packages,id'],
        ]);

        $user = User::findOrFail($request->user_id);
        $package = CreditPackage::findOrFail($request->package_id);

        if (!$package->is_active) {
            return response()->json([
                'message' => 'Ce forfait n\'est plus disponible.',
            ], 400);
        }

        try {
            $session = $this->creditService->createStripeCheckoutSession($user, $package);
            return response()->json($session);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de la session de paiement.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Історія транзакцій
     */
    public function transactions(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'type' => ['nullable', 'in:client,prestataire'],
        ]);

        $query = CreditTransaction::where('user_id', $request->user_id)
            ->with(['creditPackage', 'task', 'offer'])
            ->orderBy('created_at', 'desc');

        if ($request->type) {
            $query->where('type', $request->type);
        }

        $transactions = $query->paginate(20);

        return response()->json($transactions);
    }

    /**
     * Отримати реферальну інформацію
     */
    public function referralInfo(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::findOrFail($request->user_id);

        // Генеруємо код якщо немає
        if (!$user->referral_code) {
            $user->update(['referral_code' => User::generateReferralCode()]);
        }

        $referrals = Referral::where('referrer_id', $user->id)
            ->with('referred:id,name,created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        $completedCount = $referrals->where('status', 'completed')->count();
        $pendingCount = $referrals->where('status', 'pending')->count();

        return response()->json([
            'referral_code' => $user->referral_code,
            'referral_link' => config('app.frontend_url') . '/auth/register?ref=' . $user->referral_code,
            'total_referrals' => $referrals->count(),
            'completed_referrals' => $completedCount,
            'pending_referrals' => $pendingCount,
            'referrals' => $referrals,
        ]);
    }
}
