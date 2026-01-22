<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class PrestataireAvailability extends Model
{
    protected $table = 'prestataire_availability';

    protected $fillable = [
        'prestataire_id',
        'date',
        'start_time',
        'end_time',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function prestataire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prestataire_id');
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    public function scopeFuture($query)
    {
        return $query->where('date', '>=', today());
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function getFormattedTimeSlot(): string
    {
        return Carbon::parse($this->start_time)->format('H:i') . ' - ' . 
               Carbon::parse($this->end_time)->format('H:i');
    }

    public static function generateDefaultSlotsForPrestataire(User $prestataire, Carbon $startDate, Carbon $endDate)
    {
        $settings = $prestataire->instantBookingSettings;
        if (!$settings || !$settings->instant_booking_enabled) {
            return;
        }

        $workingDays = $settings->working_days ?? [1, 2, 3, 4, 5]; // Monday-Friday by default
        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {
            // Check if this is a working day
            if (in_array($currentDate->dayOfWeek, $workingDays)) {
                // Generate hourly slots
                $startTime = Carbon::parse($settings->default_start_time);
                $endTime = Carbon::parse($settings->default_end_time);

                while ($startTime->lt($endTime)) {
                    $slotEnd = $startTime->copy()->addHour();
                    
                    // Check if slot doesn't already exist
                    $exists = self::where('prestataire_id', $prestataire->id)
                        ->where('date', $currentDate->toDateString())
                        ->where('start_time', $startTime->toTimeString())
                        ->exists();

                    if (!$exists) {
                        self::create([
                            'prestataire_id' => $prestataire->id,
                            'date' => $currentDate->toDateString(),
                            'start_time' => $startTime->toTimeString(),
                            'end_time' => $slotEnd->toTimeString(),
                            'status' => 'available',
                        ]);
                    }

                    $startTime->addHour();
                }
            }

            $currentDate->addDay();
        }
    }
}
