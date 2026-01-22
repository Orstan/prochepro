<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PortfolioItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends Controller
{
    /**
     * Get all prestataires for listing page
     */
    public function getAllPrestataires(Request $request)
    {
        try {
            $search = $request->get('search', '');
            $city = $request->get('city', '');
            $category = $request->get('category', '');
            
            // Find users who have prestataire role (either in 'role' or 'roles' array)
            $query = User::where(function ($q) {
                    $q->where('role', 'prestataire')
                      ->orWhereJsonContains('roles', 'prestataire');
                });
            
            // Apply search filter
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('city', 'LIKE', "%{$search}%")
                      ->orWhere('bio', 'LIKE', "%{$search}%")
                      ->orWhere('company_name', 'LIKE', "%{$search}%")
                      ->orWhereJsonContains('skills', $search)
                      ->orWhere(function ($subQuery) use ($search) {
                          // Search in skills array (partial match)
                          $subQuery->whereRaw("JSON_SEARCH(skills, 'one', ?) IS NOT NULL", ["%{$search}%"]);
                      });
                });
            }
            
            // Apply city filter
            if (!empty($city)) {
                $query->where('city', 'LIKE', "%{$city}%");
            }
            
            // Apply category filter
            if (!empty($category)) {
                $query->whereJsonContains('service_categories', $category);
            }
            
            $prestataires = $query
                ->with(['achievements' => function ($query) {
                    $query->with('achievement')->orderBy('earned_at', 'desc')->limit(1);
                }])
                ->withCount(['reviewsAsPrestataire as reviews_count' => function ($query) {
                    $query->where('direction', 'client_to_prestataire');
                }])
                ->withAvg(['reviewsAsPrestataire as average_rating' => function ($query) {
                    $query->where('direction', 'client_to_prestataire');
                }], 'rating')
                // Show prestataires with reviews first, then others
                ->orderByRaw('CASE WHEN (SELECT COUNT(*) FROM reviews WHERE reviews.prestataire_id = users.id AND reviews.direction = \'client_to_prestataire\') > 0 THEN 0 ELSE 1 END')
                ->orderByDesc('average_rating')
                ->orderByDesc('reviews_count')
                ->paginate(12);

            return response()->json([
                'data' => $prestataires->map(function ($user) {
                    // Строга перевірка верифікації: і is_verified, і verification_status === 'approved'
                    $isVerified = ($user->is_verified === true || $user->is_verified === 1) && 
                                  $user->verification_status === 'approved';
                    
                    // Get latest earned achievement (already eager loaded)
                    $latestAchievement = null;
                    try {
                        $latestUserAchievement = $user->achievements->first();
                        
                        if ($latestUserAchievement && $latestUserAchievement->achievement) {
                            $latestAchievement = [
                                'icon' => $latestUserAchievement->achievement->icon,
                                'name' => $latestUserAchievement->achievement->name,
                            ];
                        }
                    } catch (\Exception $e) {
                        // Ignore if gamification tables don't exist yet
                    }
                    
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'avatar' => $user->avatar ?? null,
                        'city' => $user->city ?? null,
                        'bio' => isset($user->bio) && $user->bio ? \Illuminate\Support\Str::limit($user->bio, 100) : null,
                        'skills' => isset($user->skills) ? array_slice($user->skills ?? [], 0, 3) : [],
                        'company_name' => $user->company_name ?? null,
                        'is_verified' => $isVerified,
                        'verification_status' => $user->verification_status ?? 'none',
                        'average_rating' => $user->average_rating ? round($user->average_rating, 1) : null,
                        'reviews_count' => $user->reviews_count ?? 0,
                        'service_categories' => $user->service_categories ?? [],
                        'service_subcategories' => $user->service_subcategories ?? [],
                        'level' => $user->level ?? 1,
                        'xp' => $user->xp ?? 0,
                        'total_tasks_completed' => $user->total_tasks_completed ?? 0,
                        'latest_badge' => $latestAchievement,
                    ];
                }),
                'current_page' => $prestataires->currentPage(),
                'last_page' => $prestataires->lastPage(),
                'per_page' => $prestataires->perPage(),
                'total' => $prestataires->total(),
            ]);
        } catch (\Exception $e) {
            // Return empty array if migration not run yet
            return response()->json([]);
        }
    }

    /**
     * Get top rated prestataires for homepage
     */
    public function getTopPrestataires(Request $request)
    {
        try {
            $limit = $request->get('limit', 6);

            // Find users who have prestataire role (either in 'role' or 'roles' array)
            $prestataires = User::where(function ($query) {
                    $query->where('role', 'prestataire')
                          ->orWhereJsonContains('roles', 'prestataire');
                })
                ->withCount(['reviewsAsPrestataire as reviews_count' => function ($query) {
                    $query->where('direction', 'client_to_prestataire');
                }])
                ->withAvg(['reviewsAsPrestataire as average_rating' => function ($query) {
                    $query->where('direction', 'client_to_prestataire');
                }], 'rating')
                // Show prestataires with reviews first, then others
                ->orderByRaw('CASE WHEN (SELECT COUNT(*) FROM reviews WHERE reviews.prestataire_id = users.id AND reviews.direction = \'client_to_prestataire\') > 0 THEN 0 ELSE 1 END')
                ->orderByDesc('average_rating')
                ->orderByDesc('reviews_count')
                ->limit($limit)
                ->get();

            return response()->json($prestataires->map(function ($user) {
                // Строга перевірка верифікації: і is_verified, і verification_status === 'approved'
                $isVerified = ($user->is_verified === true || $user->is_verified === 1) && 
                              $user->verification_status === 'approved';
                
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $user->avatar ?? null,
                    'city' => $user->city ?? null,
                    'bio' => isset($user->bio) && $user->bio ? \Illuminate\Support\Str::limit($user->bio, 100) : null,
                    'skills' => isset($user->skills) ? array_slice($user->skills ?? [], 0, 3) : [],
                    'company_name' => $user->company_name ?? null,
                    'is_verified' => $isVerified,
                    'average_rating' => $user->average_rating ? round($user->average_rating, 1) : null,
                    'reviews_count' => $user->reviews_count ?? 0,
                    'level' => $user->level ?? 1,
                    'xp' => $user->xp ?? 0,
                    'total_tasks_completed' => $user->total_tasks_completed ?? 0,
                ];
            }));
        } catch (\Exception $e) {
            // Return empty array if migration not run yet
            return response()->json([]);
        }
    }

    /**
     * Get public prestataire profile with portfolio
     */
    public function getPublicProfile($id)
    {
        try {
            $user = User::with(['reviewsAsPrestataire' => function ($query) {
                    $query->where('direction', 'client_to_prestataire')
                          ->with(['client', 'task']);
                }])->findOrFail($id);

            // Load portfolio items if table exists
            $portfolioItems = collect();
            try {
                if (\Schema::hasTable('portfolio_items')) {
                    $portfolioItems = PortfolioItem::where('user_id', $user->id)
                        ->orderBy('sort_order')
                        ->get();
                }
            } catch (\Exception $e) {
                $portfolioItems = collect();
            }

            // Calculate stats
            $reviews = $user->reviewsAsPrestataire ?? collect();
            $averageRating = $reviews->count() > 0 
                ? round($reviews->avg('rating'), 1) 
                : null;

            // Count completed tasks where this user was the accepted prestataire
            $completedTasksCount = 0;
            try {
                $completedTasksCount = \App\Models\Task::where('status', 'completed')
                    ->whereHas('offers', function ($q) use ($user) {
                        $q->where('prestataire_id', $user->id)->where('status', 'accepted');
                    })->count();
            } catch (\Exception $e) {
                $completedTasksCount = 0;
            }

            // Get latest earned achievement
            $latestAchievement = null;
            $earnedBadges = [];
            try {
                $userAchievements = $user->achievements()
                    ->with('achievement')
                    ->orderBy('earned_at', 'desc')
                    ->get();
                
                if ($userAchievements->isNotEmpty()) {
                    $latestUserAchievement = $userAchievements->first();
                    if ($latestUserAchievement && $latestUserAchievement->achievement) {
                        $latestAchievement = [
                            'icon' => $latestUserAchievement->achievement->icon,
                            'name' => $latestUserAchievement->achievement->name,
                        ];
                    }
                    
                    // Get all earned badges
                    $earnedBadges = $userAchievements->map(function ($ua) {
                        return [
                            'icon' => $ua->achievement->icon,
                            'name' => $ua->achievement->name,
                        ];
                    })->toArray();
                }
            } catch (\Exception $e) {
                // Ignore if gamification tables don't exist yet
            }

            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar ?? null,
                'city' => $user->city ?? null,
                'bio' => $user->bio ?? null,
                'phone' => $user->phone ?? null,
                'website' => $user->website ?? null,
                'skills' => $user->skills ?? [],
                'experience_years' => $user->experience_years ?? null,
                'service_areas' => $user->service_areas ?? [],
                'certifications' => $user->certifications ?? [],
                'service_categories' => $user->service_categories ?? [],
                'service_subcategories' => $user->service_subcategories ?? [],
                'is_verified' => $user->is_verified ?? false,
                'hourly_rate' => $user->hourly_rate ?? null,
                'company_name' => $user->company_name ?? null,
                'member_since' => $user->created_at?->format('Y-m-d'),
                'level' => $user->level ?? 1,
                'xp' => $user->xp ?? 0,
                'total_tasks_completed' => $user->total_tasks_completed ?? 0,
                'latest_badge' => $latestAchievement,
                'earned_badges' => $earnedBadges,
                'stats' => [
                    'average_rating' => $averageRating,
                    'reviews_count' => $reviews->count(),
                    'completed_tasks' => $completedTasksCount,
                    'portfolio_count' => $portfolioItems->count(),
                ],
                'portfolio' => $portfolioItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'title' => $item->title,
                        'description' => $item->description,
                        'category' => $item->category,
                        'images' => $item->images ?? [],
                        'location' => $item->location,
                        'completed_at' => $item->completed_at?->format('Y-m-d'),
                        'budget' => $item->budget,
                        'duration_days' => $item->duration_days,
                        'is_featured' => $item->is_featured,
                    ];
                }),
                'reviews' => $reviews->take(10)->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'created_at' => $review->created_at->format('Y-m-d'),
                        'client' => [
                            'name' => $review->client?->name,
                            'avatar' => $review->client?->avatar,
                        ],
                        'task' => [
                            'title' => $review->task?->title,
                        ],
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Profile not found'], 404);
        }
    }

    /**
     * Update prestataire profile
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'Non authentifié'], 401);
            }

            $validated = $request->validate([
                'bio' => 'nullable|string|max:2000',
                'phone' => 'nullable|string|max:20',
                'website' => 'nullable|url|max:255',
                'skills' => 'nullable|array',
                'skills.*' => 'string|max:100',
                'experience_years' => 'nullable|string|max:50',
                'service_areas' => 'nullable|array',
                'service_areas.*' => 'string|max:100',
                'certifications' => 'nullable|array',
                'certifications.*' => 'string|max:200',
                'hourly_rate' => 'nullable|numeric|min:0|max:1000',
                'company_name' => 'nullable|string|max:255',
                'siret' => 'nullable|string|max:20',
                'iban' => 'nullable|string|max:34',
                'bic' => 'nullable|string|max:11',
                'bank_name' => 'nullable|string|max:100',
                'account_holder_name' => 'nullable|string|max:100',
            ]);

            $user->update($validated);

            return response()->json([
                'message' => 'Profil mis à jour avec succès',
                'user' => $user->fresh(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get user's bank details (only for authenticated user)
     */
    public function getBankDetails(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        return response()->json([
            'iban' => $user->iban,
            'bic' => $user->bic,
            'bank_name' => $user->bank_name,
            'account_holder_name' => $user->account_holder_name,
            'has_bank_details' => !empty($user->iban),
        ]);
    }

    /**
     * Get user's portfolio items
     */
    public function getPortfolio(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'Non authentifié'], 401);
            }

            if (!\Schema::hasTable('portfolio_items')) {
                return response()->json([]);
            }
            
            return response()->json(
                PortfolioItem::where('user_id', $user->id)->orderBy('sort_order')->get()
            );
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }

    /**
     * Add portfolio item
     */
    public function addPortfolioItem(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category' => 'nullable|string|max:100',
            'images' => 'nullable|array|max:10',
            'images.*' => 'string|max:500',
            'location' => 'nullable|string|max:255',
            'completed_at' => 'nullable|date',
            'budget' => 'nullable|numeric|min:0',
            'duration_days' => 'nullable|integer|min:1|max:365',
            'is_featured' => 'boolean',
        ]);

        $validated['user_id'] = $user->id;
        $validated['sort_order'] = $user->portfolioItems()->count();

        $item = PortfolioItem::create($validated);

        return response()->json([
            'message' => 'Réalisation ajoutée avec succès',
            'item' => $item,
        ], 201);
    }

    /**
     * Update portfolio item
     */
    public function updatePortfolioItem(Request $request, $id)
    {
        $user = $request->user();
        $item = PortfolioItem::where('user_id', $user->id)->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category' => 'nullable|string|max:100',
            'images' => 'nullable|array|max:10',
            'images.*' => 'string|max:500',
            'location' => 'nullable|string|max:255',
            'completed_at' => 'nullable|date',
            'budget' => 'nullable|numeric|min:0',
            'duration_days' => 'nullable|integer|min:1|max:365',
            'is_featured' => 'boolean',
        ]);

        $item->update($validated);

        return response()->json([
            'message' => 'Réalisation mise à jour avec succès',
            'item' => $item->fresh(),
        ]);
    }

    /**
     * Delete portfolio item
     */
    public function deletePortfolioItem(Request $request, $id)
    {
        $user = $request->user();
        $item = PortfolioItem::where('user_id', $user->id)->findOrFail($id);

        $item->delete();

        return response()->json([
            'message' => 'Réalisation supprimée avec succès',
        ]);
    }

    /**
     * Upload portfolio image
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $path = $request->file('image')->store('portfolio', 'public');

        return response()->json([
            'url' => Storage::url($path),
            'path' => $path,
        ]);
    }

    /**
     * Reorder portfolio items
     */
    public function reorderPortfolio(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:portfolio_items,id',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['items'] as $itemData) {
            PortfolioItem::where('id', $itemData['id'])
                ->where('user_id', $user->id)
                ->update(['sort_order' => $itemData['sort_order']]);
        }

        return response()->json([
            'message' => 'Ordre mis à jour avec succès',
        ]);
    }
}
