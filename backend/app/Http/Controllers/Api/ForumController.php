<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ForumCategory;
use App\Models\ForumPost;
use App\Models\ForumPostLike;
use App\Models\ForumTopic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ForumController extends Controller
{
    /**
     * Отримати всі категорії з кількістю тем
     */
    public function getCategories(): JsonResponse
    {
        $categories = ForumCategory::where('is_active', true)
            ->withCount('topics')
            ->orderBy('order')
            ->get();

        return response()->json($categories);
    }

    /**
     * Отримати теми категорії
     */
    public function getCategoryTopics(string $slug): JsonResponse
    {
        $category = ForumCategory::where('slug', $slug)->firstOrFail();

        $topics = ForumTopic::where('category_id', $category->id)
            ->withCount('posts')
            ->orderByDesc('is_pinned')
            ->orderByDesc('last_activity_at')
            ->paginate(20);

        return response()->json([
            'category' => $category,
            'topics' => $topics,
        ]);
    }

    /**
     * Отримати тему з постами
     */
    public function getTopic(string $slug): JsonResponse
    {
        $topic = ForumTopic::where('slug', $slug)->firstOrFail();
        
        // Збільшуємо лічильник переглядів
        $topic->incrementViews();

        $posts = ForumPost::where('topic_id', $topic->id)
            ->with(['user', 'likes'])
            ->orderBy('created_at')
            ->paginate(20);

        // Додаємо інформацію чи користувач лайкнув пост
        if (auth()->check()) {
            $posts->getCollection()->transform(function ($post) {
                $post->is_liked_by_user = $post->isLikedBy(auth()->user());
                return $post;
            });
        }

        return response()->json([
            'topic' => $topic,
            'posts' => $posts,
        ]);
    }

    /**
     * Створити нову тему
     */
    public function createTopic(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:forum_categories,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string|min:10',
        ]);

        $topic = ForumTopic::create([
            'category_id' => $validated['category_id'],
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::random(6),
            'content' => $validated['content'],
            'last_activity_at' => now(),
        ]);

        return response()->json($topic, 201);
    }

    /**
     * Додати пост до теми
     */
    public function createPost(Request $request, int $topicId): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|min:5',
        ]);

        $topic = ForumTopic::findOrFail($topicId);

        if ($topic->is_locked) {
            return response()->json(['message' => 'Cette discussion est verrouillée'], 403);
        }

        $post = ForumPost::create([
            'topic_id' => $topic->id,
            'user_id' => auth()->id(),
            'content' => $validated['content'],
        ]);

        // Оновлюємо активність теми та лічильник відповідей
        $topic->increment('replies_count');
        $topic->updateActivity();

        return response()->json($post->load('user'), 201);
    }

    /**
     * Лайкнути/дизлайкнути пост
     */
    public function toggleLike(int $postId): JsonResponse
    {
        $post = ForumPost::findOrFail($postId);
        $userId = auth()->id();

        $like = ForumPostLike::where('post_id', $postId)
            ->where('user_id', $userId)
            ->first();

        if ($like) {
            // Видаляємо лайк
            $like->delete();
            $post->decrement('likes_count');
            $isLiked = false;
        } else {
            // Додаємо лайк
            ForumPostLike::create([
                'post_id' => $postId,
                'user_id' => $userId,
            ]);
            $post->increment('likes_count');
            $isLiked = true;
        }

        return response()->json([
            'is_liked' => $isLiked,
            'likes_count' => $post->fresh()->likes_count,
        ]);
    }

    /**
     * Позначити пост як рішення (тільки автор теми)
     */
    public function markAsSolution(int $topicId, int $postId): JsonResponse
    {
        $topic = ForumTopic::findOrFail($topicId);
        
        if ($topic->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $post = ForumPost::where('topic_id', $topicId)
            ->where('id', $postId)
            ->firstOrFail();

        // Знімаємо позначку з інших постів
        ForumPost::where('topic_id', $topicId)
            ->update(['is_solution' => false]);

        // Позначаємо цей пост як рішення
        $post->update(['is_solution' => true]);

        return response()->json(['message' => 'Marqué comme solution']);
    }

    /**
     * Видалити пост (тільки автор або адмін)
     */
    public function deletePost(int $postId): JsonResponse
    {
        $post = ForumPost::findOrFail($postId);

        if ($post->user_id !== auth()->id() && !auth()->user()->is_admin) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $topic = $post->topic;
        $post->delete();
        
        // Оновлюємо лічильник відповідей
        $topic->decrement('replies_count');

        return response()->json(['message' => 'Post supprimé']);
    }

    /**
     * Видалити тему (тільки автор або адмін)
     */
    public function deleteTopic(int $topicId): JsonResponse
    {
        $topic = ForumTopic::findOrFail($topicId);

        if ($topic->user_id !== auth()->id() && !auth()->user()->is_admin) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $topic->delete();

        return response()->json(['message' => 'Discussion supprimée']);
    }
}
