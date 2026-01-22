<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewVerificationRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $userName;
    public string $userEmail;
    public string $documentType;
    public string $firstName;
    public string $lastName;
    public int $requestId;

    public function __construct(
        string $userName,
        string $userEmail,
        string $documentType,
        string $firstName,
        string $lastName,
        int $requestId
    ) {
        $this->userName = $userName;
        $this->userEmail = $userEmail;
        $this->documentType = $documentType;
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->requestId = $requestId;
    }

    public function build(): self
    {
        return $this->subject('🔔 Nouvelle demande de vérification - ProchePro')
            ->view('emails.new_verification_request');
    }
}
