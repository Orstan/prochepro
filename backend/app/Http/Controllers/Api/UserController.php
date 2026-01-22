<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserCredit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get user's subscription details for analytics access check
     */
    public function getSubscription(Request $request, $userId): JsonResponse
    {
        $user = User::find($userId);
        
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Get user's prestataire credits (where unlimited subscription is stored)
        $credits = UserCredit::where('user_id', $userId)
            ->where('type', 'prestataire')
            ->first();

        if (!$credits) {
            return response()->json([
                'has_unlimited' => false,
                'unlimited_expires_at' => null,
                'balance' => 0,
            ], 200);
        }

        return response()->json([
            'has_unlimited' => $credits->has_unlimited,
            'unlimited_expires_at' => $credits->unlimited_expires_at,
            'balance' => $credits->balance,
        ], 200);
    }
}
