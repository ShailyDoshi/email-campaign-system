<?php

namespace Database\Seeders;

use App\Models\Contact;
use Illuminate\Database\Seeder;

class ContactSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $contacts = [
            ['name' => 'John Doe', 'email' => 'john@example.com', 'status' => 'active', 'company' => 'Google'],
            ['name' => 'Jane Smith', 'email' => 'jane@example.com', 'status' => 'active', 'company' => 'Apple'],
            ['name' => 'Bob Johnson', 'email' => 'bob@example.com', 'status' => 'unsubscribed', 'company' => 'Microsoft'],
            ['name' => 'Alice Williams', 'email' => 'alice@example.com', 'status' => 'active', 'company' => 'Amazon'],
            ['name' => 'Charlie Brown', 'email' => 'charlie@example.com', 'status' => 'active', 'company' => 'Meta'],
            ['name' => 'Shaily Doshi', 'email' => 'shailydoshi20@gmail.com', 'status' => 'active', 'company' => 'Developer'],
        ];

        foreach ($contacts as $contactData) {
            Contact::create($contactData);
        }
    }
}
