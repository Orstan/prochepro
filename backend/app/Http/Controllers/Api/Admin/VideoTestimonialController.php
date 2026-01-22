<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VideoTestimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoTestimonialController extends Controller
{
    /**
     * Get all video testimonials (admin)
     */
    public function index(): JsonResponse
    {
        $testimonials = VideoTestimonial::orderByDesc('created_at')->get();
        
        return response()->json($testimonials);
    }

    /**
     * Create new video testimonial
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cloudinary_public_id' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'in:client,prestataire'],
            'text' => ['nullable', 'string'],
            'duration' => ['nullable', 'integer', 'min:1', 'max:120'],
            'thumbnail_url' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        $testimonial = VideoTestimonial::create($validated);

        return response()->json($testimonial, 201);
    }

    /**
     * Update video testimonial
     */
    public function update(Request $request, VideoTestimonial $testimonial): JsonResponse
    {
        $validated = $request->validate([
            'cloudinary_public_id' => ['string'],
            'name' => ['string', 'max:255'],
            'role' => ['nullable', 'string', 'in:client,prestataire'],
            'text' => ['nullable', 'string'],
            'duration' => ['nullable', 'integer', 'min:1', 'max:120'],
            'thumbnail_url' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        $testimonial->update($validated);

        return response()->json($testimonial);
    }

    /**
     * Delete video testimonial
     */
    public function destroy(VideoTestimonial $testimonial): JsonResponse
    {
        $testimonial->delete();

        return response()->json([
            'message' => 'Video testimonial deleted successfully',
        ]);
    }

    /**
     * Toggle active status
     */
    public function toggleActive(VideoTestimonial $testimonial): JsonResponse
    {
        $testimonial->is_active = !$testimonial->is_active;
        $testimonial->save();

        return response()->json($testimonial);
    }

    /**
     * Approve testimonial
     */
    public function approve(VideoTestimonial $testimonial): JsonResponse
    {
        $testimonial->status = 'approved';
        $testimonial->is_active = true;
        $testimonial->save();

        return response()->json([
            'message' => 'Témoignage approuvé',
            'testimonial' => $testimonial,
        ]);
    }

    /**
     * Reject testimonial
     */
    public function reject(VideoTestimonial $testimonial): JsonResponse
    {
        $testimonial->status = 'rejected';
        $testimonial->is_active = false;
        $testimonial->save();

        return response()->json([
            'message' => 'Témoignage rejeté',
            'testimonial' => $testimonial,
        ]);
    }
}
