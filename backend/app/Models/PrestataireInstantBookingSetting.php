<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrestataireInstantBookingSetting extends Model
{
    protected $fillable = [
        'prestataire_id',
        'instant_booking_enabled',
        'advance_booking_hours',
        'max_bookings_per_day',
        'auto_confirm',
        'default_start_time',
        'default_end_time',
        'working_days',
        'cancellation_fee_percentage',
        'free_cancellation_hours',
    ];

    protected $casts = [
        'instant_booking_enabled' => 'boolean',
        'auto_confirm' => 'boolean',
        'working_days' => 'array',
        'cancellation_fee_percentage' => 'decimal:2',
    ];

    public function prestataire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prestataire_id');
    }

    public function isWorkingDay(int $dayOfWeek): bool
    {
        if (!$this->working_days) {
            return in_array($dayOfWeek, [1, 2, 3, 4, 5]); // Default: Monday-Friday
        }

        return in_array($dayOfWeek, $this->working_days);
    }

    public function getWorkingDaysNames(): array
    {
        $days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        $workingDays = $this->working_days ?? [1, 2, 3, 4, 5];
        
        return array_map(fn($day) => $days[$day], $workingDays);
    }
}
