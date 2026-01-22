<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Offer;
use App\Models\Task;
use App\Models\Message;
use App\Mail\InactivityNudgeMail;
use App\Services\WebPushService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendInactivityNudges extends Command
{
    protected $signature = 'notifications:send-inactivity-nudges';
    protected $description = 'Send nudge notifications to inactive users';

    public function handle()
    {
        $this->info('Starting inactivity nudge notifications...');
        
        // Check for different types of inactivity
        $this->checkMissedOffers();
        $this->checkNoResponse();
        $this->checkInactivePrestataires();
        
        $this->info('Inactivity nudges complete!');
        return 0;
    }

    /**
     * Nudge users who have pending offers they haven't responded to
     */
    protected function checkMissedOffers()
    {
        $this->info('Checking for missed offers...');
        
        $threeDaysAgo = Carbon::now()->subDays(3);
        
        // Find tasks with offers that haven't been reviewed in 3+ days
        $tasks = Task::where('status', 'published')
            ->whereHas('offers', function($q) use ($threeDaysAgo) {
                $q->where('status', 'pending')
                  ->where('created_at', '<=', $threeDaysAgo);
            })
            ->with(['client', 'offers' => function($q) {
                $q->where('status', 'pending');
            }])
            ->get();

        foreach ($tasks as $task) {
            $client = $task->client;
            if (!$client || !$client->email) continue;

            $pendingOffersCount = $task->offers->count();
            
            try {
                // Email
                if ($client->email_notifications !== false) {
                    Mail::to($client->email)->send(
                        new InactivityNudgeMail($client->name, 3, [
                            'missed_opportunities' => $pendingOffersCount,
                            'nudge_type' => 'missed_offers'
                        ])
                    );
                }

                // Push notification
                if ($client->push_notifications !== false) {
                    $webPush = new WebPushService();
                    $webPush->sendToUser(
                        $client,
                        "⏰ Offres en attente",
                        "Vous avez {$pendingOffersCount} offre(s) qui attendent votre réponse",
                        "/tasks/{$task->id}"
                    );
                }

                $this->info("✓ Nudge sent to {$client->email} ({$pendingOffersCount} pending offers)");
            } catch (\Exception $e) {
                $this->error("✗ Failed: {$e->getMessage()}");
            }
        }
    }

    /**
     * Nudge prestataires who haven't responded to messages
     */
    protected function checkNoResponse()
    {
        $this->info('Checking for unanswered messages...');
        
        $threeDaysAgo = Carbon::now()->subDays(3);
        
        // Find accepted offers where client sent a message but prestataire hasn't replied
        $offers = Offer::where('status', 'accepted')
            ->where('updated_at', '<=', $threeDaysAgo)
            ->with(['task.messages', 'prestataire'])
            ->get();

        foreach ($offers as $offer) {
            $task = $offer->task;
            if (!$task) continue;

            // Check if client sent message but prestataire didn't reply
            $lastClientMessage = $task->messages()
                ->where('sender_id', $task->client_id)
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$lastClientMessage) continue;

            $prestataireReplied = $task->messages()
                ->where('sender_id', $offer->prestataire_id)
                ->where('created_at', '>', $lastClientMessage->created_at)
                ->exists();

            if ($prestataireReplied) continue;

            $prestataire = $offer->prestataire;
            if (!$prestataire || !$prestataire->email) continue;

            $daysInactive = $lastClientMessage->created_at->diffInDays(now());

            try {
                // Email
                if ($prestataire->email_notifications !== false) {
                    Mail::to($prestataire->email)->send(
                        new InactivityNudgeMail($prestataire->name, $daysInactive, [
                            'nudge_type' => 'no_response'
                        ])
                    );
                }

                // Push
                if ($prestataire->push_notifications !== false) {
                    $webPush = new WebPushService();
                    $webPush->sendToUser(
                        $prestataire,
                        "💬 Message en attente",
                        "Un client attend votre réponse depuis {$daysInactive} jours",
                        "/messages/{$task->id}"
                    );
                }

                $this->info("✓ Nudge sent to {$prestataire->email} (no response for {$daysInactive} days)");
            } catch (\Exception $e) {
                $this->error("✗ Failed: {$e->getMessage()}");
            }
        }
    }

    /**
     * Nudge prestataires who haven't logged in for 7+ days
     */
    protected function checkInactivePrestataires()
    {
        $this->info('Checking for inactive prestataires...');
        
        $sevenDaysAgo = Carbon::now()->subDays(7);
        
        // Find prestataires who haven't logged in or made an offer in 7+ days
        $prestataires = User::where('role', 'prestataire')
            ->whereNotNull('email')
            ->where('last_login_at', '<=', $sevenDaysAgo)
            ->orWhereNull('last_login_at')
            ->get();

        foreach ($prestataires as $prestataire) {
            // Check if they have any recent offers
            $recentOffer = Offer::where('prestataire_id', $prestataire->id)
                ->where('created_at', '>=', $sevenDaysAgo)
                ->exists();

            if ($recentOffer) continue; // They're still active via offers

            // Count tasks they might have missed
            $latitude = $prestataire->latitude;
            $longitude = $prestataire->longitude;
            
            $missedTasks = 0;
            if ($latitude && $longitude) {
                $missedTasks = Task::selectRaw('(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance', [$latitude, $longitude, $latitude])
                    ->where('status', 'published')
                    ->where('created_at', '>=', $sevenDaysAgo)
                    ->having('distance', '<', 30)
                    ->count();
            }

            $daysInactive = $prestataire->last_login_at 
                ? $prestataire->last_login_at->diffInDays(now())
                : 30;

            try {
                // Email
                if ($prestataire->email_notifications !== false) {
                    Mail::to($prestataire->email)->send(
                        new InactivityNudgeMail($prestataire->name, $daysInactive, [
                            'missed_opportunities' => $missedTasks,
                            'nudge_type' => 'inactive_prestataire'
                        ])
                    );
                }

                $this->info("✓ Inactivity nudge sent to {$prestataire->email} ({$missedTasks} missed tasks)");
            } catch (\Exception $e) {
                $this->error("✗ Failed: {$e->getMessage()}");
            }
        }
    }
}
