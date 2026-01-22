<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateVapidKeys extends Command
{
    protected $signature = 'vapid:generate';
    protected $description = 'Generate VAPID keys for Web Push notifications';

    public function handle(): int
    {
        // Generate VAPID keys using openssl
        $privateKey = openssl_pkey_new([
            'curve_name' => 'prime256v1',
            'private_key_type' => OPENSSL_KEYTYPE_EC,
        ]);

        if (!$privateKey) {
            $this->error('Failed to generate private key');
            return 1;
        }

        // Export private key
        openssl_pkey_export($privateKey, $privateKeyPem);
        
        // Get public key
        $details = openssl_pkey_get_details($privateKey);
        
        if (!$details || !isset($details['ec']['x']) || !isset($details['ec']['y'])) {
            $this->error('Failed to get key details');
            return 1;
        }

        // Convert to URL-safe base64
        $publicKey = $this->base64UrlEncode(
            chr(4) . $details['ec']['x'] . $details['ec']['y']
        );
        
        // Extract private key D value and encode
        $privateKeyEncoded = $this->base64UrlEncode($details['ec']['d']);

        $this->info('VAPID Keys Generated Successfully!');
        $this->newLine();
        $this->line('Add these to your .env file:');
        $this->newLine();
        $this->line("VAPID_PUBLIC_KEY={$publicKey}");
        $this->line("VAPID_PRIVATE_KEY={$privateKeyEncoded}");
        $this->newLine();
        $this->info('Public key (for frontend): ' . $publicKey);

        return 0;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
