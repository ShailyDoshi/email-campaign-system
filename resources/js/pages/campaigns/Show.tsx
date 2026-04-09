import { useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, RefreshCcw, Edit2, Play, Users, CheckCircle2, XCircle, AlertCircle, Clock, Info } from 'lucide-react';

interface Contact {
    id: number;
    name: string;
    email: string;
}

interface CampaignRecipient {
    id: number;
    contact: Contact;
    status: 'pending' | 'queued' | 'sent' | 'failed' | 'skipped';
    failure_reason: string | null;
    sent_at: string | null;
}

interface CampaignSendLog {
    id: number;
    event: 'queued' | 'sent' | 'failed' | 'skipped';
    message: string;
    recipient: CampaignRecipient;
}

interface Campaign {
    id: number;
    title: string;
    subject: string;
    status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed';
    queue_name: string | null;
    created_at: string;
    scheduled_at: string | null;
    contact_lists: { name: string }[];
    recipients: CampaignRecipient[];
}

interface CampaignsShowProps {
    campaign: Campaign;
    stats: {
        total: number;
        sent: number;
        failed: number;
        skipped: number;
        pending: number;
    };
    recentLogs: CampaignSendLog[];
    potentialContacts: Contact[];
}

const getStatusVitals = (status: string) => {
    switch(status) {
        case 'draft': return { variant: 'default', icon: <Info className="w-3 h-3"/>, bg: 'bg-muted text-muted-foreground' };
        case 'queued': return { variant: 'secondary', icon: <Clock className="w-3 h-3"/>, bg: 'bg-blue-100 text-blue-800 border-blue-200' };
        case 'processing': return { variant: 'default', icon: <RefreshCcw className="w-3 h-3 animate-spin"/>, bg: 'bg-blue-600 text-white' };
        case 'completed': return { variant: 'outline', icon: <CheckCircle2 className="w-3 h-3 text-green-600"/>, bg: 'bg-green-100 border-green-300 text-green-800' };
        case 'failed': return { variant: 'destructive', icon: <XCircle className="w-3 h-3"/>, bg: 'bg-destructive/10 text-destructive border-destructive/20' };
        case 'skipped': return { variant: 'outline', icon: <AlertCircle className="w-3 h-3 text-amber-600"/>, bg: 'bg-amber-100 border-amber-300 text-amber-800' };
        case 'pending': return { variant: 'secondary', icon: <Clock className="w-3 h-3"/>, bg: 'bg-slate-100 text-slate-700' };
        case 'sent': return { variant: 'outline', icon: <CheckCircle2 className="w-3 h-3 text-emerald-600"/>, bg: 'bg-emerald-100 border-emerald-300 text-emerald-800' };
        default: return { variant: 'outline', icon: <Info className="w-3 h-3"/>, bg: 'bg-gray-100 text-gray-800' };
    }
}

