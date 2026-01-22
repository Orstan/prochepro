<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportChatRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'assigned_to',
        'priority',
        'category',
        'last_message_at',
        'assigned_at',
        'resolved_at',
        'closed_at',
        'unread_user_count',
        'unread_admin_count',
        'metadata',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'assigned_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(SupportChatMessage::class, 'chat_room_id');
    }

    public function latestMessage()
    {
        return $this->hasOne(SupportChatMessage::class, 'chat_room_id')->latestOfMany();
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeAssigned($query)
    {
        return $query->where('status', 'assigned');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    public function markAsRead(bool $isAdmin = false): void
    {
        if ($isAdmin) {
            $this->update(['unread_admin_count' => 0]);
        } else {
            $this->update(['unread_user_count' => 0]);
        }
    }

    public function incrementUnread(bool $isAdmin = false): void
    {
        if ($isAdmin) {
            $this->increment('unread_admin_count');
        } else {
            $this->increment('unread_user_count');
        }
    }

    public function assign(int $adminId): void
    {
        $this->update([
            'assigned_to' => $adminId,
            'status' => 'assigned',
            'assigned_at' => now(),
        ]);
    }

    public function resolve(): void
    {
        $this->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);
    }

    public function close(): void
    {
        $this->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);
    }

    public function reopen(): void
    {
        $this->update([
            'status' => 'open',
            'resolved_at' => null,
            'closed_at' => null,
        ]);
    }
}
