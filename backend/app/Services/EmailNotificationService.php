<?php

namespace App\Services;

use App\Models\User;
use App\Models\Task;
use App\Models\Offer;
use App\Mail\NewOfferMail;
use App\Mail\OfferAcceptedMail;
use App\Mail\TaskCompletedMail;
use App\Mail\NewMessageMail;
use App\Mail\NewReviewMail;
use Illuminate\Support\Facades\Mail;

class EmailNotificationService
{
    public function sendNewOfferNotification(Task $task, Offer $offer, User $prestataire): void
    {
        $client = $task->client;
        
        if (!$client || !$client->email || $client->email_notifications === false) {
            return;
        }

        try {
            Mail::to($client->email)->queue(new NewOfferMail([
                'client_name' => $client->name,
                'prestataire_name' => $prestataire->name,
                'task_id' => $task->id,
                'task_title' => $task->title,
                'price' => $offer->price,
                'message' => $offer->message,
            ]));
        } catch (\Exception $e) {
            \Log::error('Failed to send new offer email: ' . $e->getMessage());
        }
    }

    public function sendOfferAcceptedNotification(Task $task, Offer $offer, User $prestataire): void
    {
        if (!$prestataire->email || $prestataire->email_notifications === false) {
            return;
        }

        try {
            Mail::to($prestataire->email)->queue(new OfferAcceptedMail([
                'prestataire_name' => $prestataire->name,
                'task_id' => $task->id,
                'task_title' => $task->title,
                'price' => $offer->price,
            ]));
        } catch (\Exception $e) {
            \Log::error('Failed to send offer accepted email: ' . $e->getMessage());
        }
    }

    public function sendTaskCompletedNotification(Task $task, User $client, User $prestataire): void
    {
        // Notify prestataire
        if ($prestataire->email && $prestataire->email_notifications !== false) {
            try {
                Mail::to($prestataire->email)->queue(new TaskCompletedMail([
                    'recipient_name' => $prestataire->name,
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'is_prestataire' => true,
                ]));
            } catch (\Exception $e) {
                \Log::error('Failed to send task completed email to prestataire: ' . $e->getMessage());
            }
        }

        // Notify client
        if ($client->email && $client->email_notifications !== false) {
            try {
                Mail::to($client->email)->queue(new TaskCompletedMail([
                    'recipient_name' => $client->name,
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'is_prestataire' => false,
                ]));
            } catch (\Exception $e) {
                \Log::error('Failed to send task completed email to client: ' . $e->getMessage());
            }
        }
    }

    public function sendNewMessageNotification(User $recipient, User $sender, Task $task): void
    {
        if (!$recipient->email || $recipient->email_notifications === false) {
            return;
        }

        try {
            Mail::to($recipient->email)->queue(new NewMessageMail([
                'recipient_name' => $recipient->name,
                'sender_name' => $sender->name,
                'task_id' => $task->id,
                'task_title' => $task->title,
            ]));
        } catch (\Exception $e) {
            \Log::error('Failed to send new message email: ' . $e->getMessage());
        }
    }

    public function sendNewReviewNotification(User $recipient, User $reviewer, Task $task, int $rating): void
    {
        if (!$recipient->email || $recipient->email_notifications === false) {
            return;
        }

        try {
            Mail::to($recipient->email)->queue(new NewReviewMail([
                'recipient_name' => $recipient->name,
                'reviewer_name' => $reviewer->name,
                'task_id' => $task->id,
                'task_title' => $task->title,
                'rating' => $rating,
            ]));
        } catch (\Exception $e) {
            \Log::error('Failed to send new review email: ' . $e->getMessage());
        }
    }
}
