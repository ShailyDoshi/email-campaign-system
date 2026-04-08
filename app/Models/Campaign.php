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
}
