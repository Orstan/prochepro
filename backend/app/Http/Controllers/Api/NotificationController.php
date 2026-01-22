<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'type' => ['nullable', 'string'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = Notification::query()
            ->where('user_id', $validated['user_id']);

        if (!empty($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        $perPage = $validated['per_page'] ?? 10;
        $notifications = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'last_page' => $notifications->lastPage(),
            ],
        ]);
    }

    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        $userId = (int) $request->input('user_id');

        if (! $userId || $notification->user_id !== $userId) {
            return response()->json([], 403);
        }

        if (!$notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json($notification->fresh());
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::query()
            ->where('user_id', (int) $request->input('user_id'))
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['status' => 'ok']);
    }

    public function clearForUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        Notification::query()
            ->where('user_id', $validated['user_id'])
            ->delete();

        return response()->json(['status' => 'ok']);
    }

    public function bulkMarkAsRead(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'notification_ids' => ['required', 'array'],
            'notification_ids.*' => ['integer'],
        ]);

        Notification::query()
            ->where('user_id', $validated['user_id'])
            ->whereIn('id', $validated['notification_ids'])
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['status' => 'ok']);
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'notification_ids' => ['required', 'array'],
            'notification_ids.*' => ['integer'],
        ]);

        Notification::query()
            ->where('user_id', $validated['user_id'])
            ->whereIn('id', $validated['notification_ids'])
            ->delete();

        return response()->json(['status' => 'ok']);
    }
}
