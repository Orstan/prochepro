<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PopularService;
use Illuminate\Http\Request;

class PopularServicesController extends Controller
{
    /**
     * Get all popular services
     */
    public function index(Request $request)
    {
        $query = PopularService::where('is_active', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $services = $query->orderBy('search_volume', 'desc')->get();

        return response()->json($services);
    }

    /**
     * Get top N services
     */
    public function getTop(Request $request)
    {
        $limit = $request->get('limit', 20);
        $services = PopularService::getTop($limit);

        return response()->json($services);
    }

    /**
     * Get service by slug
     */
    public function show($slug)
    {
        $service = PopularService::where('slug', $slug)->firstOrFail();
        return response()->json($service);
    }

    /**
     * Get services by category
     */
    public function getByCategory($category)
    {
        $services = PopularService::where('category', $category)
            ->where('is_active', true)
            ->orderBy('search_volume', 'desc')
            ->get();

        return response()->json($services);
    }
}
