import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Send, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContactList {
    id: number;
    name: string;
}

interface Campaign {
    id: number;
    title: string;
    subject: string;
    body: string;
    status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed';
    scheduled_at: string | null;
    recipients_count: number;
    contact_lists: ContactList[];
}

interface CampaignsIndexProps {
    campaigns: Campaign[];
    availableLists: ContactList[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Campaigns', href: '/campaigns/index' },
];

export function CampaignFormModal({ 
    isOpen, 
    onClose, 
    campaignToEdit, 
    availableLists 
}: { 
    isOpen: boolean; 
    onClose: (isOpen: boolean) => void; 
    campaignToEdit: Campaign | null;
    availableLists: ContactList[];
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        subject: '',
        body: '',
        contact_list_ids: [] as number[],
        scheduled_at: '',
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (campaignToEdit) {
                setData({
                    title: campaignToEdit.title,
                    subject: campaignToEdit.subject,
                    body: campaignToEdit.body,
                    contact_list_ids: campaignToEdit.contact_lists.map(l => l.id),
                    scheduled_at: campaignToEdit.scheduled_at ? new Date(campaignToEdit.scheduled_at).toISOString().slice(0, 16) : '',
                });
            } else {
                reset();
            }
        }
    }, [isOpen, campaignToEdit]);

    const toggleListSelection = (listId: number) => {
        setData('contact_list_ids', data.contact_list_ids.includes(listId) 
            ? data.contact_list_ids.filter(id => id !== listId)
            : [...data.contact_list_ids, listId]
        );
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = campaignToEdit 
            ? `/campaigns/store-or-update/${campaignToEdit.id}` 
            : `/campaigns/store-or-update`;
            
        post(url, {
            onSuccess: () => {
                onClose(false);
                reset();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <form onSubmit={onSubmit} className="flex flex-col h-full overflow-hidden">
                    <DialogHeader className="shrink-0">
                        <DialogTitle>{campaignToEdit ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
                        <DialogDescription>
                            {campaignToEdit ? 'Update the details for this campaign.' : 'Draft a new email sweep here.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <ScrollArea className="flex-1 overflow-y-auto px-1 py-4">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Campaign Name (Internal)</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Summer Promo 2026"
                                    required
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="subject">Email Subject Line</Label>
                                <Input
                                    id="subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder="You won't believe these deals..."
                                    required
                                />
                                {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="body">Email Body (HTML)</Label>
                                <Textarea
                                    id="body"
                                    value={data.body}
                                    onChange={(e) => setData('body', e.target.value)}
                                    placeholder="<p>Hello valued customer,</p>"
                                    rows={6}
                                    className="font-mono text-xs"
                                   
                                />
                                {errors.body && <p className="text-sm text-destructive">{errors.body}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="scheduled_at">Scheduled At (Optional)</Label>
                                <Input
                                    id="scheduled_at"
                                    type="datetime-local"
                                    value={data.scheduled_at}
                                    onChange={(e) => setData('scheduled_at', e.target.value)}
                                />
                                {errors.scheduled_at && <p className="text-sm text-destructive">{errors.scheduled_at}</p>}
                                <p className="text-xs text-muted-foreground">Leave empty to assume immediately deployable state.</p>
                            </div>

                            <div className="grid gap-2">
                                <Label>Target Contact Lists</Label>
                                <div className="border rounded-md divide-y overflow-hidden max-h-48 overflow-y-auto">
                                    {availableLists.length === 0 ? (
                                        <p className="p-4 text-sm text-muted-foreground">No contact lists available. Create one first!</p>
                                    ) : (
                                        availableLists.map(list => (
                                            <label 
                                                key={list.id} 
                                                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-muted/30 ${data.contact_list_ids.includes(list.id) ? 'bg-primary/5' : ''}`}
                                            >
                                                <Checkbox 
                                                    checked={data.contact_list_ids.includes(list.id)}
                                                    onCheckedChange={() => toggleListSelection(list.id)}
                                                />
                                                <span className="text-sm font-medium">{list.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {errors.contact_list_ids && <p className="text-sm text-destructive">You must select at least one target list.</p>}
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="shrink-0 pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => onClose(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || data.contact_list_ids.length === 0}>
                            {processing ? 'Saving...' : 'Save Campaign Draft'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const getStatusVitals = (status: string) => {
    switch(status) {
        case 'draft': return { color: 'default', icon: <FileText className="w-3 h-3"/> };
        case 'queued': return { color: 'secondary', icon: <Clock className="w-3 h-3"/> };
        case 'processing': return { color: 'primary', icon: <Clock className="w-3 h-3 animate-spin"/> }; // Wait, variant "primary" is not standard badge variant but maybe default is
        case 'completed': return { color: 'outline', icon: <CheckCircle2 className="w-3 h-3 text-green-500"/>, text: "text-green-600 border-green-200 bg-green-50" };
        case 'failed': return { color: 'destructive', icon: <XCircle className="w-3 h-3"/> };
        default: return { color: 'outline', icon: <FileText className="w-3 h-3"/> };
    }
}

export default function CampaignsIndex({ campaigns, availableLists }: CampaignsIndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

    const openCreateModal = () => {
        setEditingCampaign(null);
        setIsModalOpen(true);
    };

    const openEditModal = (campaign: Campaign) => {
        if (campaign.status !== 'draft' && campaign.status !== 'failed') {
            alert("Only draft or failed campaigns can be edited.");
            return;
        }
        setEditingCampaign(campaign);
        setIsModalOpen(true);
    };

    const handleDelete = (campaign: Campaign) => {
        if (window.confirm(`Are you sure you want to delete campaign "${campaign.title}"?`)) {
            router.get(`/campaigns/delete/${campaign.id}`);
        }
    };

    return (
        <>
            <Head title="Campaigns" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Campaigns</h1>
                        <p className="text-muted-foreground">Draft and orchestrate your bulk email sends seamlessly.</p>
                    </div>
                    <Button className="font-bold shadow-md gap-2" onClick={openCreateModal}>
                        <Plus className="w-4 h-4" /> Create Draft
                    </Button>
                </div>

                <Card className="border-none shadow-xl bg-card">
                    <CardHeader className="pb-4">
                        <CardTitle>All Campaigns</CardTitle>
                        <CardDescription>Track status, delivery targets, and performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Campaign Name</TableHead>
                                        <TableHead>Target Lists</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {campaigns && campaigns.length > 0 ? (
                                        campaigns.map((campaign) => {
                                            const vitals = getStatusVitals(campaign.status);
                                            return (
                                                <TableRow key={campaign.id}>
                                                    <TableCell className="font-medium">
                                                        {campaign.title}
                                                        {campaign.recipients_count > 0 && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {campaign.recipients_count} specific recipients
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {campaign.contact_lists.length > 0 
                                                                ? campaign.contact_lists.map(l => (
                                                                    <Badge key={l.id} variant="secondary" className="text-[10px] py-0">
                                                                        {l.name}
                                                                    </Badge>
                                                                )) 
                                                                : <span className="text-muted-foreground italic text-xs">No lists</span>
                                                            }
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={vitals.color as any} className={`capitalize flex inline-flex items-center gap-1.5 w-fit ${vitals.text || ''}`}>
                                                            {vitals.icon} {campaign.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate" title={campaign.subject}>
                                                        {campaign.subject}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={`/campaigns/show/${campaign.id}`}>
                                                                <Button variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-primary/10">
                                                                    <Send className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => openEditModal(campaign)}
                                                                disabled={campaign.status !== 'draft' && campaign.status !== 'failed'}
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDelete(campaign)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                No campaigns initiated yet. Click "Create Draft" to begin.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <CampaignFormModal 
                isOpen={isModalOpen} 
                onClose={setIsModalOpen} 
                campaignToEdit={editingCampaign}
                availableLists={availableLists}
            />
        </>
    );
}

CampaignsIndex.layout = {
    breadcrumbs,
};
