<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessengerSettings extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'telegram_chat_id',
        'telegram_username',
        'whatsapp_number',
        'whatsapp_verified',
        'telegram_enabled',
        'whatsapp_enabled',
        'notification_types',
        'verification_code',
        'verification_expires_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'telegram_enabled' => 'boolean',
        'whatsapp_enabled' => 'boolean',
        'whatsapp_verified' => 'boolean',
        'notification_types' => 'array',
        'verification_expires_at' => 'datetime',
    ];

    /**
     * Get the user that owns the messenger settings.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the settings has any enabled messenger.
     */
    public function hasEnabledMessenger(): bool
    {
        return ($this->telegram_enabled && $this->telegram_chat_id) || 
               ($this->whatsapp_enabled && $this->whatsapp_verified && $this->whatsapp_number);
    }

    /**
     * Generate a verification code for WhatsApp.
     */
    public function generateVerificationCode(): string
    {
        $code = mt_rand(100000, 999999);
        $this->verification_code = $code;
        $this->verification_expires_at = now()->addMinutes(30);
        $this->save();
        
        return (string) $code;
    }

    /**
     * Verify WhatsApp number with code.
     */
    public function verifyWhatsApp(string $code): bool
    {
        if ($this->verification_code === $code && 
            $this->verification_expires_at && 
            $this->verification_expires_at->isFuture()) {
            
            $this->whatsapp_verified = true;
            $this->verification_code = null;
            $this->verification_expires_at = null;
            $this->save();
            
            return true;
        }
        
        return false;
    }
}
