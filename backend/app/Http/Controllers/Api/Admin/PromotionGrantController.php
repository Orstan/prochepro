<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromotionPurchase;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PromotionGrantController extends Controller
{
    /**
     * Grant free promotion to a user's task
     */
    public function grantFreePromotion(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_id' => ['required', 'integer', 'exists:tasks,id'],
            'days' => ['required', 'integer', 'min:1', 'max:365'],
            'admin_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $task = Task::findOrFail($validated['task_id']);
        $admin = User::findOrFail($validated['admin_id']);

        if (!$admin->is_admin) {
            return response()->json([
                'message' => 'Only admins can grant free promotions',
            ], 403);
        }

        $startsAt = Carbon::now();
        $expiresAt = $startsAt->copy()->addDays($validated['days']);

        // Create free promotion purchase
        $purchase = PromotionPurchase::create([
            'user_id' => $task->client_id,
            'task_id' => $task->id,
            'package_id' => null,
            'days' => $validated['days'],
            'price' => 0,
            'is_free' => true,
            'status' => 'completed',
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
            'granted_by_admin_id' => $admin->id,
        ]);

        // Apply promotion to task immediately
        $purchase->applyToTask();

        return response()->json([
            'message' => 'Free promotion granted successfully',
            'purchase' => $purchase->load(['task', 'user', 'grantedByAdmin']),
        ], 201);
    }

    /**
     * Get all promotion purchases (for admin overview)
     */
    public function index(Request $request): JsonResponse
    {
        $query = PromotionPurchase::with(['user', 'task', 'package', 'grantedByAdmin']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('is_free')) {
            $query->where('is_free', $request->boolean('is_free'));
        }

        $purchases = $query->latest()->paginate(20);

        return response()->json($purchases);
    }

    /**
     * Cancel a promotion
     */
    public function cancel(Request $request, PromotionPurchase $purchase): JsonResponse
    {
        if ($purchase->status !== 'completed') {
            return response()->json([
                'message' => 'Only completed promotions can be cancelled',
            ], 400);
        }

        $purchase->status = 'cancelled';
        $purchase->save();

        // Remove promotion from task
        if ($purchase->task) {
            $purchase->task->promoted_until = null;
            $purchase->task->save();
        }

        return response()->json([
            'message' => 'Promotion cancelled successfully',
            'purchase' => $purchase,
        ]);
    }
}
