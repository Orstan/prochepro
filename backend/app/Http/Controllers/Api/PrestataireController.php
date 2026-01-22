<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrestataireController extends Controller
{

    /**
     * Get commission info for prestataire
     * Returns current commission rate and completed orders count
     */
    public function getCommissionInfo(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->role !== 'prestataire') {
            return response()->json([
                'message' => 'Accès réservé aux prestataires',
            ], 403);
        }

        $completedOrders = $user->completed_orders_count ?? 0;
        $commissionRate = $completedOrders < 3 ? 0 : 10;
        $ordersUntilCommission = $completedOrders < 3 ? (3 - $completedOrders) : 0;
        
        return response()->json([
            'completed_orders' => $completedOrders,
            'commission_rate' => $commissionRate,
            'orders_until_commission' => $ordersUntilCommission,
            'status' => $completedOrders < 3 ? 'free_trial' : 'standard',
            'message' => $completedOrders < 3 
                ? "Vous avez encore {$ordersUntilCommission} mission(s) sans commission !"
                : "Commission standard de 10% appliquée",
        ]);
    }

    /**
     * Get prestataire stats including commission details
     */
    public function getStats(Request $request, int $id): JsonResponse
    {
        $prestataire = User::find($id);

        if (!$prestataire || $prestataire->role !== 'prestataire') {
            return response()->json([
                'message' => 'Prestataire non trouvé',
            ], 404);
        }

        $completedOrders = $prestataire->completed_orders_count ?? 0;
        $commissionInfo = [
            'completed_orders' => $completedOrders,
            'commission_rate' => $completedOrders < 3 ? 0 : 10,
            'orders_until_commission' => $completedOrders < 3 ? (3 - $completedOrders) : 0,
            'status' => $completedOrders < 3 ? 'free_trial' : 'standard',
        ];

        return response()->json([
            'id' => $prestataire->id,
            'name' => $prestataire->name,
            'level' => $prestataire->level,
            'xp' => $prestataire->xp,
            'total_tasks_completed' => $prestataire->total_tasks_completed,
            'average_rating' => $prestataire->average_rating,
            'commission' => $commissionInfo,
        ]);
    }
}
