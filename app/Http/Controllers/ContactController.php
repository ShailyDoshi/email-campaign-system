<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactFormRequest;
use App\Models\Contact;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(): Response
    {
        $contacts = Contact::orderBy('id', 'desc')->get();
        
        return Inertia::render('contacts/Index', [
            'contacts' => $contacts
        ]);
    }



    public function storeOrUpdate(ContactFormRequest $request, Contact $contact = null)
    {
        try {
            if (!$contact) {
                $contact = new Contact();
            }

            $contact->fill($request->validated())->save();

            return redirect()->route('contacts.index')->with('success', "Contact saved successfully.");
        } catch (\Exception $exception) {
            return redirect()->back()->with('error', $exception->getMessage());
        }
    }

    public function delete(Contact $contact)
    {
        try {
            $contact->delete();
            return redirect()->route('contacts.index')->with('success', "{$contact->name} has been deleted successfully.");
        } catch (\Exception $exception) {
            return redirect()->back()->with('error', $exception->getMessage());
        }
    }
}
