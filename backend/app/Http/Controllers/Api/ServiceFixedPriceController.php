<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceFixedPrice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ServiceFixedPriceController extends Controller
{
    /**
     * Get all active fixed price services (public)
     */
    public function index(Request $request): JsonResponse
    {
        $query = ServiceFixedPrice::with('prestataire')
            ->where('is_active', true);

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('prestataire_id')) {
            $query->where('prestataire_id', $request->prestataire_id);
        }

        $services = $query->orderBy('service_category')
            ->orderBy('price')
            ->get();

        return response()->json($services);
    }

    /**
     * Get services by category
     */
    public function byCategory(string $category): JsonResponse
    {
        $services = ServiceFixedPrice::with('prestataire')
            ->where('is_active', true)
            ->byCategory($category)
            ->orderBy('price')
            ->get();

        return response()->json($services);
    }

    /**
     * Get prestataire's own services
     */
    public function myServices(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Accès réservé aux prestataires'], 403);
        }

        $services = ServiceFixedPrice::where('prestataire_id', $user->id)
            ->orderBy('service_category')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($services);
    }

    /**
     * Create new fixed price service (prestataire only)
     */
    public function store(Request $request): JsonResponse
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
            'service_category' => 'required|string|max:100',
            'service_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:10|max:10000',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'is_active' => 'nullable|boolean',
        ]);

        $service = ServiceFixedPrice::create([
            'prestataire_id' => $user->id,
            'service_category' => $validated['service_category'],
            'service_name' => $validated['service_name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'duration_minutes' => $validated['duration_minutes'] ?? 60,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Service créé avec succès',
            'service' => $service,
        ], 201);
    }

    /**
     * Update fixed price service
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $service = ServiceFixedPrice::findOrFail($id);

        if ($service->prestataire_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'service_name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'sometimes|required|numeric|min:10|max:10000',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'is_active' => 'nullable|boolean',
        ]);

        $service->update($validated);

        return response()->json([
            'message' => 'Service mis à jour',
            'service' => $service,
        ]);
    }

    /**
     * Delete fixed price service
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $service = ServiceFixedPrice::findOrFail($id);

        if ($service->prestataire_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Check if there are pending/confirmed bookings
        $hasActiveBookings = $service->bookings()
            ->whereIn('status', ['pending_payment', 'confirmed', 'in_progress'])
            ->exists();

        if ($hasActiveBookings) {
            return response()->json([
                'message' => 'Impossible de supprimer : réservations actives existantes'
            ], 422);
        }

        $service->delete();

        return response()->json([
            'message' => 'Service supprimé',
        ]);
    }

    /**
     * Toggle service active status
     */
    public function toggleActive(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $service = ServiceFixedPrice::findOrFail($id);

        if ($service->prestataire_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $service->is_active = !$service->is_active;
        $service->save();

        return response()->json([
            'message' => $service->is_active ? 'Service activé' : 'Service désactivé',
            'service' => $service,
        ]);
    }
}
