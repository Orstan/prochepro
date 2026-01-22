<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCredit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'balance',
        'has_unlimited',
        'unlimited_expires_at',
        'used_free_credit',
    ];

    protected $casts = [
        'balance' => 'integer',
        'has_unlimited' => 'boolean',
        'unlimited_expires_at' => 'datetime',
        'used_free_credit' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Перевіряє чи є доступні кредити
     */
    public function hasCredits(): bool
    {
        // Якщо є активний безліміт
        if ($this->has_unlimited && $this->unlimited_expires_at && $this->unlimited_expires_at->isFuture()) {
            return true;
        }

        // Якщо є баланс
        return $this->balance > 0;
    }

    /**
     * Перевіряє чи є безкоштовний кредит
     */
    public function hasFreeCredit(): bool
    {
        return !$this->used_free_credit;
    }

    /**
     * Чи активний безліміт
     */
    public function hasActiveUnlimited(): bool
    {
        return $this->has_unlimited 
            && $this->unlimited_expires_at 
            && $this->unlimited_expires_at->isFuture();
    }
}
