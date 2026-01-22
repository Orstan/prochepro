<?php

namespace App\Events;

use App\Models\SupportChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public SupportChatMessage $message
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('chat.' . $this->message->chat_room_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'chat_room_id' => $this->message->chat_room_id,
            'user_id' => $this->message->user_id,
            'user' => [
                'id' => $this->message->user->id,
                'name' => $this->message->user->name,
                'avatar' => $this->message->user->avatar,
            ],
            'message' => $this->message->message,
            'type' => $this->message->type,
            'attachments' => $this->message->attachments,
            'is_admin' => $this->message->is_admin,
            'created_at' => $this->message->created_at->toIso8601String(),
        ];
    }
}
