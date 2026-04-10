<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\CampaignSendLog;
use App\Models\Contact;
use App\Models\ContactList;
use Illuminate\Database\Seeder;

class CampaignSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $allContacts = Contact::all();
        $list1 = ContactList::where('name', 'Tech Giants')->first();
        $list2 = ContactList::where('name', 'Marketing Leads')->first();

        // 1. A Draft Campaign (Scenario: Ready to send)
        $draft = Campaign::create([
            'title' => 'Summer Newsletter 2026',
            'subject' => 'Check out our summer deals!',
            'body' => '<p>Hello {{ name }}, check this out!</p>',
            'status' => 'draft',
        ]);
        $draft->contactLists()->attach($list1->id);

        // 2. A Completed Campaign with mixed results (Scenario: Review performance)
        $completed = Campaign::create([
            'title' => 'Product Launch - Alpha',
            'subject' => 'We are live!',
            'body' => '<h1>Live now!</h1>',
            'status' => 'completed',
            'queue_name' => 'campaign-launch',
        ]);
        $completed->contactLists()->attach($list2->id);

        $contactsForCompleted = $allContacts->take(3);
        
        // Success recipient
        $r1 = CampaignRecipient::create([
            'campaign_id' => $completed->id,
            'contact_id' => $contactsForCompleted[0]->id,
            'status' => 'sent',
            'sent_at' => now()->subHours(2),
            'processed_at' => now()->subHours(2),
        ]);
        CampaignSendLog::create(['campaign_recipient_id' => $r1->id, 'event' => 'sent', 'message' => 'Delivered to inbox']);

        // Failed recipient
        $r2 = CampaignRecipient::create([
            'campaign_id' => $completed->id,
            'contact_id' => $contactsForCompleted[1]->id,
            'status' => 'failed',
            'failure_reason' => 'Connection could not be established with host "127.0.0.1:2525"',
            'processed_at' => now()->subHours(2),
        ]);
        CampaignSendLog::create(['campaign_recipient_id' => $r2->id, 'event' => 'failed', 'message' => 'Connection timed out']);

        // Skipped recipient (Unsubscribed)
        $unsubscribedContact = Contact::where('status', 'unsubscribed')->first();
        if ($unsubscribedContact) {
            $r3 = CampaignRecipient::create([
                'campaign_id' => $completed->id,
                'contact_id' => $unsubscribedContact->id,
                'status' => 'skipped',
                'failure_reason' => 'Contact is unsubscribed',
                'processed_at' => now()->subHours(2),
            ]);
            CampaignSendLog::create(['campaign_recipient_id' => $r3->id, 'event' => 'skipped', 'message' => 'Skipped — contact is unsubscribed']);
        }

        // 3. A Failed Campaign (Scenario: Global failure)
        $failed = Campaign::create([
            'title' => 'System Maintenance Alert',
            'subject' => 'Scheduled Down-time',
            'body' => '<p>Maintenance tonight.</p>',
            'status' => 'failed',
        ]);
        $failed->contactLists()->attach($list1->id);
    }
}
