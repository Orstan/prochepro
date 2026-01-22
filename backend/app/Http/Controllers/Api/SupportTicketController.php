<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\Notification;
use App\Services\WebPushService;
use App\Services\AdminActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupportTicketController extends Controller
{
    /**
     * Get all tickets (admin) or user's tickets
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $query = SupportTicket::with(['user', 'assignedTo', 'messages'])
            ->orderBy('created_at', 'desc');

        // Admin can see all tickets
        if ($user->is_admin) {
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }
            if ($request->has('assigned_to')) {
                $query->where('assigned_to', $request->assigned_to);
            }
        } else {
            // Users can only see their own tickets
            $query->where('user_id', $user->id);
        }

        $tickets = $query->paginate(20);

        return response()->json($tickets);
    }

    /**
     * Create a new ticket
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category' => ['required', 'in:technical,payment,account,task,other'],
            'priority' => ['sometimes', 'in:low,medium,high,critical'],
        ]);

        $user = Auth::user();

        $ticket = SupportTicket::create([
            'user_id' => $user->id,
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'priority' => $validated['priority'] ?? 'medium',
            'status' => 'new',
        ]);

        // Create first message
        SupportTicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $validated['description'],
            'is_internal' => false,
        ]);

        // Notify admins about new ticket
        $this->notifyAdminsAboutNewTicket($ticket);

        return response()->json([
            'message' => 'Ticket créé avec succès',
            'ticket' => $ticket->load(['user', 'messages']),
        ], 201);
    }

    /**
     * Get single ticket
     */
    public function show(SupportTicket $ticket): JsonResponse
    {
        $user = Auth::user();

        // Check access
        if (!$user->is_admin && $ticket->user_id !== $user->id) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        $ticket->load(['user', 'assignedTo', 'messages.user']);

        return response()->json($ticket);
    }

    /**
     * Add message to ticket
     */
    public function addMessage(Request $request, SupportTicket $ticket): JsonResponse
    {
        $user = Auth::user();

        // Check access
        if (!$user->is_admin && $ticket->user_id !== $user->id) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        $validated = $request->validate([
            'message' => ['required', 'string'],
            'is_internal' => ['sometimes', 'boolean'],
        ]);

        // Only admins can create internal notes
        $isInternal = $user->is_admin && ($validated['is_internal'] ?? false);

        $message = SupportTicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $validated['message'],
            'is_internal' => $isInternal,
        ]);

        // Update ticket status if it was resolved/closed
        if (in_array($ticket->status, ['resolved', 'closed'])) {
            $ticket->update(['status' => 'open']);
        }

        // Notify the other party
        if ($user->is_admin) {
            // Admin replied - notify user
            if (!$isInternal) {
                $this->notifyUserAboutReply($ticket);
            }
        } else {
            // User replied - notify assigned admin or all admins
            $this->notifyAdminsAboutReply($ticket);
        }

        return response()->json([
            'message' => 'Message ajouté',
            'ticket_message' => $message->load('user'),
        ]);
    }

    /**
     * Update ticket (admin only)
     */
    public function update(Request $request, SupportTicket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'in:new,open,pending,resolved,closed'],
            'priority' => ['sometimes', 'in:low,medium,high,critical'],
            'assigned_to' => ['sometimes', 'nullable', 'exists:users,id'],
        ]);

        $oldStatus = $ticket->status;
        $oldAssignedTo = $ticket->assigned_to;

        // Update resolved_at and closed_at timestamps
        if (isset($validated['status'])) {
            if ($validated['status'] === 'resolved' && !$ticket->resolved_at) {
                $validated['resolved_at'] = now();
            }
            if ($validated['status'] === 'closed' && !$ticket->closed_at) {
                $validated['closed_at'] = now();
            }
        }

        $ticket->update($validated);

        // Log status change
        if (isset($validated['status']) && $oldStatus !== $validated['status']) {
            AdminActivityLogger::logTicketStatusChanged($ticket->id, $oldStatus, $validated['status']);
        }

        // Log assignment
        if (isset($validated['assigned_to']) && $oldAssignedTo !== $validated['assigned_to']) {
            if ($validated['assigned_to']) {
                AdminActivityLogger::logTicketAssigned($ticket->id, $validated['assigned_to']);
            }
        }

        // Notify user about status change
        if (isset($validated['status'])) {
            $this->notifyUserAboutStatusChange($ticket);
        }

        return response()->json([
            'message' => 'Ticket mis à jour',
            'ticket' => $ticket->fresh(['user', 'assignedTo']),
        ]);
    }

    /**
     * Delete ticket (admin only)
     */
    public function destroy(SupportTicket $ticket): JsonResponse
    {
        $ticket->delete();

        return response()->json([
            'message' => 'Ticket supprimé',
        ]);
    }

    /**
     * Get ticket statistics (admin only)
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => SupportTicket::count(),
            'new' => SupportTicket::where('status', 'new')->count(),
            'open' => SupportTicket::whereIn('status', ['open', 'pending'])->count(),
            'resolved' => SupportTicket::where('status', 'resolved')->count(),
            'closed' => SupportTicket::where('status', 'closed')->count(),
            'high_priority' => SupportTicket::whereIn('priority', ['high', 'critical'])
                ->whereIn('status', ['new', 'open', 'pending'])
                ->count(),
            'unassigned' => SupportTicket::whereNull('assigned_to')
                ->whereIn('status', ['new', 'open', 'pending'])
                ->count(),
            'by_category' => SupportTicket::selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->pluck('count', 'category'),
        ];

        return response()->json($stats);
    }

    /**
     * Notify admins about new ticket
     */
    protected function notifyAdminsAboutNewTicket(SupportTicket $ticket): void
    {
        $admins = \App\Models\User::where('is_admin', true)->get();

        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'new_support_ticket',
                'data' => [
                    'ticket_id' => $ticket->id,
                    'subject' => $ticket->subject,
                    'priority' => $ticket->priority,
                    'user_name' => $ticket->user->name,
                ],
            ]);

            if ($admin->push_notifications !== false) {
                try {
                    $webPush = new WebPushService();
                    $webPush->sendToUser(
                        $admin,
                        'Nouveau ticket de support',
                        "{$ticket->user->name}: {$ticket->subject}",
                        "/admin/support/{$ticket->id}"
                    );
                } catch (\Exception $e) {
                    \Log::error('Failed to send push notification: ' . $e->getMessage());
                }
            }
        }
    }

    /**
     * Notify admins about reply
     */
    protected function notifyAdminsAboutReply(SupportTicket $ticket): void
    {
        if ($ticket->assigned_to) {
            $admin = \App\Models\User::find($ticket->assigned_to);
            if ($admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'support_ticket_reply',
                    'data' => [
                        'ticket_id' => $ticket->id,
                        'subject' => $ticket->subject,
                    ],
                ]);

                if ($admin->push_notifications !== false) {
                    try {
                        $webPush = new WebPushService();
                        $webPush->sendToUser(
                            $admin,
                            'Réponse au ticket',
                            "Nouveau message sur: {$ticket->subject}"
                        );
                    } catch (\Exception $e) {
                        \Log::error('Failed to send push notification: ' . $e->getMessage());
                    }
                }
            }
        }
    }

    /**
     * Notify user about reply
     */
    protected function notifyUserAboutReply(SupportTicket $ticket): void
    {
        Notification::create([
            'user_id' => $ticket->user_id,
            'type' => 'support_ticket_reply',
            'data' => [
                'ticket_id' => $ticket->id,
                'subject' => $ticket->subject,
            ],
        ]);

        if ($ticket->user->push_notifications !== false) {
            try {
                $webPush = new WebPushService();
                $webPush->sendToUser(
                    $ticket->user,
                    'Réponse à votre ticket',
                    "Nouvelle réponse sur: {$ticket->subject}",
                    "/support/{$ticket->id}"
                );
            } catch (\Exception $e) {
                \Log::error('Failed to send push notification: ' . $e->getMessage());
            }
        }
    }

    /**
     * Notify user about status change
     */
    protected function notifyUserAboutStatusChange(SupportTicket $ticket): void
    {
        Notification::create([
            'user_id' => $ticket->user_id,
            'type' => 'support_ticket_status',
            'data' => [
                'ticket_id' => $ticket->id,
                'subject' => $ticket->subject,
                'status' => $ticket->status,
            ],
        ]);

        if ($ticket->user->push_notifications !== false) {
            try {
                $webPush = new WebPushService();
                $statusLabel = $ticket->status_label;
                $webPush->sendToUser(
                    $ticket->user,
                    'Statut du ticket mis à jour',
                    "Votre ticket est maintenant: {$statusLabel}",
                    "/support/{$ticket->id}"
                );
            } catch (\Exception $e) {
                \Log::error('Failed to send push notification: ' . $e->getMessage());
            }
        }
    }
}
