<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CityDistrict;
use Illuminate\Http\Request;

class CityDistrictsController extends Controller
{
    /**
     * Get all city districts
     */
    public function index(Request $request)
    {
        $query = CityDistrict::where('is_active', true);

        if ($request->has('city')) {
            $query->where('city', $request->city);
        }

        $districts = $query->orderBy('city')->orderBy('code')->get();

        return response()->json($districts);
    }

    /**
     * Get districts by city
     */
    public function getByCity($city)
    {
        $districts = CityDistrict::getByCity($city);
        return response()->json($districts);
    }

    /**
     * Get district by slug
     */
    public function show($slug)
    {
        $district = CityDistrict::getBySlug($slug);
        
        if (!$district) {
            return response()->json(['error' => 'District not found'], 404);
        }

        return response()->json($district);
    }

    /**
     * Get all cities
     */
    public function getCities()
    {
        $cities = CityDistrict::getAllCities();
        return response()->json($cities);
    }
}
