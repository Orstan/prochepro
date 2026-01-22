<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailAutomationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'campaign_type',
        'sequence_step',
        'status',
        'scheduled_for',
        'sent_at',
        'error_message',
        'metadata',
    ];

    protected $casts = [
        'scheduled_for' => 'datetime',
        'sent_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeReadyToSend($query)
    {
        return $query->where('status', 'pending')
                    ->where('scheduled_for', '<=', now());
    }

    public function markAsSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
        ]);
    }

    public function markAsSkipped(): void
    {
        $this->update(['status' => 'skipped']);
    }
}
