<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VideoTestimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoTestimonialController extends Controller
{
    /**
     * Get active and approved video testimonials (public)
     */
    public function index(Request $request): JsonResponse
    {
        $limit = $request->query('limit');
        
        $query = VideoTestimonial::active()->approved()->ordered();
        
        if ($limit) {
            $query->limit((int) $limit);
        }
        
        $testimonials = $query->get();
        
        return response()->json($testimonials);
    }

    /**
     * Get single video testimonial
     */
    public function show(VideoTestimonial $testimonial): JsonResponse
    {
        if (!$testimonial->is_active) {
            return response()->json([
                'message' => 'Testimonial not found or not active',
            ], 404);
        }
        
        return response()->json($testimonial);
    }
}
