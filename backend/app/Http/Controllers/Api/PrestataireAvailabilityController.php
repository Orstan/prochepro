<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrestataireAvailability;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class PrestataireAvailabilityController extends Controller
{
    /**
     * Get prestataire availability (public - for booking page)
     */
    public function show(int $prestataireId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $availability = PrestataireAvailability::where('prestataire_id', $prestataireId)
            ->whereBetween('date', [$validated['start_date'], $validated['end_date']])
            ->where('status', 'available')
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return response()->json($availability);
    }

    /**
     * Get own availability (for prestataire dashboard)
     */
    public function myAvailability(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Accès réservé aux prestataires'], 403);
        }

        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $validated['start_date'] ?? today()->toDateString();
        $endDate = $validated['end_date'] ?? today()->addDays(30)->toDateString();

        $availability = PrestataireAvailability::where('prestataire_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        // Group by date for easier frontend handling
        $grouped = $availability->groupBy(function($item) {
            return $item->date->format('Y-m-d');
        });

        return response()->json([
            'availability' => $availability,
            'grouped' => $grouped,
        ]);
    }

    /**
     * Generate default availability slots
     */
    public function generateSlots(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Accès réservé aux prestataires'], 403);
        }

        if (!$user->hasInstantBookingEnabled()) {
            return response()->json([
                'message' => 'Vous devez activer Instant Booking dans vos paramètres'
            ], 422);
        }

        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);

        // Limit to max 90 days
        if ($startDate->diffInDays($endDate) > 90) {
            return response()->json([
                'message' => 'Maximum 90 jours à la fois'
            ], 422);
        }

        PrestataireAvailability::generateDefaultSlotsForPrestataire($user, $startDate, $endDate);

        return response()->json([
            'message' => 'Créneaux générés avec succès',
        ]);
    }

    /**
     * Update single availability slot
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $slot = PrestataireAvailability::findOrFail($id);

        if ($slot->prestataire_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:available,blocked',
        ]);

        // Don't allow changing status if slot is booked
        if ($slot->status === 'booked') {
            return response()->json([
                'message' => 'Ce créneau est déjà réservé'
            ], 422);
        }

        $slot->update($validated);

        return response()->json([
            'message' => 'Créneau mis à jour',
            'slot' => $slot,
        ]);
    }

    /**
     * Block specific time slot
     */
    public function block(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Accès réservé aux prestataires'], 403);
        }

        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        // Find or create slot
        $slot = PrestataireAvailability::updateOrCreate(
            [
                'prestataire_id' => $user->id,
                'date' => $validated['date'],
                'start_time' => $validated['start_time'],
            ],
            [
                'end_time' => $validated['end_time'],
                'status' => 'blocked',
            ]
        );

        return response()->json([
            'message' => 'Créneau bloqué',
            'slot' => $slot,
        ]);
    }

    /**
     * Delete/unblock availability slot
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $slot = PrestataireAvailability::findOrFail($id);

        if ($slot->prestataire_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Don't allow deleting booked slots
        if ($slot->status === 'booked') {
            return response()->json([
                'message' => 'Impossible de supprimer un créneau réservé'
            ], 422);
        }

        $slot->delete();

        return response()->json([
            'message' => 'Créneau supprimé',
        ]);
    }

    /**
     * Bulk update availability (block multiple days/times)
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Accès réservé aux prestataires'], 403);
        }

        $validated = $request->validate([
            'dates' => 'required|array',
            'dates.*' => 'date|after_or_equal:today',
            'time_slots' => 'required|array',
            'time_slots.*.start_time' => 'required|date_format:H:i',
            'time_slots.*.end_time' => 'required|date_format:H:i',
            'status' => 'required|in:available,blocked',
        ]);

        $updated = 0;

        foreach ($validated['dates'] as $date) {
            foreach ($validated['time_slots'] as $timeSlot) {
                PrestataireAvailability::updateOrCreate(
                    [
                        'prestataire_id' => $user->id,
                        'date' => $date,
                        'start_time' => $timeSlot['start_time'],
                    ],
                    [
                        'end_time' => $timeSlot['end_time'],
                        'status' => $validated['status'],
                    ]
                );
                $updated++;
            }
        }

        return response()->json([
            'message' => "{$updated} créneaux mis à jour",
        ]);
    }
}
