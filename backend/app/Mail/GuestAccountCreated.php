<?php

namespace App\Mail;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GuestAccountCreated extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $password;
    public $task;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $password, Task $task)
    {
        $this->user = $user;
        $this->password = $password;
        $this->task = $task;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Votre compte ProchePro a été créé !')
                    ->view('emails.guest-account-created');
    }
}
