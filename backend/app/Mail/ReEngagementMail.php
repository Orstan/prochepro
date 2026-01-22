<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReEngagementMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public array $suggestedTasks
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '💡 Ça vous manque ? Nouvelles opportunités vous attendent',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.automation.re-engagement',
        );
    }
}
