<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\ContactList;
use Illuminate\Database\Seeder;

class ContactListSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some contact lists
        $list1 = ContactList::create(['name' => 'Tech Giants', 'description' => 'Contacts from major tech companies']);
        $list2 = ContactList::create(['name' => 'Marketing Leads', 'description' => 'Potential leads for marketing campaigns']);

        // Assign contacts to lists
        $allContacts = Contact::all();
        if ($allContacts->count() > 0) {
            $list1->contacts()->attach($allContacts->pluck('id')->toArray());
            $list2->contacts()->attach($allContacts->random(min(3, $allContacts->count()))->pluck('id')->toArray());
        }
    }
}
