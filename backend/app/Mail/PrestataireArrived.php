<?php

namespace App\Mail;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PrestataireArrived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Task $task,
        public User $prestataire
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '✅ Votre prestataire est arrivé !',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.prestataire-arrived',
        );
    }
}
