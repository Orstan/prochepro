<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_room_id',
        'user_id',
        'message',
        'type',
        'attachments',
        'is_admin',
        'read_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'is_admin' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function chatRoom(): BelongsTo
    {
        return $this->belongsTo(SupportChatRoom::class, 'chat_room_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    protected static function booted()
    {
        static::created(function ($message) {
            // Update chat room's last_message_at
            $message->chatRoom->update([
                'last_message_at' => $message->created_at,
            ]);

            // Increment unread counter
            $message->chatRoom->incrementUnread($message->is_admin);
        });
    }
}
