<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromotionPurchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'task_id',
        'package_id',
        'days',
        'price',
        'is_free',
        'payment_intent_id',
        'status',
        'starts_at',
        'expires_at',
        'granted_by_admin_id',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_free' => 'boolean',
        'days' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the user who made the purchase
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the task being promoted
     */
    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the package used
     */
    public function package()
    {
        return $this->belongsTo(PromotionPackage::class);
    }

    /**
     * Get the admin who granted free promotion
     */
    public function grantedByAdmin()
    {
        return $this->belongsTo(User::class, 'granted_by_admin_id');
    }

    /**
     * Apply promotion to task
     */
    public function applyToTask(): void
    {
        if ($this->status === 'completed' && $this->task) {
            $this->task->promoted_until = $this->expires_at;
            $this->task->save();
        }
    }
}
