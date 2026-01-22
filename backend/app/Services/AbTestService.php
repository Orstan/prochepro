<?php

namespace App\Services;

use App\Models\AbTest;
use App\Models\AbTestAssignment;
use App\Models\AbTestConversion;
use Illuminate\Support\Facades\DB;

class AbTestService
{
    public function getVariant(string $testKey, ?int $userId, string $sessionId): string
    {
        $test = AbTest::where('key', $testKey)
            ->where('is_active', true)
            ->first();
        
        if (!$test) {
            return 'control';
        }
        
        $assignment = AbTestAssignment::where('ab_test_id', $test->id)
            ->where(function ($query) use ($userId, $sessionId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('session_id', $sessionId);
                }
            })
            ->first();
        
        if ($assignment) {
            return $assignment->variant;
        }
        
        $variants = $test->variants;
        $variant = $variants[array_rand($variants)];
        
        AbTestAssignment::create([
            'ab_test_id' => $test->id,
            'user_id' => $userId,
            'session_id' => $sessionId,
            'variant' => $variant,
        ]);
        
        return $variant;
    }

    public function trackConversion(string $testKey, ?int $userId, string $sessionId, string $conversionType, ?array $data = null): void
    {
        $test = AbTest::where('key', $testKey)->first();
        
        if (!$test) {
            return;
        }
        
        $assignment = AbTestAssignment::where('ab_test_id', $test->id)
            ->where(function ($query) use ($userId, $sessionId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('session_id', $sessionId);
                }
            })
            ->first();
        
        if (!$assignment) {
            return;
        }
        
        AbTestConversion::create([
            'ab_test_id' => $test->id,
            'assignment_id' => $assignment->id,
            'conversion_type' => $conversionType,
            'conversion_data' => $data,
        ]);
    }

    public function getAllTests(): array
    {
        return AbTest::orderBy('created_at', 'desc')->get()->toArray();
    }

    public function getTestResults(int $testId): array
    {
        $test = AbTest::with(['assignments', 'conversions'])->findOrFail($testId);
        
        $variantStats = [];
        
        foreach ($test->variants as $variant) {
            $assignments = $test->assignments()->where('variant', $variant)->count();
            $conversions = $test->conversions()
                ->whereHas('assignment', fn($q) => $q->where('variant', $variant))
                ->count();
            
            $conversionRate = $assignments > 0 ? ($conversions / $assignments) * 100 : 0;
            
            $variantStats[$variant] = [
                'participants' => $assignments,
                'conversions' => $conversions,
                'conversion_rate' => round($conversionRate, 2),
            ];
        }
        
        $totalAssignments = $test->assignments()->count();
        $totalConversions = $test->conversions()->count();
        
        return [
            'test_id' => $test->id,
            'test_name' => $test->name,
            'total_participants' => $totalAssignments,
            'variant_stats' => $variantStats,
        ];
    }

    public function createTest(array $data): AbTest
    {
        return AbTest::create($data);
    }

    public function endTest(int $testId): AbTest
    {
        $test = AbTest::findOrFail($testId);
        $test->update([
            'is_active' => false,
            'ended_at' => now(),
        ]);
        
        return $test;
    }
}
