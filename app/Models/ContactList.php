<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ContactList extends Model
{
    protected $guarded = [];
    protected $table = 'contact_lists';

    
    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class, 'contact_contact_list');
    }

    public function campaigns(): BelongsToMany
    {
        return $this->belongsToMany(Campaign::class, 'campaign_contact_list');
    }
    
}
