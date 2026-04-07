'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, X, Calendar, Users, Clock, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Assignment {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    maxMarks: number;
    status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
    createdAt: string;
    teacher: { id: string; name: string; avatarUrl?: string };
    _count: { submissions: number };
}

interface AssignmentsTabProps {
    classId: string;
    isClassTeacher: boolean;
    formatDueDate: (date: string) => string;
    dueDateStatus: (date: string) => { label: string; color: string; bg: string };
    timeAgo: (date: string) => string;
}

export default function AssignmentsTab({ classId, isClassTeacher, formatDueDate, dueDateStatus, timeAgo }: AssignmentsTabProps) {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        dueDate: '',
        maxMarks: 100,
    });

    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/classes/${classId}/assignments`);
            if (data.success) setAssignments(data.data);
        } catch { /* silent */ }
        setLoading(false);
    }, [classId]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const createAssignment = async () => {
        if (!form.title || !form.dueDate) return;
        setCreating(true);
        try {
            const { data } = await api.post(`/classes/${classId}/assignments`, {
                ...form,
                dueDate: new Date(form.dueDate).toISOString(),
            });
            if (data.success) {
                setAssignments((prev) => [data.data, ...prev]);
                setShowCreate(false);
                setForm({ title: '', description: '', dueDate: '', maxMarks: 100 });
                toast.success('Assignment created!');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Failed to create assignment');
        }
        setCreating(false);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Teacher: Create Button */}
            {isClassTeacher && (
                <div className="mb-4">
                    {!showCreate ? (
                        <motion.button
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCreate(true)}
                            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed transition-colors"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface)' }}
                        >
                            <Plus size={16} /> Create Assignment
                        </motion.button>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>New Assignment</h3>
                                <button onClick={() => setShowCreate(false)} className="cursor-pointer" style={{ color: 'var(--text-3)' }}><X size={16} /></button>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>Title</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                        placeholder="e.g. Chapter 5 Problem Set"
                                        className="w-full px-3 py-2.5 text-sm rounded-xl border"
                                        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>Description (optional)</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                        placeholder="Instructions for students..."
                                        rows={2}
                                        className="w-full px-3 py-2.5 text-sm rounded-xl border resize-none"
                                        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>Due Date</label>
                                        <input
                                            type="datetime-local"
                                            value={form.dueDate}
                                            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                                            className="w-full px-3 py-2.5 text-sm rounded-xl border"
                                            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>Max Marks</label>
                                        <input
                                            type="number"
                                            value={form.maxMarks}
                                            onChange={(e) => setForm((f) => ({ ...f, maxMarks: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-3 py-2.5 text-sm rounded-xl border"
                                            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                        />
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={createAssignment}
                                    disabled={creating || !form.title || !form.dueDate}
                                    className="w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                                >
                                    {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 size={14} /> Create Assignment</>}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Assignment List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((n) => <div key={n} className="h-28 skeleton rounded-2xl" />)}
                </div>
            ) : assignments.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <ClipboardList size={32} className="mx-auto mb-3" style={{ color: 'var(--text-3)' }} />
                    <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>No assignments yet</h3>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                        {isClassTeacher ? 'Create your first assignment above.' : 'Assignments will appear here when your teacher posts them.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {assignments.map((a, i) => {
                        const due = dueDateStatus(a.dueDate);
                        return (
                            <motion.div
                                key={a.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="glass-card p-5 transition-all hover:shadow-md cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-sm font-bold" style={{ color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>{a.title}</h3>
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: due.bg, color: due.color }}>
                                                {due.label}
                                            </span>
                                            {a.status === 'CLOSED' && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--bg)', color: 'var(--text-3)' }}>Closed</span>
                                            )}
                                        </div>
                                        {a.description && (
                                            <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-2)' }}>{a.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <div className="text-lg font-bold" style={{ color: 'var(--secondary)' }}>{a.maxMarks}</div>
                                        <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>marks</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-3)' }}>
                                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDueDate(a.dueDate)}</span>
                                    <span className="flex items-center gap-1"><Users size={11} /> {a._count.submissions} submitted</span>
                                    <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(a.createdAt)}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
