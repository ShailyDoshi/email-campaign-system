<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    protected $guarded = [];
    protected $table = 'contacts';

    public function contactList(): BelongsToMany
    {
        return $this->belongsToMany(ContactList::class,'contact_contact_list');
    }

    public function campaignRecipients(): HasMany
    {
        return $this->hasMany(CampaignRecipient::class);
    }
}
