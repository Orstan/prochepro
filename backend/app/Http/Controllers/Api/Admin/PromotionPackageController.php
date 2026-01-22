<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromotionPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionPackageController extends Controller
{
    /**
     * Display a listing of all packages
     */
    public function index(): JsonResponse
    {
        $packages = PromotionPackage::orderBy('sort_order')
            ->orderBy('days')
            ->get();

        return response()->json($packages);
    }

    /**
     * Store a newly created package
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'days' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        $package = new PromotionPackage($validated);
        
        // Auto-calculate discount percentage
        if ($validated['original_price'] ?? null) {
            $package->calculateDiscount();
        }
        
        $package->save();

        return response()->json($package, 201);
    }

    /**
     * Display the specified package
     */
    public function show(PromotionPackage $package): JsonResponse
    {
        return response()->json($package);
    }

    /**
     * Update the specified package
     */
    public function update(Request $request, PromotionPackage $package): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'days' => ['sometimes', 'integer', 'min:1'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        $package->fill($validated);
        
        // Auto-calculate discount percentage if prices changed
        if (isset($validated['price']) || isset($validated['original_price'])) {
            $package->calculateDiscount();
        }
        
        $package->save();

        return response()->json($package);
    }

    /**
     * Remove the specified package
     */
    public function destroy(PromotionPackage $package): JsonResponse
    {
        $package->delete();

        return response()->json(['message' => 'Package deleted successfully']);
    }
}
