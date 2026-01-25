<?php

namespace App\Http\Controllers\Api;

use App\Events\NewChatMessage;
use App\Http\Controllers\Controller;
use App\Mail\NewChatMessageMail;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Offer;
use App\Models\Task;
use App\Models\User;
use App\Services\WebPushService;
use App\Services\TelegramNotificationService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request, Task $task): JsonResponse
    {
        $messages = Message::query()
            ->where('task_id', $task->id)
            ->with('sender')
            ->orderBy('created_at')
            ->get();

        return response()->json($messages);
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'body' => ['required', 'string'],
        ]);

        // Manual Bearer token parsing since auth:sanctum middleware is removed
        $token = $request->bearerToken();
        $user = null;
        
        if ($token) {
            $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;
        }
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $message = Message::create([
            'task_id' => $task->id,
            'sender_id' => $user->id,
            'body' => $validated['body'],
        ]);

        // Send notifications to recipient
        try {
            $senderId = $user->id;
            $recipientId = null;
            
            // Find recipient based on task relationships
            if ($task->client_id == $senderId) {
                // Sender is client, find prestataire through accepted offer
                $acceptedOffer = Offer::where('task_id', $task->id)
                    ->where('status', 'accepted')
                    ->first();
                if ($acceptedOffer) {
                    $recipientId = $acceptedOffer->prestataire_id;
                }
            } else {
                // Sender is prestataire, recipient is client
                $recipientId = $task->client_id;
            }
            
            if ($recipientId) {
                $recipient = User::find($recipientId);
                if ($recipient) {
                    // Web Push notification
                    if ($recipient->push_notifications !== false) {
                        $webPush = app(WebPushService::class);
                        $webPush->notifyNewMessage(
                            $recipient,
                            $user->name,
                            $task->title
                        );
                    }
                    
                    // Telegram notification
                    try {
                        TelegramNotificationService::notifyNewMessage(
                            $recipient,
                            $task,
                            $validated['body'],
                            $user->name
                        );
                    } catch (\Throwable $telegramError) {
                        \Log::error('Telegram notification failed', [
                            'error' => $telegramError->getMessage(),
                            'task_id' => $task->id,
                            'recipient_id' => $recipient->id,
                        ]);
                    }
                }
            }
        } catch (\Throwable $e) {
            \Log::error('Notification failed in MessageController', [
                'error' => $e->getMessage(),
                'task_id' => $task->id,
            ]);
        }

        return response()->json($message->load('sender'), 201);
    }

    public function typing(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'is_typing' => ['required', 'boolean'],
        ]);

        // Manual Bearer token parsing
        $token = $request->bearerToken();
        $user = null;
        
        if ($token) {
            $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;
        }
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Broadcast typing event
        // event(new UserTyping($task->id, $user->id, $validated['is_typing']));

        return response()->json(['success' => true]);
    }

    public function markAsRead(Request $request, Task $task, Message $message): JsonResponse
    {
        \Log::info('markAsRead called', [
            'task_id' => $task->id,
            'message_id' => $message->id,
            'message_sender_id' => $message->sender_id,
        ]);

        // Manual Bearer token parsing
        $token = $request->bearerToken();
        $user = null;
        
        if ($token) {
            $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;
        }
        
        if (!$user) {
            \Log::warning('markAsRead: No user authenticated');
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        \Log::info('markAsRead: User authenticated', ['user_id' => $user->id]);

        if ($message->task_id !== $task->id) {
            \Log::error('markAsRead: Message does not belong to task');
            return response()->json(['error' => 'Message does not belong to this task'], 404);
        }

        if ($message->sender_id === $user->id) {
            \Log::info('markAsRead: User trying to mark own message as read - skipping');
            return response()->json(['error' => 'Cannot mark own message as read'], 400);
        }

        \Log::info('markAsRead: Updating message', [
            'message_id' => $message->id,
            'is_read_before' => $message->is_read,
        ]);

        $message->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        $message->refresh();

        \Log::info('markAsRead: Message updated', [
            'message_id' => $message->id,
            'is_read_after' => $message->is_read,
            'read_at' => $message->read_at,
        ]);

        // Broadcast message read event
        // event(new MessageRead($message->id, $user->id));

        return response()->json(['success' => true]);
    }

    public function getUnreadCount(Request $request): JsonResponse
    {
        $userId = $request->query('user_id');
        
        if (!$userId) {
            return response()->json(['error' => 'user_id required'], 400);
        }

        try {
            $user = User::find($userId);
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // Get all task IDs where user is involved
            $taskIds = [];
            
            // Tasks where user is client
            $clientTaskIds = Task::where('client_id', $userId)
                ->pluck('id')
                ->toArray();
            
            // Tasks where user is prestataire (through accepted offers)
            $prestataireTaskIds = Offer::where('prestataire_id', $userId)
                ->where('status', 'accepted')
                ->pluck('task_id')
                ->toArray();
            
            $taskIds = array_unique(array_merge($clientTaskIds, $prestataireTaskIds));
            
            if (empty($taskIds)) {
                return response()->json([
                    'unread_count' => 0,
                    'as_client' => 0,
                    'as_prestataire' => 0,
                ]);
            }

            // Count unread messages - use read_at as primary indicator
            $unreadAsClient = Message::whereIn('task_id', $clientTaskIds)
                ->where('sender_id', '!=', $userId)
                ->whereNull('read_at')
                ->count();
            
            $unreadAsPrestataire = Message::whereIn('task_id', $prestataireTaskIds)
                ->where('sender_id', '!=', $userId)
                ->whereNull('read_at')
                ->count();
            
            $totalUnread = $unreadAsClient + $unreadAsPrestataire;

            return response()->json([
                'unread_count' => $totalUnread,
                'as_client' => $unreadAsClient,
                'as_prestataire' => $unreadAsPrestataire,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error counting unread messages', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Internal server error',
                'message' => config('app.debug') ? $e->getMessage() : 'Please try again later'
            ], 500);
        }
    }
}
