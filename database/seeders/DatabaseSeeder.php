<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\ContactList;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a default user
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create some contacts
        $contacts = [
            ['name' => 'John Doe', 'email' => 'john@example.com', 'status' => 'active', 'company' => 'Google'],
            ['name' => 'Jane Smith', 'email' => 'jane@example.com', 'status' => 'active', 'company' => 'Apple'],
            ['name' => 'Bob Johnson', 'email' => 'bob@example.com', 'status' => 'unsubscribed', 'company' => 'Microsoft'],
            ['name' => 'Alice Williams', 'email' => 'alice@example.com', 'status' => 'active', 'company' => 'Amazon'],
            ['name' => 'Charlie Brown', 'email' => 'charlie@example.com', 'status' => 'active', 'company' => 'Meta'],
        ];

        foreach ($contacts as $contactData) {
            Contact::create($contactData);
        }

        // Create some contact lists
        $list1 = ContactList::create(['name' => 'Tech Giants', 'description' => 'Contacts from major tech companies']);
        $list2 = ContactList::create(['name' => 'Marketing Leads', 'description' => 'Potential leads for marketing campaigns']);

        // Assign contacts to lists
        $allContacts = Contact::all();
        $list1->contacts()->attach($allContacts->pluck('id')->toArray());
        $list2->contacts()->attach($allContacts->random(3)->pluck('id')->toArray());
    }
}
