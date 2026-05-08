'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useClassStore } from '@/stores/classes';
import { ClipboardList, Calendar, User, BookOpen, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GlobalAssignmentsPage() {
    const { globalAssignments: assignments, isLoadingAssignments: loading, fetchGlobalAssignments } = useClassStore();

    useEffect(() => {
        fetchGlobalAssignments().catch(() => toast.error('Failed to fetch assignments'));
    }, [fetchGlobalAssignments]);

    const formatDueDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const dueDateStatus = (dateStr: string) => {
        const date = new Date(dateStr);
        const diff = date.getTime() - Date.now();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (diff < 0) return { label: 'Overdue', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
        if (days === 0) return { label: 'Due Today', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
        if (days === 1) return { label: 'Due Tomorrow', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
        return { label: `Due in ${days} days`, color: 'var(--secondary)', bg: 'rgba(124,92,252,0.1)' };
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                    <ClipboardList className="text-warning" /> Global Assignments
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>All upcoming assignments and deadlines across your classes.</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(n => <div key={n} className="h-28 skeleton rounded-2xl" />)}
                </div>
            ) : assignments.length === 0 ? (
                <div className="glass-card p-12 text-center text-opacity-50">
                    <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-bold">No assignments found</h3>
                    <p className="text-sm">You have no upcoming assignments in any of your classes.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {assignments.map((a) => {
                        const due = dueDateStatus(a.dueDate);
                        return (
                            <motion.div
                                key={a.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card p-5 transition-all hover:shadow-lg cursor-pointer group hover:-translate-y-0.5"
                                style={{ borderLeft: `4px solid ${due.color}` }}
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3 className="font-bold text-sm text-[var(--text-1)] group-hover:text-[var(--secondary)] transition-colors">{a.title}</h3>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: due.bg, color: due.color }}>
                                                {due.label}
                                            </span>
                                        </div>
                                        {a.description && (
                                            <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-2)' }}>{a.description}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>
                                            <span className="flex items-center gap-1"><BookOpen size={13} /> {a.class.name}</span>
                                            <span className="flex items-center gap-1"><User size={13} /> {a.teacher.name}</span>
                                            <span className="flex items-center gap-1 text-[var(--text-2)]"><Calendar size={13} /> {formatDueDate(a.dueDate)}</span>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right shrink-0">
                                        <div className="text-xl font-bold" style={{ color: 'var(--secondary)' }}>{a.maxMarks}</div>
                                        <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>total marks</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
