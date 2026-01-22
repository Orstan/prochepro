<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportChatRoom;
use Illuminate\Http\Request;

class AdminChatController extends Controller
{
    /**
     * Get all chat rooms (admin)
     */
    public function index(Request $request)
    {
        $query = SupportChatRoom::with(['user', 'assignedAdmin', 'latestMessage'])
            ->orderByDesc('last_message_at');

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by assigned admin
        if ($request->assigned_to) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Filter by priority
        if ($request->priority) {
            $query->where('priority', $request->priority);
        }

        // Only unassigned
        if ($request->boolean('unassigned')) {
            $query->whereNull('assigned_to');
        }

        // Only with unread messages
        if ($request->boolean('unread')) {
            $query->where('unread_admin_count', '>', 0);
        }

        $rooms = $query->paginate($request->per_page ?? 20);

        return response()->json($rooms);
    }

    /**
     * Get chat room details
     */
    public function show(SupportChatRoom $room)
    {
        return response()->json($room->load(['user', 'assignedAdmin', 'messages.user']));
    }

    /**
     * Assign chat to admin
     */
    public function assign(Request $request, SupportChatRoom $room)
    {
        $validated = $request->validate([
            'admin_id' => 'required|exists:users,id',
        ]);

        $admin = \App\Models\User::findOrFail($validated['admin_id']);

        if (!$admin->is_admin) {
            return response()->json(['message' => 'User is not an admin'], 422);
        }

        $room->assign($admin->id);

        return response()->json(['message' => 'Chat assigned', 'room' => $room]);
    }

    /**
     * Resolve chat
     */
    public function resolve(SupportChatRoom $room)
    {
        $room->resolve();

        return response()->json(['message' => 'Chat resolved']);
    }

    /**
     * Close chat
     */
    public function close(SupportChatRoom $room)
    {
        $room->close();

        return response()->json(['message' => 'Chat closed']);
    }

    /**
     * Reopen chat
     */
    public function reopen(SupportChatRoom $room)
    {
        $room->reopen();

        return response()->json(['message' => 'Chat reopened']);
    }

    /**
     * Update status
     */
    public function updateStatus(Request $request, SupportChatRoom $room)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,assigned,resolved,closed',
        ]);

        $room->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Status updated', 'room' => $room]);
    }

    /**
     * Update priority
     */
    public function updatePriority(Request $request, SupportChatRoom $room)
    {
        $validated = $request->validate([
            'priority' => 'required|in:low,normal,high,urgent',
        ]);

        $room->update(['priority' => $validated['priority']]);

        return response()->json(['message' => 'Priority updated', 'room' => $room]);
    }

    /**
     * Update category
     */
    public function updateCategory(Request $request, SupportChatRoom $room)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:100',
        ]);

        $room->update(['category' => $validated['category']]);

        return response()->json(['message' => 'Category updated', 'room' => $room]);
    }

    /**
     * Get chat statistics
     */
    public function stats()
    {
        $stats = [
            'total' => SupportChatRoom::count(),
            'open' => SupportChatRoom::where('status', 'open')->count(),
            'assigned' => SupportChatRoom::where('status', 'assigned')->count(),
            'resolved' => SupportChatRoom::where('status', 'resolved')->count(),
            'closed' => SupportChatRoom::where('status', 'closed')->count(),
            'unassigned' => SupportChatRoom::whereNull('assigned_to')
                ->whereIn('status', ['open', 'assigned'])->count(),
            'urgent' => SupportChatRoom::where('priority', 'urgent')
                ->whereIn('status', ['open', 'assigned'])->count(),
            'unread' => SupportChatRoom::where('unread_admin_count', '>', 0)->count(),
        ];

        return response()->json($stats);
    }
}
