<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CreditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    protected $creditService;

    public function __construct(CreditService $creditService)
    {
        $this->creditService = $creditService;
    }

    /**
     * Обробка OAuth логіну/реєстрації
     */
    public function handleSocialAuth(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => 'required|in:google,facebook',
            'provider_id' => 'required|string',
            'email' => 'required|email',
            'name' => 'required|string',
            'avatar_url' => 'nullable|string',
        ]);

        // Шукаємо користувача за provider + provider_id
        $user = User::where('provider', $validated['provider'])
            ->where('provider_id', $validated['provider_id'])
            ->first();

        // Якщо не знайдено, шукаємо за email
        if (!$user) {
            $user = User::where('email', $validated['email'])->first();
            
            // Якщо знайдено користувача з таким email, прив'язуємо OAuth
            if ($user) {
                $user->update([
                    'provider' => $validated['provider'],
                    'provider_id' => $validated['provider_id'],
                    'avatar_url' => $validated['avatar_url'] ?? $user->avatar_url,
                ]);
            }
        }

        // Якщо користувач не існує, створюємо нового
        if (!$user) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => null, // OAuth користувачі не мають пароля
                'provider' => $validated['provider'],
                'provider_id' => $validated['provider_id'],
                'avatar_url' => $validated['avatar_url'],
                'role' => 'client', // Початкова роль
                'roles' => ['client', 'prestataire'], // Обидві ролі одразу (масив, не JSON)
                'is_verified' => true, // OAuth користувачі автоматично верифіковані
                'email_verified_at' => now(),
                'referral_code' => User::generateReferralCode(),
            ]);

            // Ініціалізуємо кредити для обох ролей
            $this->creditService->initializeUserCredits($user, 'client');
            $this->creditService->initializeUserCredits($user, 'prestataire');
        }

        // Створюємо токен
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Перенаправлення на Google OAuth (для документації)
     */
    public function redirectToGoogle(): JsonResponse
    {
        return response()->json([
            'message' => 'Use frontend to initiate Google OAuth flow',
            'auth_url' => 'https://accounts.google.com/o/oauth2/v2/auth',
        ]);
    }

    /**
     * Перенаправлення на Facebook OAuth (для документації)
     */
    public function redirectToFacebook(): JsonResponse
    {
        return response()->json([
            'message' => 'Use frontend to initiate Facebook OAuth flow',
            'auth_url' => 'https://www.facebook.com/v18.0/dialog/oauth',
        ]);
    }
}
