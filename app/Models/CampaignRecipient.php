<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampaignRecipient extends Model
{
    protected $guarded = [];
    protected $table = 'campaign_recipients';

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function logs()
    {
        return $this->hasMany(CampaignSendLog::class);
    }
}
