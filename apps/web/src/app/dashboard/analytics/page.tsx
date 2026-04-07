'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Users, BookOpen, Clock, Zap, Download } from 'lucide-react';

export default function AnalyticsPlaceholder() {
    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-8 flex items-center justify-between">
                <div>
                     <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Performance Analytics</h1>
                     <p className="text-sm" style={{ color: 'var(--text-3)' }}>Insights and metrics across all joined classes.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-transparent hover:border-secondary/20 transition-all text-xs font-bold" style={{ color: 'var(--text-1)' }}>
                     <Download size={14} /> Export Report
                </button>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Attendance', value: '92.4%', change: '+2.1%', up: true, icon: Users, color: 'var(--primary)' },
                    { label: 'Avg. Marks', value: '78.5', change: '-3.2%', up: false, icon: BarChart3, color: 'var(--secondary)' },
                    { label: 'Total Hours', value: '142h', change: '+12%', up: true, icon: Clock, color: 'var(--accent)' },
                    { label: 'Completion', value: '88%', change: '+5.4%', up: true, icon: Zap, color: 'var(--success)' },
                ].map((stat, i) => (
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
                                 {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
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
                <div className="lg:col-span-2 glass-card p-6 h-80 flex flex-col items-center justify-center text-center opacity-40">
                     <div className="w-16 h-16 rounded-full border-4 border-dashed border-secondary mb-4 flex items-center justify-center text-secondary">
                          <BarChart3 size={32} />
                     </div>
                     <h3 className="font-bold text-sm mb-1">Learning Activity Graph</h3>
                     <p className="text-[11px] max-w-xs">Detailed historical data visualization is being integrated with Chart.js</p>
                </div>

                <div className="glass-card p-6 h-80 flex flex-col">
                     <h3 className="font-bold text-sm mb-4">Class Performance</h3>
                     <div className="space-y-4">
                         {[
                             { name: 'Physics 101', progress: 85, color: 'var(--primary)' },
                             { name: 'Applied Math', progress: 62, color: 'var(--secondary)' },
                             { name: 'Modern Chem', progress: 91, color: 'var(--success)' },
                         ].map((c, i) => (
                             <div key={i}>
                                 <div className="flex justify-between text-[11px] font-bold mb-1.5" style={{ color: 'var(--text-2)' }}>
                                     <span>{c.name}</span>
                                     <span>{c.progress}%</span>
                                 </div>
                                 <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                                     <motion.div initial={{ width: 0 }} animate={{ width: `${c.progress}%` }} className="h-full rounded-full" style={{ background: c.color }} />
                                 </div>
                             </div>
                         ))}
                     </div>
                     <div className="mt-auto flex flex-col items-center justify-center text-center opacity-30">
                          <BookOpen size={24} className="mb-2" />
                          <p className="text-[10px]">Leaderboards Updated Weekly</p>
                     </div>
                </div>
            </div>
        </div>
    );
}
