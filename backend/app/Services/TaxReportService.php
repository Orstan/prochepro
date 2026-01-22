<?php

namespace App\Services;

use App\Models\Offer;
use App\Models\Task;
use App\Models\TaxReport;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TaxReportService
{
    /**
     * Generate annual tax report for a prestataire
     */
    public function generateAnnualReport(int $prestataireId, int $year): TaxReport
    {
        $startDate = Carbon::createFromDate($year, 1, 1)->startOfDay();
        $endDate = Carbon::createFromDate($year, 12, 31)->endOfDay();

        return $this->generateReport($prestataireId, $year, null, $startDate, $endDate);
    }

    /**
     * Generate monthly tax report for a prestataire
     */
    public function generateMonthlyReport(int $prestataireId, int $year, int $month): TaxReport
    {
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        return $this->generateReport($prestataireId, $year, $month, $startDate, $endDate);
    }

    /**
     * Core report generation logic
     */
    private function generateReport(
        int $prestataireId,
        int $year,
        ?int $month,
        Carbon $startDate,
        Carbon $endDate
    ): TaxReport {
        Log::info("Generating tax report", [
            'prestataire_id' => $prestataireId,
            'year' => $year,
            'month' => $month,
        ]);

        // Get all completed tasks with accepted offers for this prestataire
        $completedTasks = Task::whereHas('offers', function ($query) use ($prestataireId) {
            $query->where('prestataire_id', $prestataireId)
                  ->where('status', 'accepted');
        })
        ->where('status', 'completed')
        ->whereBetween('updated_at', [$startDate, $endDate])
        ->with(['offers' => function ($query) use ($prestataireId) {
            $query->where('prestataire_id', $prestataireId)
                  ->where('status', 'accepted');
        }])
        ->get();

        $totalRevenue = 0;
        $platformCommission = 0;
        $missionsCount = 0;
        $onlinePaymentMissions = 0;
        $cashPaymentMissions = 0;

        // Get prestataire to check completed missions counter
        $prestataire = User::find($prestataireId);
        $completedMissionsCount = $prestataire->completed_missions ?? 0;

        foreach ($completedTasks as $task) {
            $offer = $task->offers->first();
            if (!$offer) continue;

            $price = floatval($offer->price ?? 0);
            $totalRevenue += $price;
            $missionsCount++;

            // Determine commission based on payment method and mission count
            $isOnlinePayment = $task->payment_method === 'online' || $task->payment_method === 'card';
            
            if ($isOnlinePayment) {
                $onlinePaymentMissions++;
                // First 3 missions online = 0%, then 10%
                if ($completedMissionsCount > 3) {
                    $platformCommission += $price * 0.10;
                }
            } else {
                // Cash payment = 15% from first mission
                $cashPaymentMissions++;
                $platformCommission += $price * 0.15;
            }
        }

        $netRevenue = $totalRevenue - $platformCommission;

        // Check if report already exists
        $existingReport = TaxReport::where('prestataire_id', $prestataireId)
            ->where('year', $year)
            ->where('month', $month)
            ->first();

        if ($existingReport) {
            $existingReport->update([
                'total_revenue' => $totalRevenue,
                'platform_commission' => $platformCommission,
                'net_revenue' => $netRevenue,
                'missions_count' => $missionsCount,
                'online_payment_missions' => $onlinePaymentMissions,
                'cash_payment_missions' => $cashPaymentMissions,
                'generated_at' => now(),
            ]);
            return $existingReport->fresh();
        }

        // Create new report
        $report = TaxReport::create([
            'prestataire_id' => $prestataireId,
            'year' => $year,
            'month' => $month,
            'total_revenue' => $totalRevenue,
            'platform_commission' => $platformCommission,
            'net_revenue' => $netRevenue,
            'missions_count' => $missionsCount,
            'online_payment_missions' => $onlinePaymentMissions,
            'cash_payment_missions' => $cashPaymentMissions,
            'generated_at' => now(),
        ]);

        Log::info("Tax report generated", [
            'report_id' => $report->id,
            'total_revenue' => $totalRevenue,
            'missions_count' => $missionsCount,
        ]);

        return $report;
    }

    /**
     * Get all reports for a prestataire
     */
    public function getReportsHistory(int $prestataireId): array
    {
        return TaxReport::where('prestataire_id', $prestataireId)
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->get()
            ->toArray();
    }

    /**
     * Get available years for reports
     */
    public function getAvailableYears(int $prestataireId): array
    {
        $firstTask = Task::whereHas('offers', function ($query) use ($prestataireId) {
            $query->where('prestataire_id', $prestataireId)
                  ->where('status', 'accepted');
        })
        ->where('status', 'completed')
        ->orderBy('updated_at', 'asc')
        ->first();

        if (!$firstTask) {
            return [now()->year];
        }

        $startYear = Carbon::parse($firstTask->updated_at)->year;
        $currentYear = now()->year;
        
        $years = [];
        for ($y = $currentYear; $y >= $startYear; $y--) {
            $years[] = $y;
        }

        return $years;
    }

    /**
     * Calculate summary for dashboard
     */
    public function getCurrentYearSummary(int $prestataireId): array
    {
        $currentYear = now()->year;
        
        // Try to get or generate annual report
        $report = TaxReport::where('prestataire_id', $prestataireId)
            ->where('year', $currentYear)
            ->whereNull('month')
            ->first();

        if (!$report) {
            $report = $this->generateAnnualReport($prestataireId, $currentYear);
        }

        return [
            'year' => $currentYear,
            'total_revenue' => floatval($report->total_revenue),
            'net_revenue' => floatval($report->net_revenue),
            'platform_commission' => floatval($report->platform_commission),
            'missions_count' => $report->missions_count,
        ];
    }
}
