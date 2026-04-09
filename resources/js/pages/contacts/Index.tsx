import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Contact {
    id: number;
    name: string;
    email: string;
    company: string | null;
    status: 'active' | 'unsubscribed';
    created_at: string;
}

interface ContactsIndexProps {
    contacts: Contact[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Contacts', href: '/contacts/index' },
];

export interface ContactFormModalProps {
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
    contactToEdit: Contact | null;
}

export function ContactFormModal({ isOpen, onClose, contactToEdit }: ContactFormModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        company: '',
        status: 'active' as 'active' | 'unsubscribed',
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (contactToEdit) {
                setData({
                    name: contactToEdit.name,
                    email: contactToEdit.email,
                    company: contactToEdit.company || '',
                    status: contactToEdit.status,
                });
            } else {
                reset();
            }
        }
    }, [isOpen, contactToEdit]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = contactToEdit 
            ? `/contacts/store-or-update/${contactToEdit.id}` 
            : `/contacts/store-or-update`;
            
        post(url, {
            onSuccess: () => {
                onClose(false);
                reset();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{contactToEdit ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
                        <DialogDescription>
                            {contactToEdit ? 'Update the details for this contact.' : 'Enter the details of the new contact here.'} Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Jane Doe"
                                required
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="jane@example.com"
                                required
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="company">Company (Optional)</Label>
                            <Input
                                id="company"
                                value={data.company}
                                onChange={(e) => setData('company', e.target.value)}
                                placeholder="Acme Corp"
                            />
                            {errors.company && <p className="text-sm text-destructive">{errors.company}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select 
                                value={data.status} 
                                onValueChange={(val: 'active' | 'unsubscribed') => setData('status', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                        </div>
                    </div>

                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => onClose(false)}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save changes'}
                            </Button>
                        </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


export default function ContactsIndex({ contacts }: ContactsIndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const openCreateModal = () => {
        setEditingContact(null);
        setIsModalOpen(true);
    };

    const openEditModal = (contact: Contact) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };

    return (
        <>
            <Head title="Contacts" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Contacts</h1>
                        <p className="text-muted-foreground">Manage your subscriber lists and update their details.</p>
                    </div>
                    {/* Add New Contact Button opens Modal */}
                    <Button className="font-bold shadow-md gap-2" onClick={openCreateModal}>
                        <Plus className="w-4 h-4" /> Add New Contact
                    </Button>
                </div>

                <Card className="border-none shadow-xl bg-card">
                    <CardHeader className="pb-4">
                        <CardTitle>All Contacts</CardTitle>
                        <CardDescription>A list of all contacts stored in the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contacts && contacts.length > 0 ? (
                                        contacts.map((contact) => (
                                            <TableRow key={contact.id}>
                                                <TableCell className="font-medium">{contact.name}</TableCell>
                                                <TableCell>{contact.email}</TableCell>
                                                <TableCell>{contact.company || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={contact.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                                        {contact.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openEditModal(contact)}>
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
                                                                    router.get(`/contacts/delete/${contact.id}`);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                No contacts found. Click "Add New Contact" to create one.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ContactFormModal 
                isOpen={isModalOpen} 
                onClose={setIsModalOpen} 
                contactToEdit={editingContact} 
            />
        </>
    );
}

ContactsIndex.layout = {
    breadcrumbs,
};
