<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Review;
use App\Models\Message;
use App\Models\User;
use App\Models\Notification;
use App\Services\AdminActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModerationController extends Controller
{
    /**
     * Get all flagged content
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['nullable', 'in:task,review,message,all'],
            'status' => ['nullable', 'in:pending,approved,rejected'],
        ]);

        $type = $validated['type'] ?? 'all';
        $data = [];

        if ($type === 'task' || $type === 'all') {
            $tasks = Task::where('is_flagged', true)
                ->with(['client', 'flaggedBy', 'moderatedBy'])
                ->orderBy('flagged_at', 'desc')
                ->get()
                ->map(fn($task) => [
                    'id' => $task->id,
                    'type' => 'task',
                    'content' => $task->title,
                    'description' => $task->description,
                    'author' => $task->client,
                    'is_flagged' => $task->is_flagged,
                    'flag_reason' => $task->flag_reason,
                    'flagged_at' => $task->flagged_at,
                    'flagged_by' => $task->flaggedBy,
                    'is_approved' => $task->is_approved,
                    'moderated_at' => $task->moderated_at,
                    'moderated_by' => $task->moderatedBy,
                ]);
            $data = array_merge($data, $tasks->toArray());
        }

        if ($type === 'review' || $type === 'all') {
            $reviews = Review::where('is_flagged', true)
                ->with(['reviewer', 'task', 'flaggedBy', 'moderatedBy'])
                ->orderBy('flagged_at', 'desc')
                ->get()
                ->map(fn($review) => [
                    'id' => $review->id,
                    'type' => 'review',
                    'content' => $review->comment,
                    'rating' => $review->rating,
                    'author' => $review->reviewer,
                    'task' => $review->task,
                    'is_flagged' => $review->is_flagged,
                    'flag_reason' => $review->flag_reason,
                    'flagged_at' => $review->flagged_at,
                    'flagged_by' => $review->flaggedBy,
                    'is_approved' => $review->is_approved,
                    'moderated_at' => $review->moderated_at,
                    'moderated_by' => $review->moderatedBy,
                ]);
            $data = array_merge($data, $reviews->toArray());
        }

        if ($type === 'message' || $type === 'all') {
            $messages = Message::where('is_flagged', true)
                ->with(['sender', 'task', 'flaggedBy', 'moderatedBy'])
                ->orderBy('flagged_at', 'desc')
                ->get()
                ->map(fn($message) => [
                    'id' => $message->id,
                    'type' => 'message',
                    'content' => $message->content,
                    'author' => $message->sender,
                    'task' => $message->task,
                    'is_flagged' => $message->is_flagged,
                    'flag_reason' => $message->flag_reason,
                    'flagged_at' => $message->flagged_at,
                    'flagged_by' => $message->flaggedBy,
                    'is_approved' => $message->is_approved,
                    'moderated_at' => $message->moderated_at,
                    'moderated_by' => $message->moderatedBy,
                ]);
            $data = array_merge($data, $messages->toArray());
        }

        // Sort by flagged_at
        usort($data, fn($a, $b) => strtotime($b['flagged_at']) - strtotime($a['flagged_at']));

        return response()->json(['data' => $data]);
    }

    /**
     * Flag content
     */
    public function flag(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:task,review,message'],
            'id' => ['required', 'integer'],
            'reason' => ['required', 'string', 'max:500'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $model = match($validated['type']) {
            'task' => Task::findOrFail($validated['id']),
            'review' => Review::findOrFail($validated['id']),
            'message' => Message::findOrFail($validated['id']),
        };

        $model->update([
            'is_flagged' => true,
            'flag_reason' => $validated['reason'],
            'flagged_at' => now(),
            'flagged_by' => $validated['user_id'],
        ]);

        // Notify admins
        $this->notifyAdmins($validated['type'], $model, $validated['reason']);

        return response()->json([
            'message' => 'Contenu signalé avec succès',
        ]);
    }

    /**
     * Approve flagged content
     */
    public function approve(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:task,review,message'],
            'id' => ['required', 'integer'],
            'admin_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($validated['admin_id']);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $model = match($validated['type']) {
            'task' => Task::findOrFail($validated['id']),
            'review' => Review::findOrFail($validated['id']),
            'message' => Message::findOrFail($validated['id']),
        };

        $model->update([
            'is_approved' => true,
            'is_flagged' => false,
            'moderated_at' => now(),
            'moderated_by' => $validated['admin_id'],
        ]);

        // Log activity
        AdminActivityLogger::log(
            'approved',
            ucfirst($validated['type']),
            $validated['id'],
            "Contenu approuvé après signalement"
        );

        return response()->json([
            'message' => 'Contenu approuvé',
        ]);
    }

    /**
     * Reject and hide flagged content
     */
    public function reject(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:task,review,message'],
            'id' => ['required', 'integer'],
            'admin_id' => ['required', 'integer', 'exists:users,id'],
            'action' => ['required', 'in:hide,delete'],
        ]);

        $admin = User::findOrFail($validated['admin_id']);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $model = match($validated['type']) {
            'task' => Task::findOrFail($validated['id']),
            'review' => Review::findOrFail($validated['id']),
            'message' => Message::findOrFail($validated['id']),
        };

        if ($validated['action'] === 'delete') {
            $model->delete();
            
            AdminActivityLogger::log(
                'deleted',
                ucfirst($validated['type']),
                $validated['id'],
                "Contenu supprimé suite à modération"
            );
        } else {
            $model->update([
                'is_approved' => false,
                'moderated_at' => now(),
                'moderated_by' => $validated['admin_id'],
            ]);

            AdminActivityLogger::log(
                'rejected',
                ucfirst($validated['type']),
                $validated['id'],
                "Contenu masqué suite à modération"
            );
        }

        // Notify content author
        $this->notifyAuthor($validated['type'], $model, $validated['action']);

        return response()->json([
            'message' => $validated['action'] === 'delete' ? 'Contenu supprimé' : 'Contenu masqué',
        ]);
    }

    /**
     * Get moderation statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'flagged_tasks' => Task::where('is_flagged', true)->count(),
            'flagged_reviews' => Review::where('is_flagged', true)->count(),
            'flagged_messages' => Message::where('is_flagged', true)->count(),
            'total_flagged' => Task::where('is_flagged', true)->count() +
                              Review::where('is_flagged', true)->count() +
                              Message::where('is_flagged', true)->count(),
            'moderated_today' => Task::whereDate('moderated_at', today())->count() +
                                Review::whereDate('moderated_at', today())->count() +
                                Message::whereDate('moderated_at', today())->count(),
            'pending_moderation' => Task::where('is_flagged', true)->whereNull('moderated_at')->count() +
                                   Review::where('is_flagged', true)->whereNull('moderated_at')->count() +
                                   Message::where('is_flagged', true)->whereNull('moderated_at')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Notify admins about flagged content
     */
    protected function notifyAdmins(string $type, $model, string $reason): void
    {
        $admins = User::where('is_admin', true)->get();

        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'content_flagged',
                'data' => [
                    'content_type' => $type,
                    'content_id' => $model->id,
                    'reason' => $reason,
                    'message' => "Nouveau contenu signalé: {$type}",
                ],
            ]);
        }
    }

    /**
     * Notify content author about moderation action
     */
    protected function notifyAuthor(string $type, $model, string $action): void
    {
        $userId = match($type) {
            'task' => $model->client_id,
            'review' => $model->reviewer_id,
            'message' => $model->sender_id,
        };

        if (!$userId) return;

        Notification::create([
            'user_id' => $userId,
            'type' => 'content_moderated',
            'data' => [
                'content_type' => $type,
                'action' => $action,
                'message' => $action === 'delete' 
                    ? "Votre contenu a été supprimé suite à un signalement"
                    : "Votre contenu a été masqué suite à un signalement",
            ],
        ]);
    }
}
