<?php

namespace App\Mail;

use App\Models\Campaign;
use App\Models\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public Campaign $campaign;
    public Contact $contact;

    /**
     * Create a new message instance.
     */
    public function __construct(Campaign $campaign, Contact $contact)
    {
        $this->campaign = $campaign;
        $this->contact = $contact;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->campaign->subject ?? 'New Campaign from us!',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // Simple HTML rendering parsing the raw content the user types in the Campaign UI.
        return new Content(
            htmlString: $this->campaign->body ?? 'No content provided.',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
