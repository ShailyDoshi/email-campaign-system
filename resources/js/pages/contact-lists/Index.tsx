import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Eye, Users } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ContactList {
    id: number;
    name: string;
    description: string | null;
    contacts_count: number;
}

interface ContactListsIndexProps {
    lists: ContactList[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Contact Lists', href: '/contact-lists/index' },
];

export interface ContactListFormModalProps {
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
    listToEdit: ContactList | null;
}

export function ContactListFormModal({ isOpen, onClose, listToEdit }: ContactListFormModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (listToEdit) {
                setData({
                    name: listToEdit.name,
                    description: listToEdit.description || '',
                });
            } else {
                reset();
            }
        }
    }, [isOpen, listToEdit]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = listToEdit 
            ? `/contact-lists/store-or-update/${listToEdit.id}` 
            : `/contact-lists/store-or-update`;
            
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
                        <DialogTitle>{listToEdit ? 'Edit Contact List' : 'Create Contact List'}</DialogTitle>
                        <DialogDescription>
                            {listToEdit ? 'Update the details for this list.' : 'Enter the details of the new contact list here.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">List Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Newsletter Subscribers"
                                required
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="What is this list for?"
                                rows={3}
                            />
                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
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


export default function ContactListsIndex({ lists }: ContactListsIndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingList, setEditingList] = useState<ContactList | null>(null);

    const openCreateModal = () => {
        setEditingList(null);
        setIsModalOpen(true);
    };

    const openEditModal = (list: ContactList) => {
        setEditingList(list);
        setIsModalOpen(true);
    };

    const handleDelete = (list: ContactList) => {
        if (window.confirm(`Are you sure you want to delete "${list.name}"?`)) {
            router.get(`/contact-lists/delete/${list.id}`);
        }
    };

    return (
        <>
            <Head title="Contact Lists" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Contact Lists</h1>
                        <p className="text-muted-foreground">{lists.length} lists total. Organize your subscribers into specific targets.</p>
                    </div>
                    <Button className="font-bold shadow-md gap-2" onClick={openCreateModal}>
                        <Plus className="w-4 h-4" /> Create List
                    </Button>
                </div>

                {lists.length === 0 ? (
                    <Card className="border-none shadow-xl bg-card">
                        <CardContent className="flex flex-col items-center justify-center py-20">
                            <div className="bg-primary/10 rounded-full p-6 mb-4">
                                <Users className="w-12 h-12 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No contact lists yet</h3>
                            <p className="text-muted-foreground mb-6 text-center max-w-sm">
                                Create your first list to start organizing contacts and preparing for your email campaigns!
                            </p>
                            <Button onClick={openCreateModal}>Create First List</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lists.map(list => (
                            <Card key={list.id} className="border-none shadow-xl bg-card hover:shadow-2xl transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-primary" />
                                        </div>
                                        <Badge variant="secondary" className="font-semibold px-3 py-1">
                                            {list.contacts_count} contacts
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl">{list.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 min-h-[40px]">
                                        {list.description || <span className="italic text-muted-foreground/50">No description provided</span>}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="pt-2 flex gap-2">
                                    <Link href={`/contact-lists/show/${list.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                                            <Eye className="w-4 h-4" /> View
                                        </Button>
                                    </Link>
                                    <Button variant="outline" className="flex-1 gap-2" onClick={() => openEditModal(list)}>
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                                        onClick={() => handleDelete(list)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <ContactListFormModal 
                isOpen={isModalOpen} 
                onClose={setIsModalOpen} 
                listToEdit={editingList} 
            />
        </>
    );
}

ContactListsIndex.layout = {
    breadcrumbs,
};
