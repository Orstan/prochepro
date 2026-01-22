<?php

namespace App\Http\Controllers\Api;

use App\Events\ChatMessageSent;
use App\Events\ChatTypingEvent;
use App\Http\Controllers\Controller;
use App\Models\SupportChatMessage;
use App\Models\SupportChatRoom;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupportChatController extends Controller
{
    /**
     * Get or create chat room for user
     */
    public function getOrCreateRoom(Request $request)
    {
        $userId = Auth::id();

        // Find existing open room or create new one
        $room = SupportChatRoom::where('user_id', $userId)
            ->whereIn('status', ['open', 'assigned'])
            ->first();

        if (!$room) {
            $room = SupportChatRoom::create([
                'user_id' => $userId,
                'status' => 'open',
                'priority' => 'normal',
                'category' => $request->category ?? 'general',
            ]);
        }

        return response()->json([
            'room' => $room->load(['user', 'assignedAdmin', 'latestMessage']),
        ]);
    }

    /**
     * Get all messages for a chat room
     */
    public function getMessages(Request $request, SupportChatRoom $room)
    {
        $this->authorize('view', $room);

        $messages = $room->messages()
            ->with('user:id,name,avatar,is_admin')
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        // Mark messages as read
        $isAdmin = Auth::user()->is_admin;
        $room->markAsRead($isAdmin);

        return response()->json($messages);
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request, SupportChatRoom $room)
    {
        $this->authorize('sendMessage', $room);

        $validated = $request->validate([
            'message' => 'nullable|string|max:5000',
            'type' => 'nullable|in:text,image,file',
            'attachments' => 'nullable|array',
            'attachments.*' => 'nullable|file|max:10240', // 10MB max per file
        ]);

        $user = Auth::user();
        
        // Handle file uploads
        $attachmentUrls = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('chat-attachments', 'public');
                $attachmentUrls[] = [
                    'url' => '/storage/' . $path,
                    'name' => $file->getClientOriginalName(),
                    'type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ];
            }
        }

        $message = SupportChatMessage::create([
            'chat_room_id' => $room->id,
            'user_id' => $user->id,
            'message' => $validated['message'] ?? '',
            'type' => $validated['type'] ?? ($attachmentUrls ? 'file' : 'text'),
            'attachments' => $attachmentUrls ?: ($validated['attachments'] ?? null),
            'is_admin' => $user->is_admin,
        ]);

        $message->load('user:id,name,avatar,is_admin');

        // Broadcast message via WebSocket
        broadcast(new ChatMessageSent($message))->toOthers();

        // Send push notification to the other party
        $this->sendNotification($room, $message, $user);

        return response()->json($message, 201);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(SupportChatRoom $room)
    {
        $this->authorize('view', $room);

        $isAdmin = Auth::user()->is_admin;
        $room->markAsRead($isAdmin);

        return response()->json(['message' => 'Marked as read']);
    }

    /**
     * Typing indicator
     */
    public function typing(Request $request, SupportChatRoom $room)
    {
        $this->authorize('sendMessage', $room);

        $user = Auth::user();

        broadcast(new ChatTypingEvent(
            $room->id,
            $user->id,
            $user->name,
            $request->boolean('is_typing', true)
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Get all rooms (for user)
     */
    public function getRooms(Request $request)
    {
        $userId = Auth::id();

        $rooms = SupportChatRoom::where('user_id', $userId)
            ->with(['latestMessage', 'assignedAdmin'])
            ->orderByDesc('last_message_at')
            ->paginate(20);

        return response()->json($rooms);
    }

    /**
     * Close chat room
     */
    public function closeRoom(SupportChatRoom $room)
    {
        $this->authorize('close', $room);

        $room->close();

        return response()->json(['message' => 'Chat closed']);
    }

    /**
     * Reopen chat room
     */
    public function reopenRoom(SupportChatRoom $room)
    {
        $this->authorize('reopen', $room);

        $room->reopen();

        return response()->json(['message' => 'Chat reopened']);
    }

    /**
     * Send notification to the other party
     */
    private function sendNotification($room, $message, $sender)
    {
        if ($sender->is_admin) {
            // Notify user
            $recipient = $room->user;
        } else {
            // Notify assigned admin or all admins
            $recipient = $room->assignedAdmin ?? User::where('is_admin', true)->first();
        }

        if ($recipient && $recipient->id !== $sender->id) {
            // Check if user is actively in chat (has unread count = 0)
            // If user is reading messages in real-time, don't spam notifications
            $unreadCount = $sender->is_admin ? $room->unread_user_count : $room->unread_admin_count;
            
            // Also check if there's already an unread notification for this chat
            $hasUnreadNotification = \App\Models\Notification::where('user_id', $recipient->id)
                ->where('type', 'chat_message')
                ->whereJsonContains('data->chat_room_id', $room->id)
                ->whereNull('read_at')
                ->exists();

            // Only create notification if user has unread messages OR no existing unread notification
            if ($unreadCount > 0 || !$hasUnreadNotification) {
                // Create in-app notification
                \App\Models\Notification::create([
                    'user_id' => $recipient->id,
                    'type' => 'chat_message',
                    'data' => [
                        'chat_room_id' => $room->id,
                        'message_id' => $message->id,
                        'sender_name' => $sender->name,
                        'message_preview' => \Str::limit($message->message, 50),
                    ],
                ]);

                // Push notification (only if user is not actively reading)
                if ($recipient->push_notifications !== false && $unreadCount > 0) {
                    $webPush = new \App\Services\WebPushService();
                    $webPush->sendToUser(
                        $recipient,
                        'Nouveau message',
                        "{$sender->name}: " . \Str::limit($message->message, 100),
                        '/support/chat',
                        'chat-' . $room->id
                    );
                }
            }
        }
    }
}
