<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\Contact;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the professional dashboard overview.
     */
    public function index(): Response
    {
        $totalContacts = Contact::count();
        $totalActiveContacts = Contact::where('status', 'active')->count();
        $campaignsSent = Campaign::where('status', 'completed')->count();
        
        $totalRecipients = CampaignRecipient::count();
        $sentRecipients = CampaignRecipient::where('status', 'sent')->count();
        $successRate = $totalRecipients > 0 ? round(($sentRecipients / $totalRecipients) * 100, 1) : 0;

        return Inertia::render('dashboard', [
            'stats' => [
                'totalContacts' => $totalContacts,
                'activeContacts' => $totalActiveContacts,
                'campaignsSent' => $campaignsSent,
                'successRate' => $successRate . '%'
            ],
            'recentCampaigns' => Campaign::latest()->take(5)->get()
        ]);
    }
}
