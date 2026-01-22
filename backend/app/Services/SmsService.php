<?php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class SmsService
{
    private $twilio;
    private $fromNumber;

    public function __construct()
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $this->fromNumber = config('services.twilio.from');

        if ($sid && $token) {
            $this->twilio = new Client($sid, $token);
        }
    }

    /**
     * Надіслати SMS
     */
    public function sendSms(string $to, string $message): bool
    {
        if (!$this->twilio) {
            Log::warning('Twilio not configured, SMS not sent', ['to' => $to]);
            return false;
        }

        try {
            // Форматуємо номер телефону (додаємо +33 для Франції якщо потрібно)
            $formattedNumber = $this->formatPhoneNumber($to);

            $this->twilio->messages->create(
                $formattedNumber,
                [
                    'from' => $this->fromNumber,
                    'body' => $message,
                ]
            );

            Log::info('SMS sent successfully', ['to' => $formattedNumber]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send SMS', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Форматування номера телефону для Франції
     */
    private function formatPhoneNumber(string $phone): string
    {
        // Видаляємо всі пробіли та спеціальні символи
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        // Якщо номер починається з 0, замінюємо на +33
        if (substr($phone, 0, 1) === '0') {
            $phone = '+33' . substr($phone, 1);
        }

        // Якщо номер не має коду країни, додаємо +33
        if (substr($phone, 0, 1) !== '+') {
            $phone = '+33' . $phone;
        }

        return $phone;
    }

    /**
     * SMS при новій пропозиції
     */
    public function sendNewOfferSms(string $phone, string $clientName, string $taskTitle): bool
    {
        $message = "ProchePro: {$clientName} a reçu une nouvelle offre pour '{$taskTitle}'. Consultez votre tableau de bord pour plus de détails.";
        return $this->sendSms($phone, $message);
    }

    /**
     * SMS коли майстер в дорозі
     */
    public function sendPrestataireOnTheWaySms(string $phone, string $prestataireName, string $eta = '30 minutes'): bool
    {
        $message = "ProchePro: Votre prestataire {$prestataireName} est en route ! Arrivée estimée: {$eta}.";
        return $this->sendSms($phone, $message);
    }

    /**
     * SMS коли майстер прибув
     */
    public function sendPrestataireArrivedSms(string $phone, string $prestataireName): bool
    {
        $message = "ProchePro: Votre prestataire {$prestataireName} est arrivé sur place.";
        return $this->sendSms($phone, $message);
    }

    /**
     * SMS про прийняття пропозиції
     */
    public function sendOfferAcceptedSms(string $phone, string $clientName, string $taskTitle): bool
    {
        $message = "ProchePro: Félicitations ! {$clientName} a accepté votre offre pour '{$taskTitle}'. Contactez le client pour organiser l'intervention.";
        return $this->sendSms($phone, $message);
    }

    /**
     * SMS про завершення завдання
     */
    public function sendTaskCompletedSms(string $phone, string $taskTitle): bool
    {
        $message = "ProchePro: La tâche '{$taskTitle}' est terminée. N'oubliez pas de laisser un avis !";
        return $this->sendSms($phone, $message);
    }

    /**
     * SMS про оплату
     */
    public function sendPaymentReceivedSms(string $phone, float $amount): bool
    {
        $message = "ProchePro: Paiement de {$amount}€ reçu avec succès. Les fonds seront transférés sous 2-3 jours ouvrables.";
        return $this->sendSms($phone, $message);
    }

    /**
     * SMS код верифікації (2FA)
     */
    public function sendVerificationCodeSms(string $phone, string $code): bool
    {
        $message = "ProchePro: Votre code de vérification est: {$code}. Valide pendant 10 minutes.";
        return $this->sendSms($phone, $message);
    }
}
