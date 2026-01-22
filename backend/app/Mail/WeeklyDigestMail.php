<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WeeklyDigestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public array $newTasks,
        public array $stats
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '📊 Votre résumé hebdomadaire ProchePro',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.automation.weekly-digest',
        );
    }
}
