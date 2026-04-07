'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Video, X, Calendar, Clock, Play, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface LiveSession {
    id: string;
    title: string;
    scheduledAt: string;
    jitsiRoom: string;
    host: { id: string; name: string; avatarUrl?: string };
}

interface LiveSessionsTabProps {
    classId: string;
    isClassTeacher: boolean;
    formatDueDate: (date: string) => string;
    timeAgo: (date: string) => string;
}

export default function LiveSessionsTab({ classId, isClassTeacher, formatDueDate, timeAgo }: LiveSessionsTabProps) {
    const router = useRouter();
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduling, setScheduling] = useState(false);
    const [form, setForm] = useState({
        title: '',
        scheduledAt: '',
    });

    const fetchSessions = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/classes/${classId}/sessions`);
            if (data.success) setSessions(data.data);
        } catch { /* silent */ }
        setLoading(false);
    }, [classId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const scheduleSession = async () => {
        if (!form.title || !form.scheduledAt) return;
        setScheduling(true);
        try {
            const { data } = await api.post(`/classes/${classId}/sessions`, {
                ...form,
                scheduledAt: new Date(form.scheduledAt).toISOString(),
            });
            if (data.success) {
                setSessions((prev) => [data.data, ...prev]);
                setShowSchedule(false);
                setForm({ title: '', scheduledAt: '' });
                toast.success('Session scheduled!');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Failed to schedule session');
        }
        setScheduling(false);
    };

    const joinSession = async (sessionId: string) => {
        router.push(`/dashboard/classes/${classId}/sessions/${sessionId}/room`);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Schedule Session (Teacher) */}
            {isClassTeacher && (
                <div className="mb-4">
                    {!showSchedule ? (
                        <motion.button
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowSchedule(true)}
                            className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 cursor-pointer border-2 border-dashed transition-all"
                            style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)', background: 'var(--surface)' }}
                        >
                            <Video size={20} /> Schedule a Live Class
                        </motion.button>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold">New Live Session</h3>
                                <button onClick={() => setShowSchedule(false)} className="cursor-pointer" style={{ color: 'var(--text-3)' }}><X size={16} /></button>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>Session Title</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                        placeholder="e.g. Weekly QA Session"
                                        className="w-full px-3 py-2.5 text-sm rounded-xl border"
                                        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={form.scheduledAt}
                                        onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                                        className="w-full px-3 py-2.5 text-sm rounded-xl border"
                                        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={scheduleSession}
                                    disabled={scheduling || !form.title || !form.scheduledAt}
                                    className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, var(--secondary), var(--accent))' }}
                                >
                                    {scheduling ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Play size={16} fill="currentColor" /> Schedule Now</>}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Sessions list */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map((n) => <div key={n} className="h-32 skeleton rounded-2xl" />)}
                </div>
            ) : sessions.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-opacity-10 mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--secondary)' }}>
                        <Video size={32} style={{ color: 'var(--secondary)' }} />
                    </div>
                    <h3 className="text-base font-bold mb-1">No live sessions yet</h3>
                    <p className="text-sm px-4" style={{ color: 'var(--text-3)' }}>
                        {isClassTeacher ? 'Schedule a live class to interact with your students in real-time.' : 'There are no live classes scheduled at the moment.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((s, i) => {
                        const now = new Date().getTime();
                        const sched = new Date(s.scheduledAt).getTime();
                        const isLive = sched <= now + 600000 && sched >= now - 7200000; // 10 mins before, up to 2 hours after
                        
                        return (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="glass-card p-5 overflow-hidden relative"
                            >
                                {isLive && (
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase rounded-bl-xl flex items-center gap-1 animate-pulse">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" /> Live Now
                                    </div>
                                )}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-1)' }}>{s.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-2)' }}>
                                            <div className="flex items-center gap-1.5"><Calendar size={14} /> {formatDueDate(s.scheduledAt)}</div>
                                            <div className="flex items-center gap-1.5"><Clock size={14} /> {timeAgo(s.scheduledAt)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isClassTeacher && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to stop and remove this session?')) {
                                                        api.delete(`/classes/${classId}/sessions/${s.id}`)
                                                            .then(() => {
                                                                setSessions(prev => prev.filter(x => x.id !== s.id));
                                                                toast.success('Session stopped');
                                                            })
                                                            .catch(() => toast.error('Failed to stop session'));
                                                    }
                                                }}
                                                className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:bg-opacity-10 transition-colors border border-transparent hover:border-red-500/20"
                                                title="Stop Meeting"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => joinSession(s.id)}
                                            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                                            style={{
                                                background: isLive ? 'linear-gradient(135deg, #ef4444, #f43f5e)' : 'linear-gradient(135deg, var(--secondary), var(--accent))',
                                                boxShadow: isLive ? '0 4px 12px rgba(239,68,68,0.3)' : 'none'
                                            }}
                                        >
                                            <Play size={16} fill="currentColor" /> {isLive ? 'Join Live Now' : 'Join Session'}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Jitsi Note */}
            <div className="mt-8 p-4 rounded-2xl bg-opacity-5 flex gap-3 border" style={{ background: 'var(--info)', borderColor: 'var(--info-bg)' }}>
                <AlertCircle size={20} className="shrink-0" style={{ color: 'var(--info)' }} />
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
                    <p className="font-bold mb-1" style={{ color: 'var(--info)' }}>About Live Classes</p>
                    Meetrix uses Jitsi Meet for high-quality, encrypted video calls. No additional software is required. Classes will open in a new browser tab.
                </div>
            </div>
        </motion.div>
    );
}
