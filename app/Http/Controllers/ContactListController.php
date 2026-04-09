<?php

namespace App\Http\Controllers;

use App\Models\ContactList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactListController extends Controller
{
    public function index(): Response
    {
        $lists = ContactList::orderBy('id', 'desc')->get();
        
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
        
        return Inertia::render('contact-lists/Show', [
            'list' => $list
        ]);
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
