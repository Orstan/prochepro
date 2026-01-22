<?php

namespace App\Mail;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PayoutRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public Task $task;
    public User $prestataire;
    public float $amount;

    /**
     * Create a new message instance.
     */
    public function __construct(Task $task, User $prestataire, float $amount)
    {
        $this->task = $task;
        $this->prestataire = $prestataire;
        $this->amount = $amount;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '💰 Demande de paiement - ' . $this->task->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.payout-request',
        );
    }
}
