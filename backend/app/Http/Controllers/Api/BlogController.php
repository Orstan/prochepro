<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BlogController extends Controller
{
    /**
     * Get all published posts (public)
     */
    public function index(Request $request): JsonResponse
    {
        $query = BlogPost::published()
            ->with('author:id,name')
            ->orderBy('published_at', 'desc');

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $posts = $query->paginate($request->get('per_page', 12));

        return response()->json($posts);
    }

    /**
     * Get single post by slug (public)
     */
    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::published()
            ->with('author:id,name')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($post);
    }

    /**
     * Get all categories (public)
     */
    public function categories(): JsonResponse
    {
        $categories = BlogCategory::orderBy('sort_order')
            ->withCount(['posts' => function ($query) {
                $query->published();
            }])
            ->get();

        return response()->json($categories);
    }

    /**
     * Get posts by category (public)
     */
    public function byCategory(string $slug): JsonResponse
    {
        $category = BlogCategory::where('slug', $slug)->firstOrFail();
        
        $posts = BlogPost::published()
            ->byCategory($slug)
            ->with('author:id,name')
            ->orderBy('published_at', 'desc')
            ->paginate(12);

        return response()->json([
            'category' => $category,
            'posts' => $posts,
        ]);
    }

    // ========== ADMIN METHODS ==========

    /**
     * Get all posts for admin (including unpublished)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = BlogPost::with('author:id,name')
            ->orderBy('created_at', 'desc');

        if ($request->has('published')) {
            $query->where('published', $request->boolean('published'));
        }

        $posts = $query->paginate($request->get('per_page', 20));

        return response()->json($posts);
    }

    /**
     * Get single post for admin
     */
    public function adminShow(int $id): JsonResponse
    {
        $post = BlogPost::with('author:id,name')->findOrFail($id);
        return response()->json($post);
    }

    /**
     * Create new post
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'meta_title' => 'nullable|string|max:255',
            'excerpt' => 'required|string|max:500',
            'meta_description' => 'nullable|string|max:500',
            'content' => 'required|string',
            'category' => 'required|string|exists:blog_categories,slug',
            'keywords' => 'nullable|array',
            'image' => 'nullable|string|max:500',
            'reading_time' => 'nullable|integer|min:1|max:60',
            'published' => 'nullable|boolean',
            'author_id' => 'nullable|exists:users,id',
        ]);

        $validated['slug'] = BlogPost::generateSlug($validated['title']);
        
        if ($request->boolean('published')) {
            $validated['published_at'] = now();
        }

        $post = BlogPost::create($validated);

        return response()->json([
            'message' => 'Article créé avec succès',
            'post' => $post->load('author:id,name'),
        ], 201);
    }

    /**
     * Update post
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:blog_posts,slug,' . $id,
            'meta_title' => 'nullable|string|max:255',
            'excerpt' => 'sometimes|required|string|max:500',
            'meta_description' => 'nullable|string|max:500',
            'content' => 'sometimes|required|string',
            'category' => 'sometimes|required|string|exists:blog_categories,slug',
            'keywords' => 'nullable|array',
            'image' => 'nullable|string|max:500',
            'reading_time' => 'nullable|integer|min:1|max:60',
            'published' => 'nullable|boolean',
        ]);

        // Set published_at when publishing for the first time
        if ($request->has('published') && $request->boolean('published') && !$post->published) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        return response()->json([
            'message' => 'Article mis à jour avec succès',
            'post' => $post->fresh()->load('author:id,name'),
        ]);
    }

    /**
     * Delete post
     */
    public function destroy(int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();

        return response()->json([
            'message' => 'Article supprimé avec succès',
        ]);
    }

    /**
     * Toggle publish status
     */
    public function togglePublish(int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        
        $post->published = !$post->published;
        if ($post->published && !$post->published_at) {
            $post->published_at = now();
        }
        $post->save();

        return response()->json([
            'message' => $post->published ? 'Article publié' : 'Article dépublié',
            'post' => $post,
        ]);
    }

    // ========== CATEGORY ADMIN METHODS ==========

    /**
     * Get all categories for admin
     */
    public function adminCategories(): JsonResponse
    {
        $categories = BlogCategory::orderBy('sort_order')
            ->withCount('posts')
            ->get();

        return response()->json($categories);
    }

    /**
     * Create category
     */
    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:10',
            'sort_order' => 'nullable|integer',
        ]);

        $validated['slug'] = BlogCategory::generateSlug($validated['name']);

        $category = BlogCategory::create($validated);

        return response()->json([
            'message' => 'Catégorie créée avec succès',
            'category' => $category,
        ], 201);
    }

    /**
     * Update category
     */
    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = BlogCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'slug' => 'sometimes|required|string|max:100|unique:blog_categories,slug,' . $id,
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:10',
            'sort_order' => 'nullable|integer',
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Catégorie mise à jour avec succès',
            'category' => $category,
        ]);
    }

    /**
     * Delete category
     */
    public function destroyCategory(int $id): JsonResponse
    {
        $category = BlogCategory::findOrFail($id);
        
        // Check if category has posts
        if ($category->posts()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer une catégorie contenant des articles',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Catégorie supprimée avec succès',
        ]);
    }
}
