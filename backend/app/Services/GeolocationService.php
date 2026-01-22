<?php

namespace App\Services;

use App\Models\User;
use App\Models\Task;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeolocationService
{
    /**
     * Розрахунок відстані між двома точками (формула Haversine)
     * Повертає відстань в кілометрах
     */
    public function calculateDistance(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2
    ): float {
        $earthRadius = 6371; // Радіус Землі в км

        $latDiff = deg2rad($lat2 - $lat1);
        $lonDiff = deg2rad($lon2 - $lon1);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDiff / 2) * sin($lonDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Знайти завдання в радіусі від поточної локації майстра
     */
    public function findTasksInRadius(User $prestataire, float $radiusKm = 10): array
    {
        if (!$prestataire->current_latitude || !$prestataire->current_longitude) {
            return [];
        }

        // SQL запит з формулою Haversine для пошуку в радіусі
        $tasks = Task::select('tasks.*')
            ->selectRaw(
                '( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance',
                [$prestataire->current_latitude, $prestataire->current_longitude, $prestataire->current_latitude]
            )
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->where('status', 'open')
            ->having('distance', '<=', $radiusKm)
            ->orderBy('distance', 'asc')
            ->limit(20)
            ->get();

        return $tasks->map(function ($task) {
            return [
                'task' => $task,
                'distance_km' => round($task->distance, 2),
                'distance_text' => $this->formatDistance($task->distance),
            ];
        })->toArray();
    }

    /**
     * Форматування відстані для відображення
     */
    private function formatDistance(float $distanceKm): string
    {
        if ($distanceKm < 1) {
            return round($distanceKm * 1000) . ' m';
        }
        return round($distanceKm, 1) . ' km';
    }

    /**
     * Оновити поточну локацію майстра
     */
    public function updateUserLocation(
        User $user,
        float $latitude,
        float $longitude,
        ?int $taskId = null
    ): void {
        $user->update([
            'current_latitude' => $latitude,
            'current_longitude' => $longitude,
            'location_updated_at' => now(),
        ]);

        // Зберігаємо в історію для трекування
        if ($user->is_location_sharing_enabled && $taskId) {
            DB::table('location_tracking')->insert([
                'user_id' => $user->id,
                'task_id' => $taskId,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'recorded_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Отримати історію локацій майстра для трекування
     */
    public function getLocationHistory(int $taskId, int $userId, int $minutes = 30): array
    {
        return DB::table('location_tracking')
            ->where('task_id', $taskId)
            ->where('user_id', $userId)
            ->where('recorded_at', '>', now()->subMinutes($minutes))
            ->orderBy('recorded_at', 'desc')
            ->get()
            ->map(function ($location) {
                return [
                    'latitude' => (float) $location->latitude,
                    'longitude' => (float) $location->longitude,
                    'recorded_at' => $location->recorded_at,
                ];
            })
            ->toArray();
    }

    /**
     * Геокодування адреси в координати через Google Maps API
     */
    public function geocodeAddress(string $address): ?array
    {
        $apiKey = config('services.google_maps.api_key');
        
        if (!$apiKey) {
            Log::warning('Google Maps API key not configured');
            return null;
        }

        try {
            $response = Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
                'address' => $address,
                'key' => $apiKey,
            ]);

            Log::info('Geocoding API response', [
                'address' => $address,
                'status_code' => $response->status(),
                'response' => $response->json(),
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'OK' && !empty($data['results'])) {
                    $location = $data['results'][0]['geometry']['location'];
                    
                    return [
                        'latitude' => $location['lat'],
                        'longitude' => $location['lng'],
                        'formatted_address' => $data['results'][0]['formatted_address'],
                    ];
                } else {
                    Log::warning('Geocoding returned non-OK status', [
                        'status' => $data['status'] ?? 'unknown',
                        'error_message' => $data['error_message'] ?? 'none',
                    ]);
                }
            } else {
                Log::error('Geocoding API request failed', [
                    'status_code' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Geocoding failed: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Оптимізація маршруту для множинних завдань (Traveling Salesman Problem)
     * Використовує Google Maps Directions API
     */
    public function optimizeRoute(array $taskIds, User $prestataire): ?array
    {
        $apiKey = config('services.google_maps.api_key');
        
        if (!$apiKey) {
            return null;
        }

        $tasks = Task::whereIn('id', $taskIds)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        if ($tasks->count() < 2) {
            return $tasks->toArray();
        }

        // Формуємо waypoints для Google Maps
        $origin = $prestataire->current_latitude . ',' . $prestataire->current_longitude;
        $waypoints = $tasks->map(function ($task) {
            return $task->latitude . ',' . $task->longitude;
        })->implode('|');

        try {
            $response = Http::get('https://maps.googleapis.com/maps/api/directions/json', [
                'origin' => $origin,
                'destination' => $origin, // повертаємось до початкової точки
                'waypoints' => 'optimize:true|' . $waypoints,
                'key' => $apiKey,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'OK') {
                    $waypointOrder = $data['routes'][0]['waypoint_order'] ?? [];
                    
                    // Сортуємо завдання згідно оптимального порядку
                    $optimizedTasks = [];
                    foreach ($waypointOrder as $index) {
                        $optimizedTasks[] = $tasks[$index];
                    }
                    
                    return [
                        'tasks' => $optimizedTasks,
                        'total_distance' => $data['routes'][0]['legs'][0]['distance']['value'] ?? 0,
                        'total_duration' => $data['routes'][0]['legs'][0]['duration']['value'] ?? 0,
                        'polyline' => $data['routes'][0]['overview_polyline']['points'] ?? null,
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::error('Route optimization failed: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Розрахунок ETA (Estimated Time of Arrival)
     */
    public function calculateETA(
        float $fromLat,
        float $fromLon,
        float $toLat,
        float $toLon
    ): ?array {
        $apiKey = config('services.google_maps.api_key');
        
        if (!$apiKey) {
            // Fallback: приблизний розрахунок (50 км/год середня швидкість)
            $distance = $this->calculateDistance($fromLat, $fromLon, $toLat, $toLon);
            $durationMinutes = ($distance / 50) * 60;
            
            return [
                'distance_km' => round($distance, 2),
                'duration_minutes' => round($durationMinutes),
                'eta' => now()->addMinutes($durationMinutes)->format('H:i'),
            ];
        }

        try {
            $response = Http::get('https://maps.googleapis.com/maps/api/distancematrix/json', [
                'origins' => $fromLat . ',' . $fromLon,
                'destinations' => $toLat . ',' . $toLon,
                'key' => $apiKey,
                'mode' => 'driving',
                'departure_time' => 'now',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'OK' && !empty($data['rows'][0]['elements'][0])) {
                    $element = $data['rows'][0]['elements'][0];
                    
                    if ($element['status'] === 'OK') {
                        $durationMinutes = round($element['duration']['value'] / 60);
                        
                        return [
                            'distance_km' => round($element['distance']['value'] / 1000, 2),
                            'distance_text' => $element['distance']['text'],
                            'duration_minutes' => $durationMinutes,
                            'duration_text' => $element['duration']['text'],
                            'eta' => now()->addMinutes($durationMinutes)->format('H:i'),
                        ];
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('ETA calculation failed: ' . $e->getMessage());
        }

        return null;
    }
}
