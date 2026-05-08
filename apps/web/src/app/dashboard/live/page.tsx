'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useClassStore, GlobalSession } from '@/stores/classes';
import { Video, Calendar, Play, User, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function GlobalLivePage() {
    const router = useRouter();
    const { globalSessions: sessions, isLoadingSessions: loading, fetchGlobalSessions } = useClassStore();

    useEffect(() => {
        fetchGlobalSessions().catch(() => toast.error('Failed to fetch live classes'));
    }, [fetchGlobalSessions]);

    const joinSession = (s: GlobalSession) => {
        router.push(`/dashboard/classes/${s.classId}/sessions/${s.id}/room`);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                    <Video className="text-secondary" /> Live Classes
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>All upcoming sessions across all your classes.</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(n => <div key={n} className="h-24 skeleton rounded-2xl" />)}
                </div>
            ) : sessions.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Video size={48} className="mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-bold mb-1">No live classes scheduled</h3>
                    <p className="text-sm opacity-60">Check back later or check individual class schedules.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {sessions.map((s) => {
                        const date = new Date(s.scheduledAt);
                        const isLive = Math.abs(Date.now() - date.getTime()) < 30 * 60000; // Within 30 mins

                        return (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-lg"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isLive ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-secondary/10 text-secondary'}`}>
                                        <Video size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm mb-1">{s.title}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>
                                            <span className="flex items-center gap-1"><BookOpen size={12} /> {s.class.name}</span>
                                            <span className="flex items-center gap-1"><User size={12} /> {s.host.name}</span>
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface" style={{ color: 'var(--secondary)' }}>
                                                <Calendar size={11} /> {date.toLocaleString()}
                                            </span>
                                            {isLive && (
                                                <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-bold uppercase tracking-wider italic">Live Now</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => joinSession(s)}
                                    className="px-6 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-105"
                                    style={{ background: isLive ? 'linear-gradient(135deg, #ef4444, #f43f5e)' : 'linear-gradient(135deg, var(--secondary), var(--accent))' }}
                                >
                                    <Play size={14} fill="currentColor" /> Join Session
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
