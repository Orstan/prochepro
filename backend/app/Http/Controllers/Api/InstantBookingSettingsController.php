<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrestataireInstantBookingSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InstantBookingSettingsController extends Controller
{
    /**
     * Get current settings
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Accès réservé aux prestataires'], 403);
        }

        $settings = $user->instantBookingSettings;

        if (!$settings) {
            // Create default settings
            $settings = PrestataireInstantBookingSetting::create([
                'prestataire_id' => $user->id,
                'instant_booking_enabled' => false,
                'advance_booking_hours' => 2,
                'max_bookings_per_day' => 5,
                'auto_confirm' => true,
                'default_start_time' => '09:00',
                'default_end_time' => '18:00',
                'working_days' => [1, 2, 3, 4, 5], // Monday to Friday
                'cancellation_fee_percentage' => 50,
                'free_cancellation_hours' => 2,
            ]);
        }

        return response()->json($settings);
    }

    /**
     * Update settings
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Accès réservé aux prestataires'], 403);
        }

        // Check prestataire eligibility
        if ($user->average_rating < 4.5) {
            return response()->json([
                'message' => 'Note moyenne minimum de 4.5⭐ requise'
            ], 422);
        }

        if ($user->completed_tasks_count < 10) {
            return response()->json([
                'message' => 'Minimum 10 missions complétées requises'
            ], 422);
        }

        if (!$user->is_verified) {
            return response()->json([
                'message' => 'Profil vérifié requis'
            ], 422);
        }

        $validated = $request->validate([
            'instant_booking_enabled' => 'sometimes|boolean',
            'advance_booking_hours' => 'sometimes|integer|min:1|max:72',
            'max_bookings_per_day' => 'sometimes|integer|min:1|max:20',
            'auto_confirm' => 'sometimes|boolean',
            'default_start_time' => 'sometimes|date_format:H:i',
            'default_end_time' => 'sometimes|date_format:H:i|after:default_start_time',
            'working_days' => 'sometimes|array',
            'working_days.*' => 'integer|min:0|max:6',
            'cancellation_fee_percentage' => 'sometimes|numeric|min:0|max:100',
            'free_cancellation_hours' => 'sometimes|integer|min:0|max:72',
        ]);

        $settings = $user->instantBookingSettings;

        if (!$settings) {
            $validated['prestataire_id'] = $user->id;
            $settings = PrestataireInstantBookingSetting::create($validated);
        } else {
            $settings->update($validated);
        }

        return response()->json([
            'message' => 'Paramètres mis à jour',
            'settings' => $settings,
        ]);
    }

    /**
     * Enable instant booking
     */
    public function enable(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Accès réservé aux prestataires'], 403);
        }

        // Check eligibility
        if ($user->average_rating < 4.5) {
            return response()->json([
                'message' => 'Note moyenne minimum de 4.5⭐ requise pour activer Instant Booking'
            ], 422);
        }

        if ($user->completed_tasks_count < 10) {
            return response()->json([
                'message' => 'Minimum 10 missions complétées requises pour activer Instant Booking'
            ], 422);
        }

        if (!$user->is_verified) {
            return response()->json([
                'message' => 'Vous devez vérifier votre profil avant d\'activer Instant Booking'
            ], 422);
        }

        $settings = $user->instantBookingSettings;

        if (!$settings) {
            $settings = PrestataireInstantBookingSetting::create([
                'prestataire_id' => $user->id,
                'instant_booking_enabled' => true,
                'advance_booking_hours' => 2,
                'max_bookings_per_day' => 5,
                'auto_confirm' => true,
                'default_start_time' => '09:00',
                'default_end_time' => '18:00',
                'working_days' => [1, 2, 3, 4, 5],
                'cancellation_fee_percentage' => 50,
                'free_cancellation_hours' => 2,
            ]);
        } else {
            $settings->instant_booking_enabled = true;
            $settings->save();
        }

        return response()->json([
            'message' => 'Instant Booking activé avec succès',
            'settings' => $settings,
        ]);
    }

    /**
     * Disable instant booking
     */
    public function disable(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Accès réservé aux prestataires'], 403);
        }

        $settings = $user->instantBookingSettings;

        if (!$settings) {
            return response()->json([
                'message' => 'Instant Booking déjà désactivé'
            ], 422);
        }

        // Check for active bookings
        $hasActiveBookings = $user->instantBookingsAsPrestataire()
            ->whereIn('status', ['confirmed', 'in_progress'])
            ->exists();

        if ($hasActiveBookings) {
            return response()->json([
                'message' => 'Impossible de désactiver : vous avez des réservations actives. Complétez-les d\'abord.'
            ], 422);
        }

        $settings->instant_booking_enabled = false;
        $settings->save();

        return response()->json([
            'message' => 'Instant Booking désactivé',
            'settings' => $settings,
        ]);
    }
}
