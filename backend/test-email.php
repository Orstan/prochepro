<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Mail;

try {
    echo "Testing email configuration...\n";
    echo "MAIL_MAILER: " . config('mail.default') . "\n";
    echo "MAIL_FROM: " . config('mail.from.address') . "\n\n";

    Mail::raw('Test email from ProChePro campaign system', function ($message) {
        $message->to('test@example.com')
            ->subject('Test Email')
            ->from(config('mail.from.address'), config('mail.from.name'));
    });

    echo "✅ Email sent successfully!\n";
    echo "Check your mail logs for delivery status.\n";
} catch (\Exception $e) {
    echo "❌ Email failed: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
