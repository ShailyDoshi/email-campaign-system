<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class ProcessCampaigns extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'campaigns:work';

    /**
     * The console command description.
     */
    protected $description = 'Windows-friendly dynamic worker that mimics Horizon by auto-detecting new campaign queues.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Starting Dynamic Campaign Worker (Windows Fallback)...");
        $this->line("This process will scan for newly created campaign queues every 2 seconds.");
        
        while (true) {
            // Find all campaigns that currently need processing
            $activeQueues = Campaign::whereIn('status', ['queued', 'processing'])
                ->pluck('queue_name')
                ->filter()
                ->unique()
                ->implode(',');

            // If we found active dynamic queues, process them!
            if (!empty($activeQueues)) {
                $this->info("\n[".now()."] Found active queues: {$activeQueues} | Processing burst...");
                
                // We run the worker with --stop-when-empty so it processes everything currently pending, 
                // and then hands control back to our while loop to scan for new queues again!
                Artisan::call('queue:work', [
                    'connection' => 'redis',
                    '--queue' => $activeQueues,
                    '--stop-when-empty' => true,
                ], $this->output);
            }
            
            // Sleep briefly to prevent CPU thrashing
            sleep(2);
        }
    }
}
