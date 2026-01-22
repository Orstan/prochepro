<?php

namespace App\Console\Commands;

use App\Services\EmailAutomationService;
use Illuminate\Console\Command;

class ProcessAutomatedEmails extends Command
{
    protected $signature = 'email:process-automation';
    protected $description = 'Process and send automated emails that are ready';

    public function handle(EmailAutomationService $service): int
    {
        $this->info('Processing automated emails...');

        $count = $service->processReadyEmails();

        $this->info("Dispatched {$count} automated emails");

        return 0;
    }
}
