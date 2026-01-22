<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstantBooking;
use App\Models\ServiceFixedPrice;
use App\Models\PrestataireAvailability;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class InstantBookingController extends Controller
{
    /**
     * Get bookings for authenticated user (client or prestataire)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = InstantBooking::with(['client', 'prestataire', 'serviceFixedPrice']);

        // Filter by role
        if ($user->role === 'client') {
            $query->where('client_id', $user->id);
        } else {
            $query->where('prestataire_id', $user->id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter upcoming/past
        if ($request->has('filter')) {
            if ($request->filter === 'upcoming') {
                $query->where('booking_date', '>=', today())
                    ->whereIn('status', ['confirmed', 'pending_payment']);
            } elseif ($request->filter === 'past') {
                $query->where(function($q) {
                    $q->where('booking_date', '<', today())
                      ->orWhereIn('status', ['completed', 'cancelled_by_client', 'cancelled_by_prestataire']);
                });
            }
        }

        $bookings = $query->orderBy('booking_date', 'desc')
            ->orderBy('booking_time', 'desc')
            ->paginate(20);

        return response()->json($bookings);
    }

    /**
     * Get single booking details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        
        $booking = InstantBooking::with([
            'client',
            'prestataire',
            'serviceFixedPrice',
            'payment'
        ])->findOrFail($id);

        // Check authorization
        if ($booking->client_id !== $user->id && $booking->prestataire_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($booking);
    }

    /**
     * Create new instant booking
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prestataire_id' => 'required|exists:users,id',
            'service_fixed_price_id' => 'required|exists:service_fixed_prices,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required|date_format:H:i',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'postal_code' => 'required|string|max:10',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'client_notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            // Get service details
            $service = ServiceFixedPrice::findOrFail($validated['service_fixed_price_id']);
            
            // Check if service belongs to prestataire
            if ($service->prestataire_id !== $validated['prestataire_id']) {
                return response()->json(['message' => 'Service invalide pour ce prestataire'], 422);
            }

            // Check prestataire availability
            $availability = PrestataireAvailability::where('prestataire_id', $validated['prestataire_id'])
                ->where('date', $validated['booking_date'])
                ->where('start_time', $validated['booking_time'])
                ->where('status', 'available')
                ->first();

            if (!$availability) {
                return response()->json(['message' => 'Ce créneau n\'est plus disponible'], 422);
            }

            // Check advance booking requirement
            $prestataire = User::find($validated['prestataire_id']);
            $settings = $prestataire->instantBookingSettings;
            
            if ($settings) {
                $bookingDateTime = \Carbon\Carbon::parse($validated['booking_date'] . ' ' . $validated['booking_time']);
                $hoursUntilBooking = now()->diffInHours($bookingDateTime, false);
                
                if ($hoursUntilBooking < $settings->advance_booking_hours) {
                    return response()->json([
                        'message' => "Réservation minimum {$settings->advance_booking_hours}h à l'avance requise"
                    ], 422);
                }
            }

            // Calculate prices
            $price = $service->price;
            $platformFee = $price * 0.15; // 15% commission
            $totalPrice = $price + $platformFee;

            // Create booking
            $booking = InstantBooking::create([
                'client_id' => $request->user()->id,
                'prestataire_id' => $validated['prestataire_id'],
                'service_fixed_price_id' => $validated['service_fixed_price_id'],
                'booking_date' => $validated['booking_date'],
                'booking_time' => $validated['booking_time'],
                'duration_minutes' => $service->duration_minutes ?? 60,
                'price' => $price,
                'platform_fee' => $platformFee,
                'total_price' => $totalPrice,
                'status' => 'pending_payment',
                'address' => $validated['address'],
                'city' => $validated['city'],
                'postal_code' => $validated['postal_code'],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'client_notes' => $validated['client_notes'] ?? null,
            ]);

            // Mark availability slot as booked
            $availability->update(['status' => 'booked']);

            DB::commit();

            return response()->json([
                'message' => 'Réservation créée avec succès',
                'booking' => $booking->load(['prestataire', 'serviceFixedPrice']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création de la réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm booking (by prestataire if auto_confirm is false)
     */
    public function confirm(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $booking = InstantBooking::findOrFail($id);

        if ($booking->prestataire_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($booking->status !== 'pending_payment') {
            return response()->json(['message' => 'Réservation déjà confirmée ou annulée'], 422);
        }

        $booking->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        // TODO: Send notification to client

        return response()->json([
            'message' => 'Réservation confirmée',
            'booking' => $booking,
        ]);
    }

    /**
     * Start work (mark as in_progress)
     */
    public function start(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $booking = InstantBooking::findOrFail($id);

        if ($booking->prestataire_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($booking->status !== 'confirmed') {
            return response()->json(['message' => 'Réservation non confirmée'], 422);
        }

        $booking->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        // TODO: Send notification to client

        return response()->json([
            'message' => 'Travail démarré',
            'booking' => $booking,
        ]);
    }

    /**
     * Complete work
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $booking = InstantBooking::findOrFail($id);

        if ($booking->prestataire_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($booking->status !== 'in_progress') {
            return response()->json(['message' => 'Travail non démarré'], 422);
        }

        $validated = $request->validate([
            'prestataire_notes' => 'nullable|string|max:1000',
        ]);

        $booking->update([
            'status' => 'completed',
            'completed_at' => now(),
            'prestataire_notes' => $validated['prestataire_notes'] ?? null,
        ]);

        // TODO: Trigger payment capture
        // TODO: Send notification to client for review

        return response()->json([
            'message' => 'Travail terminé',
            'booking' => $booking,
        ]);
    }

    /**
     * Cancel booking
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $booking = InstantBooking::findOrFail($id);

        // Check authorization
        if ($booking->client_id !== $user->id && $booking->prestataire_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if (!in_array($booking->status, ['pending_payment', 'confirmed'])) {
            return response()->json(['message' => 'Cette réservation ne peut pas être annulée'], 422);
        }

        $validated = $request->validate([
            'cancellation_reason' => 'nullable|string|max:500',
        ]);

        // Determine cancellation fee
        $cancellationFee = 0;
        if ($user->id === $booking->client_id && !$booking->canBeCancelled()) {
            $cancellationFee = $booking->getCancellationFee();
        }

        DB::beginTransaction();
        try {
            // Update booking
            $status = $user->id === $booking->client_id 
                ? 'cancelled_by_client' 
                : 'cancelled_by_prestataire';

            $booking->update([
                'status' => $status,
                'cancelled_at' => now(),
                'cancellation_reason' => $validated['cancellation_reason'] ?? null,
            ]);

            // Free up availability slot
            PrestataireAvailability::where('prestataire_id', $booking->prestataire_id)
                ->where('date', $booking->booking_date)
                ->where('start_time', $booking->booking_time)
                ->update(['status' => 'available']);

            // TODO: Process refund (full or partial based on cancellation_fee)

            DB::commit();

            $refundAmount = $booking->total_price - $cancellationFee;

            return response()->json([
                'message' => 'Réservation annulée',
                'booking' => $booking,
                'refund_amount' => $refundAmount,
                'cancellation_fee' => $cancellationFee,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de l\'annulation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available prestataires for instant booking
     */
    public function getAvailablePrestataires(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service_category' => 'required|string',
            'date' => 'nullable|date|after_or_equal:today',
            'city' => 'nullable|string',
            'postal_code' => 'nullable|string',
        ]);

        $date = $validated['date'] ?? today()->toDateString();

        $query = User::where('role', 'prestataire')
            ->where('is_verified', true)
            ->where('is_blocked', false)
            ->where('average_rating', '>=', 4.5)
            ->whereHas('instantBookingSettings', function($q) {
                $q->where('instant_booking_enabled', true);
            })
            ->whereHas('serviceFixedPrices', function($q) use ($validated) {
                $q->where('service_category', $validated['service_category'])
                  ->where('is_active', true);
            })
            ->whereHas('availability', function($q) use ($date) {
                $q->where('date', $date)
                  ->where('status', 'available');
            })
            ->with([
                'activeServiceFixedPrices' => function($q) use ($validated) {
                    $q->where('service_category', $validated['service_category']);
                },
                'futureAvailability' => function($q) use ($date) {
                    $q->where('date', $date)->where('status', 'available');
                }
            ])
            ->withCount('instantBookingsAsPrestataire');

        // Filter by city if provided
        if (!empty($validated['city'])) {
            $query->where('city', 'like', '%' . $validated['city'] . '%');
        }

        $prestataires = $query->paginate(12);

        return response()->json($prestataires);
    }
}
