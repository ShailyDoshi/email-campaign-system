<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignContactsRequest;
use App\Models\Contact;
use App\Models\ContactList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactListController extends Controller
{
    public function index(): Response
    {
        $lists = ContactList::withCount('contacts')->orderBy('id', 'desc')->get();
        
        return Inertia::render('contact-lists/Index', [
            'lists' => $lists
        ]);
    }

    public function storeOrUpdate(Request $request, ContactList $list = null)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        try {
            if (!$list) {
                $list = new ContactList();
            }

            $list->fill($validated)->save();

            return redirect()->route('contact_lists.index')->with('success', "Contact list saved successfully.");
        } catch (\Exception $exception) {
            return redirect()->back()->with('error', $exception->getMessage());
        }
    }

    public function show(ContactList $list): Response
    {
        // Load the list alongside its attached contacts
        $list->load('contacts');
        $availableContacts = Contact::where('status', 'active')
            ->whereNotIn('id', $list->contacts->pluck('id'))
            ->orderBy('name')
            ->get();
        
        return Inertia::render('contact-lists/Show', [
            'list' => $list,
            'availableContacts' => $availableContacts,
        ]);
    }

    public function assignContacts(AssignContactsRequest $request, ContactList $list)
    {
        $list->contacts()->syncWithoutDetaching($request->validated()['contact_ids']);

        return redirect()->route('contact_lists.show', $list->id)
            ->with('success', 'Contacts assigned successfully.');
    }

    public function removeContact(ContactList $list, Contact $contact)
    {
        $list->contacts()->detach($contact->id);

        return redirect()->route('contact_lists.show', $list->id)
            ->with('success', 'Contact removed from list.');
    }

    public function delete(ContactList $list)
    {
        try {
            $list->delete();
            return redirect()->route('contact_lists.index')->with('success', "{$list->name} has been deleted successfully.");
        } catch (\Exception $exception) {
            return redirect()->back()->with('error', $exception->getMessage());
        }
    }
}
