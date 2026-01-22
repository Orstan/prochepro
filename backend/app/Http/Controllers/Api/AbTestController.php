<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AbTestService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AbTestController extends Controller
{
    public function __construct(
        private AbTestService $abTestService
    ) {}

    public function getVariant(Request $request, string $testKey): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
        ]);

        $variant = $this->abTestService->getVariant(
            $testKey,
            auth()->id(),
            $validated['session_id']
        );

        return response()->json([
            'test_key' => $testKey,
            'variant' => $variant,
        ]);
    }

    public function trackConversion(Request $request, string $testKey): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
            'conversion_type' => 'required|string',
            'conversion_data' => 'nullable|array',
        ]);

        $this->abTestService->trackConversion(
            $testKey,
            auth()->id(),
            $validated['session_id'],
            $validated['conversion_type'],
            $validated['conversion_data'] ?? null
        );

        return response()->json(['success' => true]);
    }

    public function getAllTests(): JsonResponse
    {
        $tests = $this->abTestService->getAllTests();

        return response()->json($tests);
    }

    public function getTestResults(int $testId): JsonResponse
    {
        $results = $this->abTestService->getTestResults($testId);

        return response()->json($results);
    }

    public function createTest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'key' => 'required|string|unique:ab_tests,key',
            'description' => 'nullable|string',
            'variants' => 'required|array|min:2',
            'variants.*' => 'required|string',
        ]);

        $test = $this->abTestService->createTest([
            ...$validated,
            'started_at' => now(),
        ]);

        return response()->json($test, 201);
    }

    public function endTest(int $testId): JsonResponse
    {
        $test = $this->abTestService->endTest($testId);

        return response()->json($test);
    }
}
