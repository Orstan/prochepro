<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InactivityNudgeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $userName;
    public $daysInactive;
    public $missedOpportunities;
    public $nudgeType;

    public function __construct(string $userName, int $daysInactive, array $data = [])
    {
        $this->userName = $userName;
        $this->daysInactive = $daysInactive;
        $this->missedOpportunities = $data['missed_opportunities'] ?? 0;
        $this->nudgeType = $data['nudge_type'] ?? 'general';
    }

    public function build()
    {
        $subject = match($this->nudgeType) {
            'missed_offers' => "⏰ Vous avez {$this->missedOpportunities} offre(s) en attente",
            'no_response' => "💬 Des clients attendent votre réponse",
            'inactive_prestataire' => "🚀 Revenez sur ProchePro - Des missions vous attendent !",
            default => "👋 Ça fait un moment ! Revenez sur ProchePro"
        };

        return $this->subject($subject)
                    ->view('emails.inactivity-nudge');
    }
}
