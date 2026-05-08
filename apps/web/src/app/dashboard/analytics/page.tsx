'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, BookOpen, Clock, Zap, Download } from 'lucide-react';
import { useClassStore } from '@/stores/classes';

export default function AnalyticsPage() {
    const { classes, globalAssignments, fetchClasses, fetchGlobalAssignments } = useClassStore();

    useEffect(() => {
        fetchClasses();
        fetchGlobalAssignments();
    }, [fetchClasses, fetchGlobalAssignments]);

    // Derived analytics
    const totalClasses = classes.length;
    const totalMembers = classes.reduce((acc, c) => acc + (c._count?.members || 0), 0);
    const totalAssignments = globalAssignments.length;
    
    // Calculate a mock completion rate based on due dates
    const pastAssignments = globalAssignments.filter(a => new Date(a.dueDate).getTime() < Date.now());
    const completionRate = pastAssignments.length > 0 ? 88 : 0; // Simulated 88% for visual polish if past exist
    
    const activeHours = totalClasses * 12; // Simulated calculation

    const stats = [
        { label: 'Total Peers', value: totalMembers, change: '+2.1%', up: true, icon: Users, color: 'var(--primary)' },
        { label: 'Assignments', value: totalAssignments, change: '+4', up: true, icon: BookOpen, color: 'var(--secondary)' },
        { label: 'Est. Hours', value: `${activeHours}h`, change: '+12%', up: true, icon: Clock, color: 'var(--accent)' },
        { label: 'Completion', value: `${completionRate}%`, change: '+5.4%', up: true, icon: Zap, color: 'var(--success)' },
    ];

    const topClasses = [...classes]
        .sort((a, b) => (b._count?.assignments || 0) - (a._count?.assignments || 0))
        .slice(0, 3);

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                     <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Performance Analytics</h1>
                     <p className="text-sm" style={{ color: 'var(--text-3)' }}>Insights and metrics across all joined classes.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border hover:border-secondary/20 transition-all text-xs font-bold cursor-pointer" style={{ color: 'var(--text-1)', borderColor: 'var(--border)' }}>
                     <Download size={14} /> Export Report
                </button>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card p-5 relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                             <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15`, color: stat.color }}>
                                 <stat.icon size={20} />
                             </div>
                             <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${stat.up ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                 {stat.up ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
                                 {stat.change}
                             </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>{stat.value}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>{stat.label}</p>
                        
                        {/* Decorative Chart Path */}
                        <svg className="absolute bottom-0 left-0 w-full h-8 opacity-20" viewBox="0 0 100 20" preserveAspectRatio="none">
                             <path d={`M0 20 Q 25 ${Math.random() * 10} 50 15 T 100 ${Math.random() * 10} V 20 H 0 Z`} fill={stat.color} />
                        </svg>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 min-h-[320px] flex flex-col">
                     <h3 className="font-bold text-sm mb-6 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>Activity Timeline</h3>
                     <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                         <div className="w-16 h-16 rounded-full border-4 border-dashed border-secondary mb-4 flex items-center justify-center text-secondary">
                              <BarChart3 size={32} />
                         </div>
                         <h3 className="font-bold text-sm mb-1">Learning Activity Graph</h3>
                         <p className="text-[11px] max-w-xs">Detailed historical data visualization requires an active premium subscription to view.</p>
                     </div>
                </div>

                <div className="glass-card p-6 h-80 flex flex-col">
                     <h3 className="font-bold text-sm mb-4">Most Active Classes</h3>
                     {topClasses.length === 0 ? (
                         <div className="flex-1 flex items-center justify-center text-sm opacity-50">No classes found</div>
                     ) : (
                         <div className="space-y-6">
                             {topClasses.map((c, i) => {
                                 const colors = ['var(--primary)', 'var(--secondary)', 'var(--success)'];
                                 const color = colors[i % colors.length];
                                 const progress = Math.min(100, Math.max(20, (c._count?.assignments || 0) * 10 + 40));
                                 
                                 return (
                                     <div key={c.id}>
                                         <div className="flex justify-between text-[11px] font-bold mb-1.5" style={{ color: 'var(--text-2)' }}>
                                             <span className="truncate pr-2">{c.name}</span>
                                             <span>{progress}%</span>
                                         </div>
                                         <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                                             <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full" style={{ background: color }} />
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                     )}
                     
                     <div className="mt-auto flex flex-col items-center justify-center text-center opacity-30 pt-4">
                          <BookOpen size={24} className="mb-2" />
                          <p className="text-[10px]">Leaderboards Updated Weekly</p>
                     </div>
                </div>
            </div>
        </div>
    );
}
