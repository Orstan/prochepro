<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Referral;
use App\Models\User;
use App\Services\CreditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        // Honeypot: if this field is filled, it's a bot
        if ($request->filled('website') || $request->filled('phone_confirm')) {
            return response()->json(['message' => 'Inscription réussie.'], 201);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8'],
            'referral_code' => ['nullable', 'string', 'max:10'],
        ]);

        // Generate 6-digit verification code
        $verificationCode = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Check referral code
        $referredBy = null;
        if (!empty($validated['referral_code'])) {
            $referrer = User::where('referral_code', $validated['referral_code'])->first();
            if ($referrer) {
                $referredBy = $referrer->id;
            }
        }

        // All users get both roles by default
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'],
            'role' => 'client', // Default active role
            'roles' => ['client', 'prestataire'], // Both roles
            'email_verification_token' => $verificationCode,
            'referral_code' => User::generateReferralCode(),
            'referred_by' => $referredBy,
        ]);

        // Create referral record if referred
        if ($referredBy) {
            Referral::create([
                'referrer_id' => $referredBy,
                'referred_id' => $user->id,
                'status' => 'pending',
            ]);
        }

        // Initialize credits
        $creditService = app(CreditService::class);
        $creditService->initializeUserCredits($user);

        // Create notification settings (enabled by default for prestataires)
        $user->notificationSettings()->create([
            'enabled' => true,
            'notification_mode' => 'auto_skills',
            'channels' => [
                'email' => true,
                'push' => true,
            ],
        ]);

        // Send verification email with 6-digit code
        $this->sendVerificationEmail($user, $verificationCode);

        Auth::login($user);

        // Create API token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Inscription réussie. Veuillez vérifier votre email.',
        ], 201);
    }

    protected function sendVerificationEmail(User $user, string $code): void
    {
        try {
            Mail::raw(
                "Bonjour {$user->name},\n\n" .
                "Bienvenue sur ProchePro !\n\n" .
                "Votre code de vérification est : {$code}\n\n" .
                "Ce code expire dans 24 heures.\n\n" .
                "Si vous n'avez pas créé de compte, ignorez cet email.\n\n" .
                "L'équipe ProchePro",
                function ($mail) use ($user) {
                    $mail->to($user->email)
                        ->subject('Votre code de vérification - ProchePro');
                }
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send verification email: ' . $e->getMessage());
        }
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)
            ->where('email_verification_token', $request->code)
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Code invalide ou expiré.',
            ], 422);
        }

        $user->update([
            'email_verified_at' => now(),
            'email_verification_token' => null,
        ]);

        return response()->json([
            'message' => 'Email vérifié avec succès !',
            'user' => $user,
        ]);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)
            ->whereNull('email_verified_at')
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email déjà vérifié ou utilisateur introuvable.',
            ], 422);
        }

        // Generate new 6-digit code
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update(['email_verification_token' => $code]);

        $this->sendVerificationEmail($user, $code);

        return response()->json([
            'message' => 'Email de vérification envoyé.',
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        // Validate - either email or phone is required
        $request->validate([
            'email' => ['sometimes', 'nullable', 'string', 'email'],
            'phone' => ['sometimes', 'nullable', 'string'],
            'password' => ['required', 'string'],
        ]);

        // At least one identifier is required
        if (!$request->filled('email') && !$request->filled('phone')) {
            return response()->json([
                'message' => 'Email ou téléphone requis.',
            ], 422);
        }

        // Try to find user by email or phone
        $user = null;
        if ($request->filled('email')) {
            $user = User::where('email', $request->email)->first();
        } elseif ($request->filled('phone')) {
            $user = User::where('phone', $request->phone)->first();
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Identifiants invalides.',
            ], 422);
        }

        Auth::login($user);

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
        
        // Update last login timestamp
        $user->update(['last_login_at' => now()]);
        
        // Create API token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->makeVisible(['is_admin']),
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => Auth::user(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Déconnecté.',
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        $response = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'roles' => $user->roles ?? [$user->role],
            'active_role' => $user->active_role ?? $user->role,
            'is_admin' => $user->is_admin,
            'city' => $user->city,
            'avatar' => $user->avatar,
            'is_verified' => $user->is_verified ?? false,
            'verification_status' => $user->verification_status ?? 'none',
            'verified_at' => $user->verified_at,
            'average_rating' => $user->average_rating,
            'reviews_count' => $user->reviews_count,
            'completed_tasks_count' => $user->completed_tasks_count,
            'completed_referrals_count' => $user->completed_referrals_count,
            'has_active_client_badge' => $user->has_active_client_badge,
            'email_notifications' => $user->email_notifications ?? true,
            'push_notifications' => $user->push_notifications ?? true,
            'notification_preferences' => $user->notification_preferences ?? [],
        ];
        
        // Add prestataire-specific fields if user has prestataire role
        $userRoles = $user->roles ?? [$user->role];
        if ($user->role === 'prestataire' || in_array('prestataire', $userRoles)) {
            $response['bio'] = $user->bio;
            $response['phone'] = $user->phone;
            $response['website'] = $user->website;
            $response['skills'] = $user->skills ?? [];
            $response['experience_years'] = $user->experience_years;
            $response['service_areas'] = $user->service_areas ?? [];
            $response['certifications'] = $user->certifications ?? [];
            $response['hourly_rate'] = $user->hourly_rate;
            $response['company_name'] = $user->company_name;
            $response['siret'] = $user->siret;
            $response['service_categories'] = $user->service_categories ?? [];
            $response['service_subcategories'] = $user->service_subcategories ?? [];
        }
        
        return response()->json($response);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'company_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'skills' => ['sometimes', 'nullable', 'array'],
            'skills.*' => ['string', 'max:100'],
            'experience_years' => ['sometimes', 'nullable', 'string', 'max:50'],
            'hourly_rate' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:10000'],
            'service_areas' => ['sometimes', 'nullable', 'array'],
            'service_areas.*' => ['string', 'max:100'],
            'certifications' => ['sometimes', 'nullable', 'array'],
            'certifications.*' => ['string', 'max:200'],
            'service_categories' => ['sometimes', 'nullable', 'array'],
            'service_categories.*' => ['string', 'max:100'],
            'service_subcategories' => ['sometimes', 'nullable', 'array'],
            'service_subcategories.*' => ['string', 'max:200'],
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function updateNotificationSettings(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'email_notifications' => ['sometimes', 'boolean'],
            'push_notifications' => ['sometimes', 'boolean'],
            'notification_preferences' => ['sometimes', 'array'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Paramètres de notification mis à jour.',
            'email_notifications' => $user->email_notifications,
            'push_notifications' => $user->push_notifications,
            'notification_preferences' => $user->notification_preferences,
        ]);
    }

    public function uploadAvatar(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            $request->validate([
                'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            ]);

            if ($request->hasFile('avatar')) {
                $file = $request->file('avatar');
                $filename = 'avatar_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
                
                $avatarsPath = public_path('avatars');
                if (!is_dir($avatarsPath)) {
                    mkdir($avatarsPath, 0755, true);
                }
                
                $file->move($avatarsPath, $filename);

                $user->update(['avatar' => '/avatars/' . $filename]);
            }

            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du téléchargement: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            $token = Str::random(64);
            
            \DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ]
            );

            $resetUrl = config('app.frontend_url', 'http://localhost:3000') . 
                "/auth/reset-password?token={$token}&email=" . urlencode($request->email);

            try {
                Mail::raw(
                    "Bonjour {$user->name},\n\n" .
                    "Vous avez demandé à réinitialiser votre mot de passe.\n\n" .
                    "Cliquez sur ce lien pour créer un nouveau mot de passe:\n{$resetUrl}\n\n" .
                    "Ce lien expire dans 60 minutes.\n\n" .
                    "Si vous n'avez pas fait cette demande, ignorez cet email.\n\n" .
                    "L'équipe ProchePro",
                    function ($mail) use ($user) {
                        $mail->to($user->email)
                            ->subject('Réinitialisation de votre mot de passe ProchePro');
                    }
                );
            } catch (\Exception $e) {
                // Log error but don't expose it
            }
        }

        // Always return success to prevent email enumeration
        return response()->json([
            'message' => 'Si un compte existe avec cette adresse, un email a été envoyé.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $record = \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json([
                'message' => 'Ce lien de réinitialisation est invalide.',
            ], 422);
        }

        if (!Hash::check($request->token, $record->token)) {
            return response()->json([
                'message' => 'Ce lien de réinitialisation est invalide.',
            ], 422);
        }

        // Check if token is expired (60 minutes)
        if (now()->diffInMinutes($record->created_at) > 60) {
            return response()->json([
                'message' => 'Ce lien de réinitialisation a expiré.',
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non trouvé.',
            ], 404);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Delete the token
        \DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
        ]);
    }

    /**
     * Change password for authenticated user
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::findOrFail($request->user_id);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Le mot de passe actuel est incorrect.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Mot de passe modifié avec succès.',
        ]);
    }

    /**
     * Switch active role for user
     */
    public function switchRole(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'role' => ['required', 'string', 'in:client,prestataire'],
        ]);

        $user = User::findOrFail($request->user_id);
        $newRole = $request->role;

        // Check if user has this role
        $userRoles = $user->roles ?? [$user->role];
        
        if (!in_array($newRole, $userRoles)) {
            return response()->json([
                'message' => 'Vous n\'avez pas ce rôle. Veuillez d\'abord l\'activer.',
            ], 403);
        }

        $user->update([
            'active_role' => $newRole,
            'role' => $newRole, // Also update legacy field for compatibility
        ]);

        return response()->json([
            'message' => 'Rôle changé avec succès.',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Add a new role to user account
     */
    public function addRole(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'role' => ['required', 'string', 'in:client,prestataire'],
        ]);

        $user = User::findOrFail($request->user_id);
        $newRole = $request->role;

        $userRoles = $user->roles ?? [$user->role];
        
        if (in_array($newRole, $userRoles)) {
            return response()->json([
                'message' => 'Vous avez déjà ce rôle.',
            ], 400);
        }

        $userRoles[] = $newRole;
        
        $user->update([
            'roles' => $userRoles,
        ]);

        // Initialize credits for new role
        $creditService = app(CreditService::class);
        $creditService->initializeUserCredits($user, $newRole);

        return response()->json([
            'message' => 'Rôle ajouté avec succès. Vous pouvez maintenant basculer entre vos rôles.',
            'user' => $user->fresh(),
        ]);
    }
}
