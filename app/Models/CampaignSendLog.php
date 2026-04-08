<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampaignSendLog extends Model
{
    protected $guarded = [];
    protected $table = 'campaign_send_logs';

    public function recipient()
    {
        return $this->belongsTo(CampaignRecipient::class,'campaign_recipient_id');
    }
}
