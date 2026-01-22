<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstantBooking extends Model
{
    protected $fillable = [
        'client_id',
        'prestataire_id',
        'service_fixed_price_id',
        'booking_date',
        'booking_time',
        'duration_minutes',
        'price',
        'platform_fee',
        'total_price',
        'status',
        'client_notes',
        'prestataire_notes',
        'cancellation_reason',
        'address',
        'city',
        'postal_code',
        'latitude',
        'longitude',
        'confirmed_at',
        'started_at',
        'completed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'price' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'total_price' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'confirmed_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function prestataire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prestataire_id');
    }

    public function serviceFixedPrice(): BelongsTo
    {
        return $this->belongsTo(ServiceFixedPrice::class);
    }

    public function payment()
    {
        return $this->hasOne(InstantBookingPayment::class);
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('booking_date', '>=', today())
            ->whereIn('status', ['confirmed', 'pending_payment']);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['confirmed', 'in_progress']);
    }

    // Methods
    public function canBeCancelled(): bool
    {
        if (!in_array($this->status, ['pending_payment', 'confirmed'])) {
            return false;
        }

        $settings = $this->prestataire->instantBookingSettings;
        if (!$settings) {
            return true;
        }

        $bookingDateTime = \Carbon\Carbon::parse($this->booking_date . ' ' . $this->booking_time);
        $hoursUntilBooking = now()->diffInHours($bookingDateTime, false);

        return $hoursUntilBooking > $settings->free_cancellation_hours;
    }

    public function getCancellationFee(): float
    {
        if ($this->canBeCancelled()) {
            return 0;
        }

        $settings = $this->prestataire->instantBookingSettings;
        if (!$settings) {
            return 0;
        }

        return $this->total_price * ($settings->cancellation_fee_percentage / 100);
    }

    public function isInPast(): bool
    {
        $bookingDateTime = \Carbon\Carbon::parse($this->booking_date . ' ' . $this->booking_time);
        return $bookingDateTime->isPast();
    }

    public function getFullAddress(): string
    {
        return "{$this->address}, {$this->postal_code} {$this->city}";
    }
}
