<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Notification;
use App\Models\User;
use App\Services\WebPushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WearableController extends Controller
{
    /**
     * Get compact task list optimized for smartwatch display
     */
    public function getActiveTasks(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $query = Task::query();
        
        if ($user->role === 'client' || in_array('client', $user->roles ?? [])) {
            $query->where('client_id', $user->id);
        } else {
            $query->where('prestataire_id', $user->id);
        }
        
        $tasks = $query->whereIn('status', ['pending', 'accepted', 'in_progress', 'on_the_way'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'status' => $task->status,
                    'category' => $task->category,
                    'city' => $task->city,
                    'budget' => $task->budget_max ?? $task->budget_min,
                    'created_at' => $task->created_at->format('H:i'),
                    'eta_minutes' => $task->eta_minutes,
                ];
            });

        return response()->json([
            'tasks' => $tasks,
            'count' => $tasks->count(),
        ]);
    }

    /**
     * Get compact task details for smartwatch
     */
    public function getTaskDetails(Task $task): JsonResponse
    {
        $user = Auth::user();
        
        // Verify user has access to this task
        if ($task->client_id !== $user->id && $task->prestataire_id !== $user->id) {
            return response()->json([
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        $prestataire = null;
        if ($task->prestataire_id) {
            $prestataire = User::find($task->prestataire_id);
        }

        return response()->json([
            'id' => $task->id,
            'title' => $task->title,
            'status' => $task->status,
            'category' => $task->category,
            'city' => $task->city,
            'address' => $task->address,
            'budget' => $task->budget_max ?? $task->budget_min,
            'eta_minutes' => $task->eta_minutes,
            'latitude' => $task->latitude,
            'longitude' => $task->longitude,
            'prestataire' => $prestataire ? [
                'id' => $prestataire->id,
                'name' => $prestataire->name,
                'phone' => $prestataire->phone,
                'avatar' => $prestataire->avatar,
                'current_latitude' => $prestataire->current_latitude,
                'current_longitude' => $prestataire->current_longitude,
            ] : null,
        ]);
    }

    /**
     * Get recent notifications optimized for smartwatch
     */
    public function getNotifications(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $this->getNotificationTitle($notification->type),
                    'message' => $this->getNotificationMessage($notification),
                    'read' => $notification->read_at !== null,
                    'time' => $notification->created_at->diffForHumans(),
                    'task_id' => $notification->data['task_id'] ?? null,
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => Notification::where('user_id', $user->id)
                ->whereNull('read_at')
                ->count(),
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markNotificationRead(Notification $notification): JsonResponse
    {
        $user = Auth::user();
        
        if ($notification->user_id !== $user->id) {
            return response()->json([
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        $notification->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Notification marquée comme lue.',
        ]);
    }

    /**
     * Update prestataire location from smartwatch
     */
    public function updateLocation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy' => ['nullable', 'numeric'],
        ]);

        $user = Auth::user();
        
        $user->update([
            'current_latitude' => $validated['latitude'],
            'current_longitude' => $validated['longitude'],
            'location_updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Localisation mise à jour.',
            'latitude' => $user->current_latitude,
            'longitude' => $user->current_longitude,
        ]);
    }

    /**
     * Quick action: Mark task as "on the way"
     */
    public function markOnTheWay(Task $task, Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if ($task->prestataire_id !== $user->id) {
            return response()->json([
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        $validated = $request->validate([
            'eta_minutes' => ['nullable', 'integer', 'min:1', 'max:180'],
        ]);

        $task->update([
            'status' => 'on_the_way',
            'eta_minutes' => $validated['eta_minutes'] ?? 30,
        ]);

        // Notify client
        $client = User::find($task->client_id);
        if ($client) {
            Notification::create([
                'user_id' => $client->id,
                'type' => 'prestataire_on_the_way',
                'data' => [
                    'task_id' => $task->id,
                    'prestataire_name' => $user->name,
                    'eta_minutes' => $task->eta_minutes,
                ],
            ]);

            if ($client->push_notifications !== false) {
                $webPush = new WebPushService();
                $webPush->sendToUser(
                    $client,
                    'Prestataire en route',
                    "{$user->name} est en route. Arrivée estimée : {$task->eta_minutes} min."
                );
            }
        }

        return response()->json([
            'message' => 'Statut mis à jour : en route.',
            'task' => [
                'id' => $task->id,
                'status' => $task->status,
                'eta_minutes' => $task->eta_minutes,
            ],
        ]);
    }

    /**
     * Quick action: Mark task as "arrived"
     */
    public function markArrived(Task $task): JsonResponse
    {
        $user = Auth::user();
        
        if ($task->prestataire_id !== $user->id) {
            return response()->json([
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        $task->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        // Notify client
        $client = User::find($task->client_id);
        if ($client) {
            Notification::create([
                'user_id' => $client->id,
                'type' => 'prestataire_arrived',
                'data' => [
                    'task_id' => $task->id,
                    'prestataire_name' => $user->name,
                ],
            ]);

            if ($client->push_notifications !== false) {
                $webPush = new WebPushService();
                $webPush->sendToUser(
                    $client,
                    'Prestataire arrivé',
                    "{$user->name} est arrivé sur place."
                );
            }
        }

        return response()->json([
            'message' => 'Statut mis à jour : arrivé.',
            'task' => [
                'id' => $task->id,
                'status' => $task->status,
            ],
        ]);
    }

    /**
     * Quick action: Mark task as completed
     */
    public function markCompleted(Task $task): JsonResponse
    {
        $user = Auth::user();
        
        if ($task->prestataire_id !== $user->id) {
            return response()->json([
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        $task->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Notify client
        $client = User::find($task->client_id);
        if ($client) {
            Notification::create([
                'user_id' => $client->id,
                'type' => 'task_completed',
                'data' => [
                    'task_id' => $task->id,
                    'prestataire_name' => $user->name,
                ],
            ]);

            if ($client->push_notifications !== false) {
                $webPush = new WebPushService();
                $webPush->sendToUser(
                    $client,
                    'Tâche terminée',
                    "{$user->name} a marqué la tâche comme terminée."
                );
            }
        }

        return response()->json([
            'message' => 'Tâche marquée comme terminée.',
            'task' => [
                'id' => $task->id,
                'status' => $task->status,
            ],
        ]);
    }

    /**
     * Get user's current status and stats for smartwatch home screen
     */
    public function getDashboard(): JsonResponse
    {
        $user = Auth::user();
        
        $activeTasks = Task::where(function ($query) use ($user) {
            $query->where('client_id', $user->id)
                  ->orWhere('prestataire_id', $user->id);
        })
        ->whereIn('status', ['pending', 'accepted', 'in_progress', 'on_the_way'])
        ->count();

        $unreadNotifications = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        $todayTasks = Task::where(function ($query) use ($user) {
            $query->where('client_id', $user->id)
                  ->orWhere('prestataire_id', $user->id);
        })
        ->whereDate('created_at', today())
        ->count();

        return response()->json([
            'user' => [
                'name' => $user->name,
                'avatar' => $user->avatar,
                'role' => $user->role,
            ],
            'stats' => [
                'active_tasks' => $activeTasks,
                'unread_notifications' => $unreadNotifications,
                'today_tasks' => $todayTasks,
            ],
            'current_task' => $this->getCurrentTask($user),
        ]);
    }

    /**
     * Get current active task for quick access
     */
    protected function getCurrentTask(User $user): ?array
    {
        $task = Task::where(function ($query) use ($user) {
            $query->where('client_id', $user->id)
                  ->orWhere('prestataire_id', $user->id);
        })
        ->whereIn('status', ['on_the_way', 'in_progress'])
        ->orderBy('updated_at', 'desc')
        ->first();

        if (!$task) {
            return null;
        }

        return [
            'id' => $task->id,
            'title' => $task->title,
            'status' => $task->status,
            'eta_minutes' => $task->eta_minutes,
            'city' => $task->city,
        ];
    }

    /**
     * Helper: Get notification title
     */
    protected function getNotificationTitle(string $type): string
    {
        return match ($type) {
            'new_offer' => 'Nouvelle offre',
            'offer_accepted' => 'Offre acceptée',
            'task_completed' => 'Tâche terminée',
            'prestataire_on_the_way' => 'En route',
            'prestataire_arrived' => 'Arrivé',
            'payment_received' => 'Paiement reçu',
            'new_message' => 'Nouveau message',
            default => 'Notification',
        };
    }

    /**
     * Helper: Get notification message
     */
    protected function getNotificationMessage(Notification $notification): string
    {
        $data = $notification->data;
        
        return match ($notification->type) {
            'new_offer' => "Nouvelle offre de " . ($data['prestataire_name'] ?? 'un prestataire'),
            'offer_accepted' => "Votre offre a été acceptée",
            'task_completed' => "Tâche terminée par " . ($data['prestataire_name'] ?? 'le prestataire'),
            'prestataire_on_the_way' => ($data['prestataire_name'] ?? 'Le prestataire') . " est en route",
            'prestataire_arrived' => ($data['prestataire_name'] ?? 'Le prestataire') . " est arrivé",
            'payment_received' => "Paiement de " . ($data['amount'] ?? '0') . "€ reçu",
            'new_message' => "Nouveau message de " . ($data['sender_name'] ?? 'quelqu\'un'),
            default => $data['message'] ?? 'Nouvelle notification',
        };
    }
}
