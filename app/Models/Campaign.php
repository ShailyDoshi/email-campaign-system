<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    protected $guarded = [];
    protected $table = 'campaigns';

    public function contactLists()
    {
        return $this->belongsToMany(ContactList::class,'campaign_contact_list');
    }

    public function recipients()
    {
        return $this->hasMany(CampaignRecipient::class);
    }

    // Stats helpers (Courtesy of Claude!)
    public function sentCount(): int
    {
        return $this->recipients()->where('status', 'sent')->count();
    }

    public function failedCount(): int
    {
        return $this->recipients()->where('status', 'failed')->count();
    }

    public function skippedCount(): int
    {
        return $this->recipients()->where('status', 'skipped')->count();
    }

    public function pendingCount(): int
    {
        return $this->recipients()->whereIn('status', ['pending', 'queued', 'processing'])->count();
    }
}
