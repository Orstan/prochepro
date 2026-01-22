<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminActivityLogController extends Controller
{
    /**
     * Get activity logs with filters
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'admin_id' => ['nullable', 'integer', 'exists:users,id'],
            'action' => ['nullable', 'string'],
            'entity_type' => ['nullable', 'string'],
            'entity_id' => ['nullable', 'integer'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'search' => ['nullable', 'string'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = AdminActivityLog::with('admin:id,name,email')
            ->orderBy('created_at', 'desc');

        // Filters
        if (!empty($validated['admin_id'])) {
            $query->where('admin_id', $validated['admin_id']);
        }

        if (!empty($validated['action'])) {
            $query->where('action', $validated['action']);
        }

        if (!empty($validated['entity_type'])) {
            $query->where('entity_type', $validated['entity_type']);
        }

        if (!empty($validated['entity_id'])) {
            $query->where('entity_id', $validated['entity_id']);
        }

        if (!empty($validated['date_from'])) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }

        if (!empty($validated['date_to'])) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        if (!empty($validated['search'])) {
            $query->where('description', 'like', '%' . $validated['search'] . '%');
        }

        $perPage = $validated['per_page'] ?? 20;
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Get single activity log
     */
    public function show(AdminActivityLog $log): JsonResponse
    {
        $log->load('admin:id,name,email');
        return response()->json($log);
    }

    /**
     * Get activity statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $days = $validated['days'] ?? 30;
        $dateFrom = now()->subDays($days);

        $stats = [
            'total_actions' => AdminActivityLog::where('created_at', '>=', $dateFrom)->count(),
            'by_action' => AdminActivityLog::where('created_at', '>=', $dateFrom)
                ->selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->pluck('count', 'action'),
            'by_entity' => AdminActivityLog::where('created_at', '>=', $dateFrom)
                ->selectRaw('entity_type, COUNT(*) as count')
                ->groupBy('entity_type')
                ->pluck('count', 'entity_type'),
            'by_admin' => AdminActivityLog::where('created_at', '>=', $dateFrom)
                ->with('admin:id,name')
                ->selectRaw('admin_id, COUNT(*) as count')
                ->groupBy('admin_id')
                ->get()
                ->map(function ($item) {
                    return [
                        'admin_id' => $item->admin_id,
                        'admin_name' => $item->admin->name ?? 'Unknown',
                        'count' => $item->count,
                    ];
                }),
            'recent_actions' => AdminActivityLog::with('admin:id,name')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Get logs for specific entity
     */
    public function getEntityLogs(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'entity_type' => ['required', 'string'],
            'entity_id' => ['required', 'integer'],
        ]);

        $logs = AdminActivityLog::with('admin:id,name,email')
            ->where('entity_type', $validated['entity_type'])
            ->where('entity_id', $validated['entity_id'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($logs);
    }

    /**
     * Export logs to CSV
     */
    public function export(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'admin_id' => ['nullable', 'integer', 'exists:users,id'],
            'action' => ['nullable', 'string'],
            'entity_type' => ['nullable', 'string'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        $query = AdminActivityLog::with('admin:id,name,email')
            ->orderBy('created_at', 'desc');

        // Apply same filters as index
        if (!empty($validated['admin_id'])) {
            $query->where('admin_id', $validated['admin_id']);
        }

        if (!empty($validated['action'])) {
            $query->where('action', $validated['action']);
        }

        if (!empty($validated['entity_type'])) {
            $query->where('entity_type', $validated['entity_type']);
        }

        if (!empty($validated['date_from'])) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }

        if (!empty($validated['date_to'])) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        $logs = $query->limit(10000)->get();

        // Generate CSV
        $csv = "ID,Admin,Action,Entity Type,Entity ID,Description,IP Address,Date\n";
        
        foreach ($logs as $log) {
            $csv .= sprintf(
                "%d,%s,%s,%s,%s,%s,%s,%s\n",
                $log->id,
                $log->admin->name ?? 'Unknown',
                $log->action,
                $log->entity_type,
                $log->entity_id ?? '',
                str_replace(["\n", "\r", ","], [" ", " ", ";"], $log->description ?? ''),
                $log->ip_address ?? '',
                $log->created_at->format('Y-m-d H:i:s')
            );
        }

        return response()->json([
            'filename' => 'admin_activity_logs_' . now()->format('Y-m-d_His') . '.csv',
            'content' => base64_encode($csv),
            'count' => $logs->count(),
        ]);
    }

    /**
     * Get available filters (unique values)
     */
    public function filters(): JsonResponse
    {
        $actions = AdminActivityLog::distinct()->pluck('action')->sort()->values();
        $entityTypes = AdminActivityLog::distinct()->pluck('entity_type')->sort()->values();
        
        $admins = AdminActivityLog::with('admin:id,name')
            ->select('admin_id')
            ->distinct()
            ->get()
            ->pluck('admin')
            ->filter()
            ->map(function ($admin) {
                return ['id' => $admin->id, 'name' => $admin->name];
            })
            ->values();

        return response()->json([
            'actions' => $actions,
            'entity_types' => $entityTypes,
            'admins' => $admins,
        ]);
    }
}
