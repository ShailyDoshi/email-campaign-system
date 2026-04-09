<?php

namespace App\Jobs;

use App\Mail\CampaignMail;
use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\CampaignSendLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendCampaignEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Retry 3 times if fails
    public int $tries = 3;

    public function __construct(
        public CampaignRecipient $recipient
    ) {}

    public function handle(): void
    {
        $recipient = $this->recipient->load(['contact', 'campaign']);
        $campaign  = $recipient->campaign;
        $contact   = $recipient->contact;

        try {
            // Send the actual email via SMTP
            Mail::to($contact->email)->send(
                new CampaignMail($campaign, $contact)
            );

            // Update recipient status to sent
            $recipient->update([
                'status'       => 'sent',
                'sent_at'      => now(),
                'processed_at' => now(),
            ]);

            // Log success
            CampaignSendLog::create([
                'campaign_recipient_id' => $recipient->id,
                'event'                 => 'sent',
                'message'               => 'Email sent successfully to ' . $contact->email,
            ]);

        } catch (\Exception $e) {

            // Update recipient status to failed
            $recipient->update([
                'status'         => 'failed',
                'failure_reason' => $e->getMessage(),
                'processed_at'   => now(),
            ]);

            // Log failure
            CampaignSendLog::create([
                'campaign_recipient_id' => $recipient->id,
                'event'                 => 'failed',
                'message'               => $e->getMessage(),
            ]);
        }

        // Check if all recipients are processed
        // If yes update campaign status to completed
        $this->updateCampaignStatus($campaign);
    }

    private function updateCampaignStatus(Campaign $campaign): void
    {
        $total     = $campaign->recipients()->count();
        $processed = $campaign->recipients()
            ->whereIn('status', ['sent', 'failed', 'skipped'])
            ->count();

        if ($total === $processed) {
            $hasFailed = $campaign->recipients()
                ->where('status', 'failed')
                ->exists();

            $campaign->update([
                'status' => $hasFailed ? 'completed' : 'completed'
            ]);
        }
    }
}
