import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Send, CheckCircle, BarChart3, ArrowRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardProps {
    stats: {
        totalContacts: number;
        activeContacts: number;
        campaignsSent: number;
        successRate: string;
    };
    recentCampaigns: any[];
}

export default function Dashboard({ stats, recentCampaigns }: DashboardProps) {
    return (
        <>
            <Head title="System Overview" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight">System Overview</h1>
                    <p className="text-muted-foreground font-medium">Monitoring your email ecosystem and campaign performance.</p>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border shadow-sm border-blue-100 bg-blue-50/30">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <Users className="w-5 h-5 text-blue-600" />
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold tracking-wider">Contacts</Badge>
                            </div>
                            <h3 className="text-3xl font-black text-blue-900">{stats.totalContacts}</h3>
                            <p className="text-blue-600/70 text-xs font-semibold mt-1">{stats.activeContacts} active subscribers</p>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm border-indigo-100 bg-indigo-50/30">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <Send className="w-5 h-5 text-indigo-600" />
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 text-[10px] uppercase font-bold tracking-wider">Campaigns</Badge>
                            </div>
                            <h3 className="text-3xl font-black text-indigo-900">{stats.campaignsSent}</h3>
                            <p className="text-indigo-600/70 text-xs font-semibold mt-1">Successfully completed</p>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm border-emerald-100 bg-emerald-50/30">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold tracking-wider">Health</Badge>
                            </div>
                            <h3 className="text-3xl font-black text-emerald-900">{stats.successRate}</h3>
                            <p className="text-emerald-600/70 text-xs font-semibold mt-1">Delivery success rate</p>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm border-slate-100 bg-slate-50/30">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <BarChart3 className="w-5 h-5 text-slate-600" />
                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold tracking-wider">Activity</Badge>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900">Live</h3>
                            <p className="text-slate-600/70 text-xs font-semibold mt-1">Queue worker active</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Campaigns Table */}
                    <Card className="lg:col-span-2 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
                            <div>
                                <CardTitle className="text-lg font-bold">Recent History</CardTitle>
                                <CardDescription>Last 5 campaigns dispatched to the network.</CardDescription>
                            </div>
                            <Link href="/campaigns/index">
                                <Button variant="ghost" size="sm" className="gap-2 text-primary font-bold">
                                    View All <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {recentCampaigns.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground italic text-sm">No campaigns recorded yet.</div>
                                ) : (
                                    recentCampaigns.map(campaign => (
                                        <div key={campaign.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-bold text-slate-900 leading-none">{campaign.title}</p>
                                                <p className="text-xs text-muted-foreground font-medium">Subject: {campaign.subject}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline" className="capitalize text-[10px] font-bold tracking-wide">{campaign.status}</Badge>
                                                <Link href={`/campaigns/show/${campaign.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                        <ExternalLink className="w-4 h-4 text-primary" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Launch / Shortcuts */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <Card className="shadow-sm border-primary/20 bg-primary/5">
                            <CardHeader className="pb-3 text-center">
                                <CardTitle className="text-primary tracking-tight font-black underline decoration-primary/30 underline-offset-4">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Link href="/campaigns/index">
                                    <Button className="w-full justify-start gap-3 bg-primary hover:bg-primary/90 font-bold shadow-md">
                                        <div className="bg-white/20 p-1 rounded-md"><Send className="w-4 h-4" /></div>
                                        New Campaign
                                    </Button>
                                </Link>
                                <Link href="/contacts/index">
                                    <Button variant="outline" className="w-full justify-start gap-3 border-primary/20 font-bold">
                                        <div className="bg-primary/10 p-1 rounded-md text-primary"><Users className="w-4 h-4" /></div>
                                        Import Contacts
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <div className="p-6 rounded-xl bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                           <div className="relative z-10">
                                <h4 className="font-black text-xl mb-1 italic tracking-tighter uppercase">Pro Sending Tips</h4>
                                <p className="text-slate-400 text-xs mb-4 font-medium leading-relaxed">Always verify your contact lists and subject lines before dispatching dedicated campaign queues.</p>
                                <div className="text-[10px] font-black tracking-widest text-primary uppercase opacity-80">Campaign Logic v1.2</div>
                           </div>
                           <BarChart3 className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 group-hover:text-primary/10 transition-all rotate-12" />
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '#' },
    ],
};
