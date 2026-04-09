<?php

namespace App\Http\Controllers;

use App\Http\Requests\CampaignFormRequest;
use App\Jobs\SendCampaignEmail;
use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\CampaignSendLog;
use App\Models\ContactList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public function index(): Response
    {
        $campaigns = Campaign::withCount('recipients')
            ->with('contactLists')
            ->latest()
            ->get();

        $lists = ContactList::all();

        return Inertia::render('campaigns/Index', [
            'campaigns' => $campaigns,
            'availableLists' => $lists,
        ]);
    }

    public function storeOrUpdate(CampaignFormRequest $request, Campaign $campaign = null)
    {
        try {
            $validated = $request->validated();
            $isNew = !$campaign;

            if ($isNew) {
                $campaign = new Campaign();
            }

            $campaign->fill([
                'title'        => $validated['title'],
                'subject'      => $validated['subject'],
                'body'         => $validated['body'],
                'scheduled_at' => $validated['scheduled_at'] ?? null,
                'status'       => $campaign->status ?? 'draft',
            ])->save();

            $campaign->contactLists()->sync($validated['contact_list_ids']);

            return redirect()->route('campaigns.index')
                ->with('success', 'Campaign saved successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function show(Campaign $campaign): Response
    {
        $campaign->load([
            'contactLists',
            'recipients.contact',
            'recipients.logs',
        ]);

        $stats = [
            'total'     => $campaign->recipients->count(),
            'sent'      => $campaign->recipients->where('status', 'sent')->count(),
            'failed'    => $campaign->recipients->where('status', 'failed')->count(),
            'skipped'   => $campaign->recipients->where('status', 'skipped')->count(),
            'pending'   => $campaign->recipients->whereIn('status', ['pending','queued'])->count(),
        ];

        // If it's a draft, pre-calculate potential unique contacts for preview
        $potentialContacts = [];
        if ($campaign->status === 'draft') {
            $contactIds = collect();
            foreach ($campaign->contactLists as $list) {
                $ids = $list->contacts()->where('status', 'active')->pluck('contacts.id');
                $contactIds = $contactIds->merge($ids);
            }
            $potentialContacts = \App\Models\Contact::whereIn('id', $contactIds->unique())
                ->get(['id', 'name', 'email']);
            
            // For stats display on drafts:
            if ($stats['total'] === 0) {
                $stats['total'] = $potentialContacts->count();
                $stats['pending'] = $potentialContacts->count();
            }
        }

        // Latest 20 logs across all recipients
        $recentLogs = CampaignSendLog::whereHas('recipient', function ($q) use ($campaign) {
                $q->where('campaign_id', $campaign->id);
            })
            ->with('recipient.contact')
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('campaigns/Show', [
            'campaign'   => $campaign,
            'stats'      => $stats,
            'recentLogs' => $recentLogs,
            'potentialContacts' => $potentialContacts,
        ]);
    }

    public function send(Request $request, Campaign $campaign)
    {
        if (!in_array($campaign->status, ['draft', 'failed'])) {
            return redirect()->back()
                ->with('error', 'Only draft or failed campaigns can be sent.');
        }

        try {
            // Set dedicated queue name for this campaign
            $queueName = 'campaign-' . $campaign->id;
            $campaign->update([
                'status'     => 'queued',
                'queue_name' => $queueName,
            ]);

            // Resolve unique contacts from all linked lists
            $contactIds = collect();
            foreach ($campaign->contactLists as $list) {
                $ids = $list->contacts()
                    ->where('status', 'active') // Rule B: skip unsubscribed
                    ->pluck('contacts.id');
                $contactIds = $contactIds->merge($ids);
            }

            // Rule A: remove duplicates
            $uniqueContactIds = $contactIds->unique()->values();

            foreach ($uniqueContactIds as $contactId) {
                // Rule A: prevent duplicate recipient in same campaign
                $recipient = CampaignRecipient::firstOrCreate(
                    [
                        'campaign_id' => $campaign->id,
                        'contact_id'  => $contactId,
                    ],
                    [
                        'status'    => 'queued',
                        'queued_at' => now(),
                    ]
                );

                // Log queued event
                CampaignSendLog::create([
                    'campaign_recipient_id' => $recipient->id,
                    'event'                 => 'queued',
                    'message'               => 'Recipient queued for sending',
                ]);

                // Dispatch job to dedicated campaign queue
                SendCampaignEmail::dispatch($recipient)
                    ->onQueue($queueName);
            }

            // Handle contacts that are in campaign but unsubscribed
            $allContactIds = collect();
            foreach ($campaign->contactLists as $list) {
                $ids = $list->contacts()->pluck('contacts.id');
                $allContactIds = $allContactIds->merge($ids);
            }

            $unsubscribedIds = $allContactIds->unique()
                ->diff($uniqueContactIds);

            foreach ($unsubscribedIds as $contactId) {
                $recipient = CampaignRecipient::firstOrCreate(
                    [
                        'campaign_id' => $campaign->id,
                        'contact_id'  => $contactId,
                    ],
                    [
                        'status'         => 'skipped',
                        'failure_reason' => 'Contact is unsubscribed',
                        'processed_at'   => now(),
                    ]
                );

                CampaignSendLog::create([
                    'campaign_recipient_id' => $recipient->id,
                    'event'                 => 'skipped',
                    'message'               => 'Skipped — contact is unsubscribed',
                ]);
            }

            $campaign->update(['status' => 'processing']);

            return redirect()->route('campaigns.show', $campaign->id)
                ->with('success', 'Campaign is now being sent!');

        } catch (\Exception $e) {
            $campaign->update(['status' => 'failed']);
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function retry(Campaign $campaign)
    {
        if ($campaign->status !== 'completed' && $campaign->status !== 'failed') {
            return redirect()->back()->with('error', 'Cannot retry this campaign.');
        }

        $queueName = $campaign->queue_name ?? 'campaign-' . $campaign->id;

        // Only retry failed recipients
        $failedRecipients = $campaign->recipients()
            ->where('status', 'failed')
            ->with('contact')
            ->get();

        foreach ($failedRecipients as $recipient) {
            $recipient->update([
                'status'         => 'queued',
                'failure_reason' => null,
                'queued_at'      => now(),
            ]);

            CampaignSendLog::create([
                'campaign_recipient_id' => $recipient->id,
                'event'                 => 'queued',
                'message'               => 'Retrying failed recipient',
            ]);

            SendCampaignEmail::dispatch($recipient)->onQueue($queueName);
        }

        $campaign->update(['status' => 'processing']);

        return redirect()->route('campaigns.show', $campaign->id)
            ->with('success', 'Retrying ' . $failedRecipients->count() . ' failed recipients.');
    }

    public function delete(Campaign $campaign)
    {
        try {
            // Delete related recipients/logs via cascade, or manually:
            $campaign->recipients()->delete(); // Depends on cascade settings
            $campaign->contactLists()->detach();
            $campaign->delete();
            return redirect()->route('campaigns.index')
                ->with('success', 'Campaign deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
