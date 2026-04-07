'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, X, Link as LinkIcon, FileText, Image as ImageIcon, Video, File, Trash2, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Resource {
    id: string;
    title: string;
    type: 'PDF' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LINK';
    url: string;
    folder?: string;
    createdAt: string;
    uploader: { id: string; name: string; avatarUrl?: string };
}

interface ResourcesTabProps {
    classId: string;
    isClassTeacher: boolean;
    userId: string;
    timeAgo: (date: string) => string;
}

const TypeIcon = ({ type, size = 16 }: { type: string; size?: number }) => {
    switch (type) {
        case 'PDF': return <FileText size={size} className="text-red-500" />;
        case 'IMAGE': return <ImageIcon size={size} className="text-blue-500" />;
        case 'VIDEO': return <Video size={size} className="text-purple-500" />;
        case 'LINK': return <LinkIcon size={size} className="text-emerald-500" />;
        default: return <File size={size} className="text-gray-500" />;
    }
};

export default function ResourcesTab({ classId, isClassTeacher, userId, timeAgo }: ResourcesTabProps) {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({
        title: '',
        type: 'LINK' as Resource['type'],
        url: '',
    });

    const fetchResources = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/classes/${classId}/resources`);
            if (data.success) setResources(data.data);
        } catch { /* silent */ }
        setLoading(false);
    }, [classId]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const addResource = async () => {
        if (!form.title || !form.url) return;
        setAdding(true);
        try {
            const { data } = await api.post(`/classes/${classId}/resources`, form);
            if (data.success) {
                setResources((prev) => [data.data, ...prev]);
                setShowAdd(false);
                setForm({ title: '', type: 'LINK', url: '' });
                toast.success('Resource added!');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Failed to add resource');
        }
        setAdding(false);
    };

    const deleteResource = async (id: string) => {
        if (!confirm('Delete this resource?')) return;
        try {
            await api.delete(`/classes/${classId}/resources/${id}`);
            setResources((prev) => prev.filter((r) => r.id !== id));
            toast.success('Resource deleted');
        } catch {
            toast.error('Failed to delete resource');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Add Resource (Teacher) */}
            {isClassTeacher && (
                <div className="mb-4">
                    {!showAdd ? (
                        <motion.button
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowAdd(true)}
                            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed transition-colors"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface)' }}
                        >
                            <Plus size={16} /> Add Resource
                        </motion.button>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold">New Resource</h3>
                                <button onClick={() => setShowAdd(false)} className="cursor-pointer" style={{ color: 'var(--text-3)' }}><X size={16} /></button>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>Title</label>
                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                            placeholder="Resource name"
                                            className="w-full px-3 py-2.5 text-sm rounded-xl border"
                                            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>Type</label>
                                        <select
                                            value={form.type}
                                            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                                            className="w-full px-3 py-2.5 text-sm rounded-xl border"
                                            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                        >
                                            <option value="LINK">Link</option>
                                            <option value="PDF">PDF</option>
                                            <option value="IMAGE">Image</option>
                                            <option value="VIDEO">Video</option>
                                            <option value="DOCUMENT">Document</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>URL</label>
                                    <input
                                        type="url"
                                        value={form.url}
                                        onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                                        placeholder="https://example.com/file"
                                        className="w-full px-3 py-2.5 text-sm rounded-xl border"
                                        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={addResource}
                                    disabled={adding || !form.title || !form.url}
                                    className="w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                                >
                                    {adding ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={14} /> Add Resource</>}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* list */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((n) => <div key={n} className="h-20 skeleton rounded-2xl" />)}
                </div>
            ) : resources.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <FolderOpen size={32} className="mx-auto mb-3" style={{ color: 'var(--text-3)' }} />
                    <h3 className="text-sm font-semibold mb-1">No resources yet</h3>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                        {isClassTeacher ? 'Upload notes or links for your students.' : 'Your teacher hasn\'t shared any resources yet.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {resources.map((r, i) => (
                        <motion.div
                            key={r.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="glass-card p-3 flex items-center justify-between group hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 rounded-xl bg-opacity-10 shrink-0" style={{ background: 'var(--bg)' }}>
                                    <TypeIcon type={r.type} size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-bold truncate pr-2" style={{ color: 'var(--text-1)' }}>{r.title}</h4>
                                    <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-3)' }}>
                                        <span className="uppercase font-semibold">{r.type}</span>
                                        <span>•</span>
                                        <span>{timeAgo(r.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                                    style={{ color: 'var(--secondary)' }}
                                >
                                    <ExternalLink size={16} />
                                </a>
                                {(isClassTeacher || r.uploader.id === userId) && (
                                    <button
                                        onClick={() => deleteResource(r.id)}
                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:bg-opacity-10 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
