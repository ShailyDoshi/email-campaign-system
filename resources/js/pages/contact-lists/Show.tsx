import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Users, UserMinus, Plus } from 'lucide-react';

interface Contact {
    id: number;
    name: string;
    email: string;
    company: string | null;
    status: 'active' | 'unsubscribed';
    created_at: string;
}

interface ContactList {
    id: number;
    name: string;
    description: string | null;
    contacts: Contact[];
}

interface ContactListsShowProps {
    list: ContactList;
    availableContacts: Contact[];
}

export default function ContactListsShow({ list, availableContacts }: ContactListsShowProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const { post, processing } = useForm({});

    const toggleContact = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const assignContacts = () => {
        router.post(`/contact-lists/${list.id}/assign-contacts`, {
            contact_ids: selectedIds,
        }, {
            onSuccess: () => setSelectedIds([]),
        });
    };

    const removeContact = (contactId: number, contactName: string) => {
        if (window.confirm(`Are you sure you want to remove ${contactName} from this list?`)) {
            router.get(`/contact-lists/${list.id}/remove-contact/${contactId}`);
        }
    };

    return (
        <>
            <Head title={list.name} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/contact-lists/index" className="text-muted-foreground hover:text-primary mb-2 flex items-center gap-1 text-sm transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Lists
                        </Link>
                        <h1 className="text-3xl font-black tracking-tight">{list.name}</h1>
                        <p className="text-muted-foreground mt-1 max-w-2xl">
                            {list.description || 'Manage the contacts assigned to this list.'}
                        </p>
                    </div>
                    <div className="bg-primary/10 rounded-2xl p-4 text-center min-w-[120px]">
                        <p className="text-3xl font-black text-primary">{list.contacts.length}</p>
                        <p className="text-xs font-semibold text-primary/70 uppercase tracking-wider">Total Contacts</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left Column: Current Contacts */ }
                    <Card className="border-none shadow-xl bg-card flex flex-col overflow-hidden h-[600px]">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Contacts in this List
                            </CardTitle>
                            <CardDescription>
                                Currently assigned subscribers that will receive campaigns targeted to this list.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden relative">
                            <ScrollArea className="h-full">
                                {list.contacts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center h-full opacity-60">
                                        <Users className="w-12 h-12 mb-4 text-muted-foreground" />
                                        <h3 className="text-lg font-bold">No contacts added yet</h3>
                                        <p className="text-sm text-muted-foreground">Select contacts from the panel on the right to add them.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {list.contacts.map(contact => (
                                            <div key={contact.id} className="flex justify-between items-center p-4 hover:bg-muted/10 transition-colors">
                                                <div>
                                                    <p className="font-semibold text-sm">{contact.name}</p>
                                                    <p className="text-xs text-muted-foreground">{contact.email}</p>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => removeContact(contact.id, contact.name)}
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Remove</span>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Right Column: Available Contacts */ }
                    <Card className="border-none shadow-xl bg-card flex flex-col overflow-hidden h-[600px]">
                        <CardHeader className="bg-muted/30 border-b pb-4 flex flex-row items-start justify-between space-y-0">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-primary" />
                                    Add Contacts
                                </CardTitle>
                                <CardDescription className="mt-1.5">
                                    Select active contacts to assign them to this list.
                                </CardDescription>
                            </div>
                            
                            {selectedIds.length > 0 && (
                                <Button 
                                    onClick={assignContacts} 
                                    disabled={processing}
                                    className="shadow-sm font-semibold animate-in fade-in"
                                >
                                    {processing ? 'Adding...' : `Add ${selectedIds.length} Selected`}
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden relative">
                            <ScrollArea className="h-full">
                                {availableContacts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center h-full opacity-60">
                                        <div className="w-12 h-12 mb-4 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xl">
                                            ✓
                                        </div>
                                        <h3 className="text-lg font-bold">You're all caught up!</h3>
                                        <p className="text-sm text-muted-foreground">All of your active contacts are already in this list.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {availableContacts.map(contact => (
                                            <label 
                                                key={contact.id} 
                                                className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-muted/30 ${selectedIds.includes(contact.id) ? 'bg-primary/5' : ''}`}
                                            >
                                                <Checkbox 
                                                    checked={selectedIds.includes(contact.id)}
                                                    onCheckedChange={() => toggleContact(contact.id)}
                                                />
                                                <div>
                                                    <p className="font-semibold text-sm">{contact.name}</p>
                                                    <p className="text-xs text-muted-foreground">{contact.email}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </>
    );
}

ContactListsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Contact Lists', href: '/contact-lists/index' },
        { title: 'Manage List', href: '#' },
    ],
};