export default function CampaignsShow({ campaign, stats, recentLogs, potentialContacts }: CampaignsShowProps) {
    const { props } = usePage();
    const flash = (props as any).flash ?? {};
    const campaignVitals = getStatusVitals(campaign.status);

    // Auto-refresh the page every 3 seconds if the campaign is currently sending
    useEffect(() => {
        let interval: any;
        
        if (campaign.status === 'queued' || campaign.status === 'processing') {
            interval = setInterval(() => {
                router.reload({ 
                    only: ['campaign', 'stats', 'recentLogs'],
                    preserveScroll: true 
                });
            }, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [campaign.status]);

    const sendCampaign = () => {
        if (window.confirm('Are you absolutely sure you want to lock this campaign and queue emails to all targeted recipients?')) {
            router.post(`/campaigns/${campaign.id}/send`);
        }
    };

    const retryCampaign = () => {
        if (window.confirm('This will immediately retry all failed recipients. Proceed?')) {
            router.post(`/campaigns/${campaign.id}/retry`);
        }
    };

    return (
        <>
            <Head title={campaign.title} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 max-w-7xl mx-auto w-full">
                
                {/* Flash Alerts */}
                {flash.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-sm">{flash.success}</span>
                    </div>
                )}
                {flash.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-sm">{flash.error}</span>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <Link href="/campaigns/index" className="text-muted-foreground hover:text-primary mb-2 flex items-center gap-1 text-sm transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
                        </Link>
                        <div className="flex items-center gap-3 mt-1">
                            <h1 className="text-3xl font-black tracking-tight">{campaign.title}</h1>
                            <Badge className={`capitalize flex gap-1.5 items-center px-3 py-1 ${campaignVitals.bg}`}>
                                {campaignVitals.icon} {campaign.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-2 max-w-2xl font-medium">
                            Subject Line: <span className="text-foreground">"{campaign.subject}"</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {(campaign.status === 'draft' || campaign.status === 'failed') && (
                            <Link href={`/campaigns/index`}>
                                <Button variant="outline" className="gap-2 shadow-sm">
                                    <Edit2 className="w-4 h-4" /> Edit Campaign
                                </Button>
                            </Link>
                        )}
                        {(campaign.status === 'draft' || campaign.status === 'failed') && (
                            <Button onClick={sendCampaign} className="gap-2 shadow-lg shadow-primary/20">
                                <Send className="w-4 h-4" /> Dispatch Emails
                            </Button>
                        )}
                        {campaign.status === 'completed' && stats.failed > 0 && (
                            <Button onClick={retryCampaign} variant="outline" className="gap-2 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 shadow-sm">
                                <RefreshCcw className="w-4 h-4" /> Retry Failed
                            </Button>
                        )}
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { label: 'Total Targeted', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
                        { label: 'Successfully Sent', value: stats.sent, icon: Send, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                        { label: 'Delivery Failed', value: stats.failed, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
                        { label: 'Skipped/Unsub', value: stats.skipped, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
                        { label: 'Pending Processing', value: stats.pending, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
                    ].map(stat => (
                        <Card key={stat.label} className={`border ${stat.bg} shadow-sm overflow-hidden`}>
                            <CardContent className="p-4 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start mb-2">
                                    <p className={`font-semibold text-xs tracking-wide uppercase ${stat.color} opacity-80`}>{stat.label}</p>
                                    <stat.icon className={`w-4 h-4 ${stat.color} opacity-50`} />
                                </div>
                                <h3 className={`text-3xl font-black ${stat.color}`}>
                                    {stat.value}
                                </h3>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Meta Details */}
                    <Card className="lg:col-span-1 shadow-sm h-fit">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <CardTitle className="text-lg">Campaign Meta</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 divide-y">
                            <div className="flex justify-between items-center p-4">
                                <span className="text-sm text-muted-foreground font-medium">Dedicated Queue</span>
                                {campaign.queue_name ? (
                                    <code className="text-xs bg-muted px-2 py-1 rounded border font-bold text-primary">{campaign.queue_name}</code>
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">Not dispatched</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 p-4">
                                <span className="text-sm text-muted-foreground font-medium">Targeted Contact Lists</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {campaign.contact_lists?.length > 0 ? campaign.contact_lists.map((l, i) => (
                                        <Badge variant="secondary" key={i} className="text-xs whitespace-nowrap">{l.name}</Badge>
                                    )) : <span className="text-xs text-muted-foreground italic">No lists assigned</span>}
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-4">
                                <span className="text-sm text-muted-foreground font-medium">Created On</span>
                                <span className="text-sm font-semibold">{new Date(campaign.created_at).toLocaleDateString()}</span>
                            </div>
                            {campaign.scheduled_at && (
                                <div className="flex justify-between items-center p-4 bg-primary/5">
                                    <span className="text-sm text-primary font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Scheduled For</span>
                                    <span className="text-sm font-bold text-primary">{new Date(campaign.scheduled_at).toLocaleString()}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Live Processing Logs */}
                    <Card className="lg:col-span-2 shadow-sm flex flex-col h-[350px]">
                        <CardHeader className="bg-muted/30 border-b pb-4 shrink-0 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Play className="w-4 h-4 text-primary" /> Live Event Stream
                            </CardTitle>
                            {recentLogs.length > 0 && <Badge variant="secondary" className="font-mono text-[10px]">LATEST {recentLogs.length}</Badge>}
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-hidden relative">
                            <ScrollArea className="h-full">
                                {recentLogs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-10 h-full text-center text-muted-foreground opacity-70">
                                        <Play className="w-8 h-8 mb-3 opacity-20" />
                                        <p className="text-sm font-medium">Awaiting Dispatch</p>
                                        <p className="text-xs">Logs will appear here in real-time as jobs process.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-muted/50">
                                        {recentLogs.map((log) => {
                                            const logVitals = getStatusVitals(log.event);
                                            return (
                                                <div key={log.id} className="flex items-center gap-4 p-3 hover:bg-muted/30 transition-colors">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${logVitals.bg}`}>
                                                        {logVitals.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <p className="text-sm font-bold truncate">{log.recipient?.contact?.name}</p>
                                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${logVitals.bg}`}>
                                                                {log.event}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate" title={log.message}>
                                                            {log.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Complete Recipient Manifest */}
                <Card className="shadow-sm">
                    <CardHeader className="bg-muted/30 border-b pb-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Recipient Manifest</CardTitle>
                            <CardDescription>Final ledger of targeted contacts and their delivery status.</CardDescription>
                        </div>
                        <Badge variant="outline" className="font-bold">{stats.total} Total</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                                        <TableHead className="font-semibold px-6 w-[25%] text-xs uppercase tracking-wider text-muted-foreground">Contact</TableHead>
                                        <TableHead className="font-semibold w-[25%] text-xs uppercase tracking-wider text-muted-foreground">Email</TableHead>
                                        <TableHead className="font-semibold w-[15%] text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                                        <TableHead className="font-semibold w-[20%] text-xs uppercase tracking-wider text-muted-foreground">Diagnostic</TableHead>
                                        <TableHead className="font-semibold px-6 w-[15%] text-right text-xs uppercase tracking-wider text-muted-foreground">Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {campaign.recipients.length === 0 && potentialContacts.length > 0 ? (
                                        potentialContacts.map(contact => (
                                            <TableRow key={`potential-${contact.id}`} className="hover:bg-muted/30 transition-colors bg-blue-50/20">
                                                <TableCell className="font-bold px-6">{contact.name}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm font-mono">{contact.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize shadow-sm gap-1.5 bg-slate-100 text-slate-700">
                                                        <Clock className="w-3 h-3" /> Targeted 
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground italic">
                                                    Awaiting dispatch...
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-muted-foreground px-6 font-mono opacity-40">
                                                    —
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : campaign.recipients.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center opacity-70">
                                                    <Users className="w-10 h-10 mb-3 opacity-20" />
                                                    <p className="font-medium text-base">Manifest is empty</p>
                                                    <p className="text-sm">Click "Dispatch Emails" to map contact lists into recipient ledgers.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        campaign.recipients.map(recipient => {
                                            const recVitals = getStatusVitals(recipient.status);
                                            return (
                                                <TableRow key={recipient.id} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="font-bold px-6">{recipient.contact?.name}</TableCell>
                                                    <TableCell className="text-muted-foreground text-sm font-mono">{recipient.contact?.email}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`capitalize shadow-sm gap-1.5 ${recVitals.bg}`}>
                                                            {recVitals.icon} {recipient.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]" title={recipient.failure_reason || ''}>
                                                        {recipient.failure_reason || <span className="opacity-40">—</span>}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs text-muted-foreground px-6 font-mono">
                                                        {recipient.sent_at ? new Date(recipient.sent_at).toLocaleString() : <span className="opacity-40">—</span>}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CampaignsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Campaigns', href: '/campaigns/index' },
        { title: 'Campaign Dashboard', href: '#' },
    ]
};
