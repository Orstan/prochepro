<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;

class ServiceCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = ServiceCategory::with('subcategories')
            ->active()
            ->get()
            ->map(function ($category) {
                return [
                    'key' => $category->key,
                    'name' => $category->name,
                    'icon' => $category->icon,
                    'color' => $category->color,
                    'subcategories' => $category->subcategories->map(function ($sub) {
                        return [
                            'key' => $sub->key,
                            'name' => $sub->name,
                        ];
                    }),
                ];
            });

        return response()->json($categories);
    }

    public function show(string $key): JsonResponse
    {
        $category = ServiceCategory::where('key', $key)
            ->with('subcategories')
            ->active()
            ->firstOrFail();

        return response()->json([
            'key' => $category->key,
            'name' => $category->name,
            'icon' => $category->icon,
            'color' => $category->color,
            'subcategories' => $category->subcategories->map(function ($sub) {
                return [
                    'key' => $sub->key,
                    'name' => $sub->name,
                ];
            }),
        ]);
    }
}
