'use client';

import { motion } from 'framer-motion';
import { FolderOpen, ClipboardList, Megaphone, Crown, Trash2 } from 'lucide-react';

interface OverviewTabProps {
    cls: any;
    isClassTeacher: boolean;
    deleting: boolean;
    handleDelete: () => void;
    Avatar: React.ElementType;
}

export default function OverviewTab({ cls, isClassTeacher, deleting, handleDelete, Avatar }: OverviewTabProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Resources', count: cls._count.resources, Icon: FolderOpen },
                    { label: 'Assignments', count: cls._count.assignments, Icon: ClipboardList },
                    { label: 'Announcements', count: cls._count.announcements, Icon: Megaphone },
                ].map(({ label, count, Icon }) => (
                    <div key={label} className="glass-card p-5 flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,92,252,0.1)' }}>
                            <Icon size={18} style={{ color: 'var(--secondary)' }} />
                        </div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>{count}</div>
                        <div className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Teacher Card */}
            <div className="glass-card p-5 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-2)' }}>Class Teacher</h3>
                <div className="flex items-center gap-3">
                    <Avatar src={cls.teacher.avatarUrl} name={cls.teacher.name} size={10} />
                    <div>
                        <div className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                            {cls.teacher.name} <Crown size={12} style={{ color: 'var(--warning)' }} />
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-3)' }}>{cls.teacher.email}</div>
                    </div>
                </div>
            </div>

            {isClassTeacher && (
                <div className="rounded-2xl border p-5" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'var(--surface)' }}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgb(239,68,68)' }}>Danger Zone</h3>
                    <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors disabled:opacity-50" style={{ color: 'rgb(239,68,68)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete Class'}
                    </button>
                </div>
            )}
        </motion.div>
    );
}
