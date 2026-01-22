<?php

namespace App\Mail;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TaskReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Task $task,
        public int $hoursElapsed
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⏰ N\'oubliez pas votre annonce',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.automation.task-reminder',
        );
    }
}
