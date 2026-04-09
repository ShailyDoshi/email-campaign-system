<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignContactsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'contact_ids'   => 'required|array',
            'contact_ids.*' => 'exists:contacts,id',
        ];
    }
}
