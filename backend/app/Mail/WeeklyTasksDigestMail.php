<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WeeklyTasksDigestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $userName;
    public $tasks;
    public $taskCount;
    public $location;

    public function __construct(string $userName, array $tasks, string $location)
    {
        $this->userName = $userName;
        $this->tasks = $tasks;
        $this->taskCount = count($tasks);
        $this->location = $location;
    }

    public function build()
    {
        return $this->subject("🔔 {$this->taskCount} nouvelle(s) mission(s) près de chez vous !")
                    ->view('emails.weekly-tasks-digest');
    }
}
