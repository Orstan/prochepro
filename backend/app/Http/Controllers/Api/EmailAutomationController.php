<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailAutomationLog;
use App\Services\EmailAutomationService;
use Illuminate\Http\Request;

class EmailAutomationController extends Controller
{
    public function __construct(
        private EmailAutomationService $automationService
    ) {}

    /**
     * Отримати статистику automation
     */
    public function stats()
    {
        return response()->json($this->automationService->getStats());
    }

    /**
     * Отримати всі automation logs
     */
    public function index(Request $request)
    {
        $query = EmailAutomationLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc');

        if ($request->campaign_type) {
            $query->where('campaign_type', $request->campaign_type);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        $logs = $query->paginate($request->per_page ?? 50);

        return response()->json($logs);
    }

    /**
     * Показати конкретний automation log
     */
    public function show(EmailAutomationLog $log)
    {
        $log->load('user:id,name,email');
        return response()->json($log);
    }

    /**
     * Видалити automation log
     */
    public function destroy(EmailAutomationLog $log)
    {
        if ($log->status === 'sent') {
            return response()->json([
                'message' => 'Cannot delete sent automation logs'
            ], 422);
        }

        $log->delete();

        return response()->json(['message' => 'Automation log deleted']);
    }

    /**
     * Примусово відправити automation email
     */
    public function forceSend(EmailAutomationLog $log)
    {
        if ($log->status === 'sent') {
            return response()->json([
                'message' => 'Email already sent'
            ], 422);
        }

        \App\Jobs\SendAutomatedEmailJob::dispatch($log);

        return response()->json([
            'message' => 'Email dispatched for sending'
        ]);
    }

    /**
     * Отримати список кампаній для фільтрації
     */
    public function campaigns()
    {
        $campaigns = EmailAutomationLog::select('campaign_type')
            ->distinct()
            ->pluck('campaign_type');

        return response()->json($campaigns);
    }

    /**
     * Запланувати welcome series для користувача (manual trigger)
     */
    public function scheduleWelcomeSeries(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = \App\Models\User::find($request->user_id);
        $this->automationService->scheduleWelcomeSeries($user);

        return response()->json([
            'message' => 'Welcome series scheduled for user'
        ]);
    }

    /**
     * Запланувати re-engagement для користувача (manual trigger)
     */
    public function scheduleReEngagement(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = \App\Models\User::find($request->user_id);
        $this->automationService->scheduleReEngagement($user);

        return response()->json([
            'message' => 'Re-engagement email scheduled for user'
        ]);
    }
}
