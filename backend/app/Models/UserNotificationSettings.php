<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserNotificationSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'enabled',
        'notification_mode',
        'channels',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'channels' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get default channels configuration
     */
    public static function getDefaultChannels(): array
    {
        return [
            'email' => true,
            'push' => true,
        ];
    }

    /**
     * Check if specific channel is enabled
     */
    public function isChannelEnabled(string $channel): bool
    {
        return $this->channels[$channel] ?? false;
    }
}
