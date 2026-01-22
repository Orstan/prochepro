<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeSeriesDay7 extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public array $stats
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⭐ Vos premiers pas sur ProchePro',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.automation.welcome-day-7',
        );
    }
}
