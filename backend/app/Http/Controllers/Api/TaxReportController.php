<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaxReport;
use App\Services\TaxReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class TaxReportController extends Controller
{
    protected TaxReportService $taxReportService;

    public function __construct(TaxReportService $taxReportService)
    {
        $this->taxReportService = $taxReportService;
    }

    /**
     * Get current year summary
     */
    public function getCurrentYearSummary(Request $request): JsonResponse
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }

        $summary = $this->taxReportService->getCurrentYearSummary($userId);
        
        return response()->json($summary);
    }

    /**
     * Get available years for reports
     */
    public function getAvailableYears(Request $request): JsonResponse
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }

        $years = $this->taxReportService->getAvailableYears($userId);
        
        return response()->json(['years' => $years]);
    }

    /**
     * Get reports history
     */
    public function getHistory(Request $request): JsonResponse
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }

        $reports = $this->taxReportService->getReportsHistory($userId);
        
        return response()->json(['reports' => $reports]);
    }

    /**
     * Generate annual report
     */
    public function generateAnnual(Request $request): JsonResponse
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }

        $validated = $request->validate([
            'year' => ['required', 'integer', 'min:2020', 'max:2030'],
        ]);

        $report = $this->taxReportService->generateAnnualReport($userId, $validated['year']);
        
        return response()->json([
            'report' => $report,
            'message' => 'Rapport annuel généré avec succès',
        ]);
    }

    /**
     * Generate monthly report
     */
    public function generateMonthly(Request $request): JsonResponse
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }

        $validated = $request->validate([
            'year' => ['required', 'integer', 'min:2020', 'max:2030'],
            'month' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $report = $this->taxReportService->generateMonthlyReport(
            $userId,
            $validated['year'],
            $validated['month']
        );
        
        return response()->json([
            'report' => $report,
            'message' => 'Rapport mensuel généré avec succès',
        ]);
    }

    /**
     * Download PDF report
     */
    public function downloadPdf(Request $request, TaxReport $report)
    {
        $userId = auth()->id();
        
        if (!$userId || $report->prestataire_id !== $userId) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }

        $prestataire = $report->prestataire;
        
        $data = [
            'report' => $report,
            'prestataire' => $prestataire,
            'generated_date' => now()->format('d/m/Y'),
            'period_label' => $report->getPeriodLabel(),
        ];

        $pdf = Pdf::loadView('pdf.tax-report', $data);
        
        $filename = sprintf(
            'attestation-revenus-prochepro-%s-%s.pdf',
            $report->year,
            $report->month ? str_pad($report->month, 2, '0', STR_PAD_LEFT) : 'annuel'
        );

        return $pdf->download($filename);
    }

    /**
     * Export to CSV
     */
    public function exportCsv(Request $request): JsonResponse
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }

        $validated = $request->validate([
            'year' => ['required', 'integer', 'min:2020', 'max:2030'],
        ]);

        // Get all completed tasks for the year
        $report = $this->taxReportService->generateAnnualReport($userId, $validated['year']);
        
        // For now, return report data as JSON
        // You can implement CSV export later if needed
        return response()->json([
            'report' => $report,
            'message' => 'Données exportées',
        ]);
    }
}
