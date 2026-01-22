<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use App\Services\GeolocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeolocationController extends Controller
{
    private GeolocationService $geoService;

    public function __construct(GeolocationService $geoService)
    {
        $this->geoService = $geoService;
    }

    /**
     * Оновити поточну локацію майстра
     */
    public function updateLocation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'task_id' => 'nullable|integer|exists:tasks,id',
        ]);

        $user = auth()->user();
        
        $this->geoService->updateUserLocation(
            $user,
            $validated['latitude'],
            $validated['longitude'],
            $validated['task_id'] ?? null
        );

        return response()->json([
            'message' => 'Location updated successfully',
            'location' => [
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'updated_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Увімкнути/вимкнути шерінг локації
     */
    public function toggleLocationSharing(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
        ]);

        $user = auth()->user();
        $user->update([
            'is_location_sharing_enabled' => $validated['enabled'],
        ]);

        return response()->json([
            'message' => 'Location sharing ' . ($validated['enabled'] ? 'enabled' : 'disabled'),
            'is_location_sharing_enabled' => $validated['enabled'],
        ]);
    }

    /**
     * Знайти завдання в радіусі від поточної локації
     */
    public function findNearbyTasks(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'radius_km' => 'nullable|numeric|min:1|max:100',
        ]);

        $user = auth()->user();
        $radiusKm = $validated['radius_km'] ?? 10;

        if (!$user->current_latitude || !$user->current_longitude) {
            return response()->json([
                'message' => 'Please enable location services and share your location',
                'tasks' => [],
            ]);
        }

        $tasks = $this->geoService->findTasksInRadius($user, $radiusKm);

        return response()->json([
            'tasks' => $tasks,
            'radius_km' => $radiusKm,
            'user_location' => [
                'latitude' => $user->current_latitude,
                'longitude' => $user->current_longitude,
            ],
        ]);
    }

    /**
     * Отримати історію локацій майстра для трекування (для клієнта)
     */
    public function getLocationTracking(Request $request, Task $task): JsonResponse
    {
        // Знаходимо прийняту пропозицію
        $offer = $task->offers()->where('status', 'accepted')->first();
        
        if (!$offer) {
            return response()->json([
                'message' => 'No accepted offer for this task',
                'tracking' => [],
                'current_location' => null,
                'task_location' => null,
                'eta' => null,
                'prestataire_status' => null,
            ]);
        }

        $prestataire = User::find($offer->prestataire_id);
        
        if (!$prestataire) {
            return response()->json([
                'message' => 'Prestataire not found',
                'tracking' => [],
                'current_location' => null,
                'task_location' => null,
                'eta' => null,
                'prestataire_status' => null,
            ]);
        }

        $history = $this->geoService->getLocationHistory($task->id, $prestataire->id);

        // Розрахунок ETA якщо майстер в дорозі
        $eta = null;
        if ($task->prestataire_status === 'on_the_way' && $prestataire->current_latitude && $task->latitude) {
            $eta = $this->geoService->calculateETA(
                $prestataire->current_latitude,
                $prestataire->current_longitude,
                $task->latitude,
                $task->longitude
            );
        }

        return response()->json([
            'tracking' => $history,
            'current_location' => [
                'latitude' => $prestataire->current_latitude ? (float)$prestataire->current_latitude : ($task->latitude ? (float)$task->latitude : null),
                'longitude' => $prestataire->current_longitude ? (float)$prestataire->current_longitude : ($task->longitude ? (float)$task->longitude : null),
                'updated_at' => $prestataire->location_updated_at,
            ],
            'task_location' => [
                'latitude' => $task->latitude ? (float)$task->latitude : null,
                'longitude' => $task->longitude ? (float)$task->longitude : null,
            ],
            'eta' => $eta,
            'prestataire_status' => $task->prestataire_status,
        ]);
    }

    /**
     * Геокодування адреси в координати
     */
    public function geocodeAddress(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'address' => 'required|string|max:500',
        ]);

        $result = $this->geoService->geocodeAddress($validated['address']);

        if (!$result) {
            return response()->json([
                'message' => 'Could not geocode address',
            ], 422);
        }

        return response()->json($result);
    }

    /**
     * Оптимізація маршруту для множинних завдань
     */
    public function optimizeRoute(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_ids' => 'required|array|min:2',
            'task_ids.*' => 'integer|exists:tasks,id',
        ]);

        $user = auth()->user();
        
        if (!$user->current_latitude || !$user->current_longitude) {
            return response()->json([
                'message' => 'Please enable location services',
            ], 422);
        }

        $optimizedRoute = $this->geoService->optimizeRoute($validated['task_ids'], $user);

        if (!$optimizedRoute) {
            return response()->json([
                'message' => 'Could not optimize route',
            ], 422);
        }

        return response()->json($optimizedRoute);
    }
}
