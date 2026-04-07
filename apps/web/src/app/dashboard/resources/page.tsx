'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { FolderOpen, File, Download, User, BookOpen, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface GlobalResource {
    id: string;
    title: string;
    description?: string;
    fileUrl: string;
    type: string;
    size?: number;
    createdAt: string;
    classId: string;
    class: { name: string };
    uploader: { id: string; name: string; avatarUrl?: string };
}

export default function GlobalResourcesPage() {
    const [resources, setResources] = useState<GlobalResource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/classes/global/resources')
            .then(res => {
                if (res.data.success) setResources(res.data.data);
            })
            .catch(() => toast.error('Failed to fetch resources'))
            .finally(() => setLoading(false));
    }, []);

    const formatSize = (bytes?: number) => {
        if (!bytes) return 'N/A';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const timeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                    <FolderOpen className="text-secondary" /> Global Resources
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>Browse study materials, books and notes from all your classes.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="h-44 skeleton rounded-2xl" />)}
                </div>
            ) : resources.length === 0 ? (
                <div className="glass-card p-12 text-center text-opacity-50">
                    <FolderOpen size={48} className="mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-bold">No resources found</h3>
                    <p className="text-sm">Shared files will appear here as soon as they are uploaded to your classes.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((r, i) => (
                        <motion.div
                            key={r.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="glass-card p-4 flex flex-col justify-between transition-all hover:shadow-lg group hover:-translate-y-1"
                        >
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'var(--secondary)12', color: 'var(--secondary)' }}>
                                        <File size={18} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-surface" style={{ color: 'var(--text-3)' }}>
                                        {r.type}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold truncate mb-1" style={{ color: 'var(--text-1)' }}>{r.title}</h3>
                                {r.description && <p className="text-xs line-clamp-2" style={{ color: 'var(--text-2)' }}>{r.description}</p>}
                            </div>
                            
                            <div className="space-y-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                                <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--text-3)' }}>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <BookOpen size={11} /> <span className="font-bold text-[var(--text-2)] truncate max-w-[80px]">{r.class.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={11} /> {timeAgo(r.createdAt)}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <a
                                        href={r.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-surface text-[11px] font-bold transition-all hover:bg-[var(--border)]"
                                        style={{ color: 'var(--text-1)' }}
                                    >
                                        <ExternalLink size={12} /> View File
                                    </a>
                                    <a
                                        href={r.fileUrl}
                                        download
                                        className="w-10 h-9 flex items-center justify-center rounded-lg text-white transition-all hover:shadow-md hover:scale-105"
                                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                                    >
                                        <Download size={14} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
