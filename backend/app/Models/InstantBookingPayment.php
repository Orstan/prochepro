<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstantBookingPayment extends Model
{
    protected $fillable = [
        'instant_booking_id',
        'stripe_payment_intent_id',
        'amount',
        'status',
        'refund_status',
        'refund_amount',
        'refund_reason',
        'paid_at',
        'refunded_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    public function instantBooking(): BelongsTo
    {
        return $this->belongsTo(InstantBooking::class);
    }

    public function isPaid(): bool
    {
        return $this->status === 'succeeded';
    }

    public function isRefunded(): bool
    {
        return $this->refund_status !== null && $this->refund_status !== 'none';
    }

    public function getRefundAmount(): float
    {
        return $this->refund_amount ?? 0;
    }
}
