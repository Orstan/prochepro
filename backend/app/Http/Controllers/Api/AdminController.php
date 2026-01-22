<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Task;
use App\Models\Payment;
use App\Models\Offer;
use App\Models\Review;
use App\Models\CreditPackage;
use App\Models\UserCredit;
use App\Models\CreditTransaction;
use App\Models\Notification;
use App\Services\WebPushService;
use App\Services\AdminActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    /**
     * Get all users with stats
     */
    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        return response()->json($users);
    }

    /**
     * Get all payments
     */
    public function payments(Request $request): JsonResponse
    {
        $query = Payment::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $payments = $query->orderBy('created_at', 'desc')->get();

        return response()->json($payments);
    }

    /**
     * Get platform statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'total_clients' => User::where('role', 'client')->count(),
            'total_prestataires' => User::where('role', 'prestataire')->count(),
            'total_tasks' => Task::count(),
            'published_tasks' => Task::where('status', 'published')->count(),
            'in_progress_tasks' => Task::where('status', 'in_progress')->count(),
            'completed_tasks' => Task::where('status', 'completed')->count(),
            'cancelled_tasks' => Task::where('status', 'cancelled')->count(),
            'total_offers' => Offer::count(),
            'total_reviews' => Review::count(),
            'total_revenue' => Payment::whereIn('status', ['captured', 'completed', 'authorized'])->sum('amount'),
        ];

        return response()->json($stats);
    }

    /**
     * Block/unblock a user
     */
    public function toggleUserStatus(User $user): JsonResponse
    {
        $oldStatus = $user->is_blocked;
        $user->is_blocked = !$user->is_blocked;
        $user->save();

        if ($user->is_blocked) {
            AdminActivityLogger::logUserBanned($user->id, 'Bloqué via admin panel');
        } else {
            AdminActivityLogger::logUserUnbanned($user->id);
        }

        return response()->json([
            'message' => $user->is_blocked ? 'Utilisateur bloqué' : 'Utilisateur débloqué',
            'user' => $user,
        ]);
    }

    /**
     * Delete a user
     */
    public function deleteUser(User $user): JsonResponse
    {
        $userEmail = $user->email;
        $userId = $user->id;
        
        $user->delete();

        AdminActivityLogger::logUserDeleted($userId, $userEmail);

        return response()->json([
            'message' => 'Utilisateur supprimé',
        ]);
    }

    /**
     * Bulk delete users
     */
    public function bulkDeleteUsers(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['required', 'integer', 'exists:users,id'],
        ]);

        $userIds = $validated['user_ids'];
        
        // Prevent deleting admins
        $users = User::whereIn('id', $userIds)->where('is_admin', false)->get();
        
        if ($users->isEmpty()) {
            return response()->json([
                'message' => 'Aucun utilisateur à supprimer (les admins ne peuvent pas être supprimés)',
            ], 400);
        }

        $deletedCount = 0;
        foreach ($users as $user) {
            AdminActivityLogger::logUserDeleted($user->id, $user->email);
            $user->delete();
            $deletedCount++;
        }

        return response()->json([
            'message' => "$deletedCount utilisateur(s) supprimé(s)",
            'deleted_count' => $deletedCount,
        ]);
    }

    /**
     * Bulk block/unblock users
     */
    public function bulkBlockUsers(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['required', 'integer', 'exists:users,id'],
            'block' => ['required', 'boolean'],
        ]);

        $userIds = $validated['user_ids'];
        $shouldBlock = $validated['block'];
        
        // Prevent blocking admins
        $users = User::whereIn('id', $userIds)->where('is_admin', false)->get();
        
        if ($users->isEmpty()) {
            return response()->json([
                'message' => 'Aucun utilisateur à modifier (les admins ne peuvent pas être bloqués)',
            ], 400);
        }

        $updatedCount = 0;
        foreach ($users as $user) {
            $user->is_blocked = $shouldBlock;
            $user->save();
            
            if ($shouldBlock) {
                AdminActivityLogger::logUserBanned($user->id, 'Bloqué en masse via admin panel');
            } else {
                AdminActivityLogger::logUserUnbanned($user->id);
            }
            
            $updatedCount++;
        }

        $action = $shouldBlock ? 'bloqué(s)' : 'débloqué(s)';
        
        return response()->json([
            'message' => "$updatedCount utilisateur(s) $action",
            'updated_count' => $updatedCount,
        ]);
    }

    /**
     * Get all tasks for admin
     */
    public function tasks(Request $request): JsonResponse
    {
        $query = Task::with(['client', 'offers']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        $perPage = $request->input('per_page', 20);
        $tasks = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($tasks);
    }

    /**
     * Delete any task (admin only)
     */
    public function deleteTask(Task $task): JsonResponse
    {
        $taskTitle = $task->title;
        $taskId = $task->id;
        
        $task->offers()->delete();
        $task->messages()->delete();
        $task->reviews()->delete();
        
        $task->delete();

        AdminActivityLogger::logTaskDeleted($taskId, $taskTitle);

        return response()->json([
            'message' => 'Tâche supprimée avec succès',
        ]);
    }

    /**
     * Bulk delete tasks (admin only)
     */
    public function bulkDeleteTasks(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_ids' => ['required', 'array', 'min:1'],
            'task_ids.*' => ['required', 'integer', 'exists:tasks,id'],
        ]);

        $taskIds = $validated['task_ids'];
        
        $tasks = Task::whereIn('id', $taskIds)->get();
        
        if ($tasks->isEmpty()) {
            return response()->json([
                'message' => 'Aucune annonce à supprimer',
            ], 400);
        }

        $deletedCount = 0;
        foreach ($tasks as $task) {
            $task->offers()->delete();
            $task->messages()->delete();
            $task->reviews()->delete();
            
            AdminActivityLogger::logTaskDeleted($task->id, $task->title);
            $task->delete();
            $deletedCount++;
        }

        return response()->json([
            'message' => "$deletedCount annonce(s) supprimée(s)",
            'deleted_count' => $deletedCount,
        ]);
    }

    /**
     * Get all credit packages (including inactive)
     */
    public function creditPackages(): JsonResponse
    {
        $packages = CreditPackage::orderBy('type')
            ->orderBy('sort_order')
            ->get();

        return response()->json($packages);
    }

    /**
     * Update a credit package
     */
    public function updateCreditPackage(Request $request, CreditPackage $package): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'credits' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'validity_days' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'description' => ['sometimes', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $oldData = $package->only(array_keys($validated));
        $package->update($validated);

        AdminActivityLogger::logCreditPackageUpdated(
            $package->id,
            $oldData,
            $package->only(array_keys($validated))
        );

        return response()->json([
            'message' => 'Pack mis à jour avec succès',
            'package' => $package->fresh(),
        ]);
    }

    /**
     * Create a new credit package
     */
    public function createCreditPackage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:credit_packages,slug'],
            'type' => ['required', 'in:client,prestataire'],
            'price' => ['required', 'numeric', 'min:0'],
            'credits' => ['nullable', 'integer', 'min:0'],
            'validity_days' => ['nullable', 'integer', 'min:0'],
            'description' => ['required', 'string'],
            'is_active' => ['boolean'],
        ]);

        $package = CreditPackage::create($validated);

        AdminActivityLogger::logCreditPackageCreated($package->id, $validated);

        return response()->json([
            'message' => 'Pack créé avec succès',
            'package' => $package,
        ], 201);
    }

    /**
     * Delete a credit package
     */
    public function deleteCreditPackage(CreditPackage $package): JsonResponse
    {
        $packageName = $package->name;
        $packageId = $package->id;
        
        $package->delete();

        AdminActivityLogger::logCreditPackageDeleted($packageId, $packageName);

        return response()->json([
            'message' => 'Pack supprimé',
        ]);
    }

    /**
     * Add credits to a user (admin only)
     */
    public function addCreditsToUser(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1', 'max:1000'],
            'type' => ['required', 'in:client,prestataire'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $credits = UserCredit::firstOrCreate(
            ['user_id' => $user->id, 'type' => $validated['type']],
            ['balance' => 0, 'used_free_credit' => false]
        );

        $newBalance = $credits->balance + $validated['amount'];
        $credits->update(['balance' => $newBalance]);

        // Log transaction
        CreditTransaction::create([
            'user_id' => $user->id,
            'type' => $validated['type'],
            'action' => 'admin_add',
            'amount' => $validated['amount'],
            'balance_after' => $newBalance,
            'description' => $validated['reason'] ?? 'Crédits ajoutés par l\'administrateur',
        ]);

        // Notify user
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => 'credits_added',
            'data' => [
                'amount' => $validated['amount'],
                'credit_type' => $validated['type'],
                'message' => "Vous avez reçu {$validated['amount']} crédit(s) gratuit(s) !",
            ],
        ]);
        
        Log::info('Admin credits notification created', [
            'notification_id' => $notification->id,
            'user_id' => $user->id,
            'amount' => $validated['amount'],
        ]);

        // Push notification
        if ($user->push_notifications !== false) {
            $webPush = new WebPushService();
            $webPush->sendToUser(
                $user,
                'Crédits offerts 🎁',
                "Vous avez reçu {$validated['amount']} crédit(s) gratuit(s) !",
                '/pricing',
                'credits-admin-' . $user->id
            );
        }

        AdminActivityLogger::logCreditsAdded(
            $user->id,
            $validated['amount'],
            $validated['reason'] ?? 'Ajouté par admin'
        );

        return response()->json([
            'message' => "Crédits ajoutés avec succès",
            'new_balance' => $newBalance,
        ]);
    }

    /**
     * Get user credits info
     */
    public function getUserCredits(User $user): JsonResponse
    {
        $clientCredits = UserCredit::where('user_id', $user->id)
            ->where('type', 'client')
            ->first();

        $prestataireCredits = UserCredit::where('user_id', $user->id)
            ->where('type', 'prestataire')
            ->first();

        return response()->json([
            'client' => [
                'balance' => $clientCredits->balance ?? 0,
                'has_free' => $clientCredits ? !$clientCredits->used_free_credit : true,
            ],
            'prestataire' => [
                'balance' => $prestataireCredits->balance ?? 0,
                'has_free' => $prestataireCredits ? !$prestataireCredits->used_free_credit : true,
                'has_unlimited' => $prestataireCredits?->hasActiveUnlimited() ?? false,
            ],
        ]);
    }
}
