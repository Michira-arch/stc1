import React from 'react';
import { NeuCard, NeuButton } from '../components/Neu';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react';

const data = [
    { name: 'Mon', earnings: 1200 },
    { name: 'Tue', earnings: 1900 },
    { name: 'Wed', earnings: 800 },
    { name: 'Thu', earnings: 2500 },
    { name: 'Fri', earnings: 4200 },
    { name: 'Sat', earnings: 5500 },
    { name: 'Sun', earnings: 3000 },
];

const Dashboard: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <header className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Welcome back, Alex</h2>
                <p className="text-slate-500 dark:text-slate-400">Here's what's happening in your hustle corner.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <NeuCard className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Earnings</p>
                        <h3 className="text-2xl font-bold text-emerald-500">KSh 45,300</h3>
                    </div>
                    <div className="p-3 rounded-full bg-ceramic dark:bg-obsidian shadow-inner text-emerald-500">
                        <span className="font-bold text-xl">KSh</span>
                    </div>
                </NeuCard>

                <NeuCard className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Active Gigs</p>
                        <h3 className="text-2xl font-bold text-blue-500">4</h3>
                    </div>
                    <div className="p-3 rounded-full bg-ceramic dark:bg-obsidian shadow-inner text-blue-500">
                        <Activity size={24} />
                    </div>
                </NeuCard>

                <NeuCard className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Hustle Score</p>
                        <h3 className="text-2xl font-bold text-purple-500">Top 5%</h3>
                    </div>
                    <div className="p-3 rounded-full bg-ceramic dark:bg-obsidian shadow-inner text-purple-500">
                        <TrendingUp size={24} />
                    </div>
                </NeuCard>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <NeuCard className="p-6 h-80 flex flex-col">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">Weekly Revenue (KSh)</h3>
                    <div className="flex-1 min-h-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                    formatter={(value: number) => [`KSh ${value}`, 'Earnings']}
                                />
                                <Bar dataKey="earnings" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </NeuCard>

                <NeuCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">Upcoming Gigs</h3>
                    <div className="space-y-4">
                        {[
                            { title: "Hold spot in FinAid line", time: "2:00 PM Today", pay: "KSh 2,000" },
                            { title: "Deliver Matcha to Library", time: "4:30 PM Today", pay: "KSh 650" },
                            { title: "Fix Wifi - Dorm 4B", time: "10:00 AM Tmrw", pay: "KSh 3,250" },
                        ].map((gig, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-700 dark:text-slate-200">{gig.title}</p>
                                        <p className="text-xs text-slate-500">{gig.time}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-emerald-500">{gig.pay}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-center">
                        <NeuButton className="w-full text-sm py-2">View Schedule</NeuButton>
                    </div>
                </NeuCard>
            </div>
        </div>
    );
};

export default Dashboard;
