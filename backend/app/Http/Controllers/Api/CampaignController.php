<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailCampaign;
use App\Models\CampaignRecipient;
use App\Models\User;
use App\Models\Notification;
use App\Services\WebPushService;
use App\Services\AdminActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class CampaignController extends Controller
{
    /**
     * Get all campaigns
     */
    public function index(Request $request): JsonResponse
    {
        $query = EmailCampaign::with('creator')
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $campaigns = $query->paginate(20);

        return response()->json($campaigns);
    }

    /**
     * Create campaign
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:email,push,both'],
            'subject' => ['required_if:type,email,both', 'nullable', 'string'],
            'message' => ['required', 'string'],
            'email_body' => ['nullable', 'string'],
            'push_url' => ['nullable', 'url'],
            'target_audience' => ['required', 'in:all,clients,prestataires,verified,custom'],
            'filters' => ['nullable', 'array'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
            'admin_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($validated['admin_id']);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $validated['created_by'] = $admin->id;
        $validated['status'] = (!empty($validated['scheduled_at'])) ? 'scheduled' : 'draft';
        unset($validated['admin_id']);

        // Calculate recipients
        $recipients = $this->getRecipients($validated['target_audience'], $validated['filters'] ?? null);
        $validated['total_recipients'] = $recipients->count();

        $campaign = EmailCampaign::create($validated);

        // Create recipient records
        foreach ($recipients as $user) {
            CampaignRecipient::create([
                'email_campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'status' => 'pending',
            ]);
        }

        AdminActivityLogger::log(
            'created',
            'Campaign',
            $campaign->id,
            "Campagne créée: {$campaign->name}"
        );

        return response()->json([
            'message' => 'Campagne créée avec succès',
            'campaign' => $campaign,
        ], 201);
    }

    /**
     * Update campaign
     */
    public function update(Request $request, EmailCampaign $campaign): JsonResponse
    {
        if (!$campaign->canBeSent()) {
            return response()->json(['message' => 'Cette campagne ne peut plus être modifiée'], 400);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'subject' => ['sometimes', 'string'],
            'message' => ['sometimes', 'string'],
            'email_body' => ['sometimes', 'string'],
            'push_url' => ['sometimes', 'url'],
            'scheduled_at' => ['sometimes', 'nullable', 'date', 'after:now'],
            'admin_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($validated['admin_id']);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        unset($validated['admin_id']);
        $campaign->update($validated);

        return response()->json([
            'message' => 'Campagne mise à jour',
            'campaign' => $campaign->fresh(),
        ]);
    }

    /**
     * Send campaign
     */
    public function send(Request $request, EmailCampaign $campaign): JsonResponse
    {
        $validated = $request->validate([
            'admin_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($validated['admin_id']);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        if (!$campaign->canBeSent()) {
            return response()->json(['message' => 'Cette campagne ne peut pas être envoyée'], 400);
        }

        $campaign->update(['status' => 'sending']);

        // Send to recipients
        $recipients = $campaign->recipients()->where('status', 'pending')->with('user')->get();

        foreach ($recipients as $recipient) {
            try {
                $user = $recipient->user;
                $emailSent = false;
                $pushSent = false;

                // Send email
                if (in_array($campaign->type, ['email', 'both'])) {
                    if ($user->email) {
                        try {
                            Mail::raw($campaign->message, function ($message) use ($user, $campaign) {
                                $message->to($user->email)
                                    ->subject($campaign->subject ?? 'Notification')
                                    ->from(config('mail.from.address'), config('mail.from.name'));
                            });
                            $emailSent = true;
                        } catch (\Exception $e) {
                            \Log::error("Email send failed for user {$user->id}: " . $e->getMessage());
                        }
                    }
                }

                // Send push notification
                if (in_array($campaign->type, ['push', 'both'])) {
                    if ($user->push_notifications !== false) {
                        try {
                            $webPush = new WebPushService();
                            $webPush->sendToUser(
                                $user,
                                $campaign->subject ?? 'Notification',
                                $campaign->message,
                                $campaign->push_url ?? '/dashboard'
                            );
                            $pushSent = true;
                        } catch (\Exception $e) {
                            \Log::error("Push send failed for user {$user->id}: " . $e->getMessage());
                        }
                    }
                }

                // Mark as sent if at least one method succeeded
                if ($emailSent || $pushSent) {
                    $recipient->markAsSent();
                    $campaign->increment('sent_count');
                } else {
                    $recipient->markAsFailed('No delivery method succeeded');
                    $campaign->increment('failed_count');
                }
            } catch (\Exception $e) {
                \Log::error("Campaign send error for recipient {$recipient->id}: " . $e->getMessage());
                $recipient->markAsFailed($e->getMessage());
                $campaign->increment('failed_count');
            }
        }

        $campaign->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        AdminActivityLogger::log(
            'sent',
            'Campaign',
            $campaign->id,
            "Campagne envoyée: {$campaign->name} ({$campaign->sent_count} envois)"
        );

        return response()->json([
            'message' => 'Campagne envoyée',
            'sent_count' => $campaign->sent_count,
            'failed_count' => $campaign->failed_count,
        ]);
    }

    /**
     * Delete campaign
     */
    public function destroy(Request $request, EmailCampaign $campaign): JsonResponse
    {
        $validated = $request->validate([
            'admin_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($validated['admin_id']);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $name = $campaign->name;
        $campaign->delete();

        AdminActivityLogger::log(
            'deleted',
            'Campaign',
            $campaign->id,
            "Campagne supprimée: {$name}"
        );

        return response()->json(['message' => 'Campagne supprimée']);
    }

    /**
     * Get campaign statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_campaigns' => EmailCampaign::count(),
            'draft_campaigns' => EmailCampaign::draft()->count(),
            'scheduled_campaigns' => EmailCampaign::scheduled()->count(),
            'sent_campaigns' => EmailCampaign::sent()->count(),
            'total_sent' => EmailCampaign::sum('sent_count'),
            'total_opened' => EmailCampaign::sum('opened_count'),
            'total_clicked' => EmailCampaign::sum('clicked_count'),
            'average_open_rate' => $this->calculateAverageOpenRate(),
            'average_click_rate' => $this->calculateAverageClickRate(),
            'recent_campaigns' => EmailCampaign::with('creator')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Get recipients for target audience
     */
    protected function getRecipients(string $targetAudience, ?array $filters)
    {
        $query = User::query();

        switch ($targetAudience) {
            case 'clients':
                $query->where('role', 'client');
                break;
            case 'prestataires':
                $query->where('role', 'prestataire');
                break;
            case 'verified':
                $query->where('is_verified', true);
                break;
            case 'custom':
                if ($filters) {
                    if (isset($filters['role'])) {
                        $query->where('role', $filters['role']);
                    }
                    if (isset($filters['is_verified'])) {
                        $query->where('is_verified', $filters['is_verified']);
                    }
                    if (isset($filters['city'])) {
                        $query->where('city', $filters['city']);
                    }
                }
                break;
        }

        return $query->get();
    }

    /**
     * Calculate average open rate
     */
    protected function calculateAverageOpenRate(): float
    {
        $campaigns = EmailCampaign::sent()->get();
        if ($campaigns->isEmpty()) {
            return 0;
        }

        $totalOpenRate = $campaigns->sum(fn($c) => $c->getOpenRate());
        return round($totalOpenRate / $campaigns->count(), 2);
    }

    /**
     * Calculate average click rate
     */
    protected function calculateAverageClickRate(): float
    {
        $campaigns = EmailCampaign::sent()->get();
        if ($campaigns->isEmpty()) {
            return 0;
        }

        $totalClickRate = $campaigns->sum(fn($c) => $c->getClickRate());
        return round($totalClickRate / $campaigns->count(), 2);
    }
}
