<?php

namespace App\Console\Commands;

use App\Services\FraudDetectionService;
use Illuminate\Console\Command;

class ScanForFraud extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'fraud:scan';

    /**
     * The console command description.
     */
    protected $description = 'Scan all users for suspicious activity and block if necessary';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting fraud detection scan...');

        $fraudService = new FraudDetectionService();
        $fraudService->scanAllUsers();

        $this->info('Fraud detection scan completed.');

        return Command::SUCCESS;
    }
}
