<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VideoTestimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserTestimonialController extends Controller
{
    /**
     * Submit a new video testimonial (user)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cloudinary_public_id' => ['required', 'string'],
            'text' => ['nullable', 'string', 'max:500'],
            'duration' => ['nullable', 'integer', 'min:1', 'max:120'],
            'thumbnail_url' => ['nullable', 'string'],
        ]);

        $user = Auth::user();
        
        // Auto-fill name and role from user profile
        $testimonial = VideoTestimonial::create([
            'user_id' => $user->id,
            'cloudinary_public_id' => $validated['cloudinary_public_id'],
            'name' => $user->name,
            'role' => $user->role, // 'client' or 'prestataire'
            'text' => $validated['text'] ?? null,
            'duration' => $validated['duration'] ?? null,
            'thumbnail_url' => $validated['thumbnail_url'] ?? null,
            'is_active' => false, // Inactive until admin approves
            'status' => 'pending', // Awaiting moderation
            'sort_order' => 0,
        ]);

        return response()->json([
            'message' => 'Votre témoignage a été soumis et est en attente de validation.',
            'testimonial' => $testimonial,
        ], 201);
    }

    /**
     * Get current user's testimonials
     */
    public function myTestimonials(): JsonResponse
    {
        $user = Auth::user();
        
        $testimonials = VideoTestimonial::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($testimonials);
    }

    /**
     * Delete own testimonial (only if pending)
     */
    public function destroy(VideoTestimonial $testimonial): JsonResponse
    {
        $user = Auth::user();

        if ($testimonial->user_id !== $user->id) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        if ($testimonial->status !== 'pending') {
            return response()->json(['error' => 'Vous ne pouvez supprimer que les témoignages en attente'], 400);
        }

        $testimonial->delete();

        return response()->json(['message' => 'Témoignage supprimé']);
    }
}
