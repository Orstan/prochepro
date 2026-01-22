<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Models\PromoCodeUsage;
use App\Models\User;
use App\Models\UserCredit;
use App\Models\CreditTransaction;
use App\Services\AdminActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PromoCodeController extends Controller
{
    /**
     * Validate promo code
     */
    public function validate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $promoCode = PromoCode::where('code', strtoupper($validated['code']))->first();

        if (!$promoCode) {
            return response()->json([
                'valid' => false,
                'message' => 'Code promo invalide',
            ], 404);
        }

        if (!$promoCode->isValid()) {
            return response()->json([
                'valid' => false,
                'message' => 'Ce code promo a expiré ou n\'est plus actif',
            ]);
        }

        if (!$promoCode->canBeUsedByUser($validated['user_id'])) {
            return response()->json([
                'valid' => false,
                'message' => 'Vous avez déjà utilisé ce code promo',
            ]);
        }

        if ($promoCode->min_purchase_amount && isset($validated['amount'])) {
            if ($validated['amount'] < $promoCode->min_purchase_amount) {
                return response()->json([
                    'valid' => false,
                    'message' => "Montant minimum requis: {$promoCode->min_purchase_amount}€",
                ]);
            }
        }

        $discount = 0;
        if (isset($validated['amount']) && in_array($promoCode->type, ['percentage', 'fixed'])) {
            $discount = $promoCode->calculateDiscount($validated['amount']);
        }

        return response()->json([
            'valid' => true,
            'promo_code' => $promoCode,
            'discount' => $discount,
            'credits_amount' => $promoCode->credits_amount,
            'message' => 'Code promo valide',
        ]);
    }

    /**
     * Apply promo code
     */
    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'payment_id' => ['nullable', 'integer', 'exists:payments,id'],
            'amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $promoCode = PromoCode::where('code', strtoupper($validated['code']))->first();

        if (!$promoCode || !$promoCode->isValid() || !$promoCode->canBeUsedByUser($validated['user_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Code promo invalide ou déjà utilisé',
            ], 400);
        }

        $user = User::findOrFail($validated['user_id']);
        $discountAmount = null;
        $creditsAwarded = null;

        // Handle credits type
        if ($promoCode->type === 'credits' || $promoCode->type === 'free_credits') {
            $creditType = $promoCode->applies_to === 'client_credits' ? 'client' : 'prestataire';
            
            $credits = UserCredit::firstOrCreate(
                ['user_id' => $user->id, 'type' => $creditType],
                ['balance' => 0, 'used_free_credit' => false]
            );

            $newBalance = $credits->balance + $promoCode->credits_amount;
            $credits->update(['balance' => $newBalance]);

            CreditTransaction::create([
                'user_id' => $user->id,
                'type' => $creditType,
                'action' => 'promo_code',
                'amount' => $promoCode->credits_amount,
                'balance_after' => $newBalance,
                'description' => "Code promo: {$promoCode->code}",
            ]);

            $creditsAwarded = $promoCode->credits_amount;
        }

        // Handle discount types
        if (in_array($promoCode->type, ['percentage', 'fixed']) && isset($validated['amount'])) {
            $discountAmount = $promoCode->calculateDiscount($validated['amount']);
        }

        // Record usage
        PromoCodeUsage::create([
            'promo_code_id' => $promoCode->id,
            'user_id' => $user->id,
            'payment_id' => $validated['payment_id'] ?? null,
            'discount_amount' => $discountAmount,
            'credits_awarded' => $creditsAwarded,
        ]);

        $promoCode->incrementUsage();

        return response()->json([
            'success' => true,
            'discount_amount' => $discountAmount,
            'credits_awarded' => $creditsAwarded,
            'message' => 'Code promo appliqué avec succès',
        ]);
    }

    /**
     * Get all promo codes (admin)
     */
    public function index(Request $request): JsonResponse
    {
        $query = PromoCode::with(['creator', 'package'])
            ->orderBy('created_at', 'desc');

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $promoCodes = $query->paginate(20);

        return response()->json($promoCodes);
    }

    /**
     * Create promo code (admin)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:promo_codes,code'],
            'type' => ['required', 'in:percentage,fixed,credits,free_credits'],
            'value' => ['required_if:type,percentage,fixed', 'numeric', 'min:0'],
            'credits_amount' => ['required_if:type,credits,free_credits', 'integer', 'min:1'],
            'applies_to' => ['required', 'in:all,client_credits,prestataire_credits,specific_package'],
            'package_id' => ['required_if:applies_to,specific_package', 'nullable', 'exists:credit_packages,id'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'max_uses_per_user' => ['required', 'integer', 'min:1'],
            'min_purchase_amount' => ['nullable', 'numeric', 'min:0'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after:valid_from'],
            'description' => ['nullable', 'string'],
            'admin_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($validated['admin_id']);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $validated['code'] = strtoupper($validated['code']);
        $validated['created_by'] = $admin->id;
        unset($validated['admin_id']);

        $promoCode = PromoCode::create($validated);

        AdminActivityLogger::log(
            'created',
            'PromoCode',
            $promoCode->id,
            "Code promo créé: {$promoCode->code}"
        );

        return response()->json([
            'message' => 'Code promo créé avec succès',
            'promo_code' => $promoCode,
        ], 201);
    }

    /**
     * Update promo code (admin)
     */
    public function update(Request $request, PromoCode $promoCode): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['sometimes', 'boolean'],
            'max_uses' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'valid_until' => ['sometimes', 'nullable', 'date'],
            'description' => ['sometimes', 'nullable', 'string'],
            'admin_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($validated['admin_id']);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        unset($validated['admin_id']);
        $oldData = $promoCode->only(array_keys($validated));
        $promoCode->update($validated);

        AdminActivityLogger::log(
            'updated',
            'PromoCode',
            $promoCode->id,
            "Code promo modifié: {$promoCode->code}",
            $oldData,
            $validated
        );

        return response()->json([
            'message' => 'Code promo mis à jour',
            'promo_code' => $promoCode->fresh(),
        ]);
    }

    /**
     * Delete promo code (admin)
     */
    public function destroy(Request $request, PromoCode $promoCode): JsonResponse
    {
        $validated = $request->validate([
            'admin_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($validated['admin_id']);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $code = $promoCode->code;
        $promoCode->delete();

        AdminActivityLogger::log(
            'deleted',
            'PromoCode',
            $promoCode->id,
            "Code promo supprimé: {$code}"
        );

        return response()->json([
            'message' => 'Code promo supprimé',
        ]);
    }

    /**
     * Get promo code statistics (admin)
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_codes' => PromoCode::count(),
            'active_codes' => PromoCode::active()->count(),
            'total_uses' => PromoCodeUsage::count(),
            'total_discount_given' => PromoCodeUsage::sum('discount_amount'),
            'total_credits_awarded' => PromoCodeUsage::sum('credits_awarded'),
            'by_type' => PromoCode::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'top_codes' => PromoCode::withCount('usages')
                ->orderBy('usages_count', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Generate random promo code
     */
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prefix' => ['nullable', 'string', 'max:10'],
            'length' => ['nullable', 'integer', 'min:4', 'max:20'],
        ]);

        $prefix = $validated['prefix'] ?? '';
        $length = $validated['length'] ?? 8;

        do {
            $code = $prefix . strtoupper(Str::random($length - strlen($prefix)));
        } while (PromoCode::where('code', $code)->exists());

        return response()->json([
            'code' => $code,
        ]);
    }
}
