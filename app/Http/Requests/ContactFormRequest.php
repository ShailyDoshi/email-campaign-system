<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorize everything for now (auth middleware handles general access)
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // If passing a contact ID for unique validation, we check $this->contact
        $contactId = $this->route('contact') ? $this->route('contact')->id : null;

        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:contacts,email,' . $contactId,
            'company' => 'nullable|string|max:255',
            'status' => 'required|in:active,unsubscribed',
        ];
    }
}
