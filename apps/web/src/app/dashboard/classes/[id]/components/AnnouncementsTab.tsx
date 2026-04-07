'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Pin, Send } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Announcement {
    id: string;
    content: string;
    pinned: boolean;
    createdAt: string;
    author: { id: string; name: string; avatarUrl?: string };
}

interface AnnouncementsTabProps {
    classId: string;
    isClassTeacher: boolean;
    user: any;
    Avatar: React.ElementType;
    timeAgo: (date: string) => string;
}

export default function AnnouncementsTab({ classId, isClassTeacher, user, Avatar, timeAgo }: AnnouncementsTabProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [newAnnouncement, setNewAnnouncement] = useState('');
    const [posting, setPosting] = useState(false);

    const fetchAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/classes/${classId}/announcements`);
            if (data.success) setAnnouncements(data.data);
        } catch { /* silent */ }
        setLoading(false);
    }, [classId]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const postAnnouncement = async () => {
        if (!newAnnouncement.trim()) return;
        setPosting(true);
        try {
            const { data } = await api.post(`/classes/${classId}/announcements`, { content: newAnnouncement.trim() });
            if (data.success) {
                setAnnouncements((prev) => [data.data, ...prev]);
                setNewAnnouncement('');
                toast.success('Announcement posted!');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Failed to post announcement');
        }
        setPosting(false);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Compose Box (Teacher) */}
            {isClassTeacher && (
                <div className="glass-card p-4 mb-4">
                    <div className="flex gap-3">
                        <Avatar src={user?.avatarUrl} name={user?.name || ''} size={10} />
                        <div className="flex-1">
                            <textarea
                                value={newAnnouncement}
                                onChange={(e) => setNewAnnouncement(e.target.value)}
                                placeholder="Share an announcement with your class..."
                                rows={2}
                                className="w-full px-3 py-2.5 text-sm rounded-xl border resize-none"
                                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                            />
                            <div className="flex justify-end mt-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={postAnnouncement}
                                    disabled={posting || !newAnnouncement.trim()}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                                >
                                    {posting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={13} /> Post</>}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Announcements Feed */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((n) => <div key={n} className="h-24 skeleton rounded-2xl" />)}
                </div>
            ) : announcements.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Megaphone size={32} className="mx-auto mb-3" style={{ color: 'var(--text-3)' }} />
                    <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>No announcements yet</h3>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                        {isClassTeacher ? 'Share updates with your class above.' : 'Your teacher will post announcements here.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {announcements.map((a, i) => (
                        <motion.div
                            key={a.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="glass-card p-4"
                        >
                            <div className="flex items-start gap-3">
                                <Avatar src={a.author.avatarUrl} name={a.author.name} size={9} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{a.author.name}</span>
                                        {a.pinned && <Pin size={11} style={{ color: 'var(--warning)' }} />}
                                        <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{timeAgo(a.createdAt)}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-2)' }}>{a.content}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
