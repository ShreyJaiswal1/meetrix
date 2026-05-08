'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { timeAgo } from '@/app/dashboard/classes/[id]/components/utils';

interface Notification {
    id: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationsDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch notifications on mount
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                if (res.data.success) {
                    setNotifications(res.data.data.notifications);
                    setUnreadCount(res.data.data.unreadCount);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchNotifications();

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl cursor-pointer transition-colors" 
                style={{ color: 'var(--text-2)', background: 'var(--surface)' }}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full pulse-dot"
                        style={{ background: 'var(--error)' }}
                    />
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-[var(--bg)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
                            <h3 className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>Notifications</h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-[10px] font-bold text-[var(--secondary)] hover:underline cursor-pointer"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto no-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-[var(--text-3)]">
                                    <Bell size={24} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No new notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--border)]">
                                    {notifications.map(n => (
                                        <div 
                                            key={n.id} 
                                            className={`p-4 transition-colors hover:bg-[var(--surface)] ${!n.read ? 'bg-[var(--secondary)] bg-opacity-5' : ''}`}
                                            onClick={() => !n.read && markAsRead(n.id)}
                                            style={{ cursor: !n.read ? 'pointer' : 'default' }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h4 className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-1)' }}>{n.title}</h4>
                                                    <p className="text-xs" style={{ color: 'var(--text-2)' }}>{n.body}</p>
                                                    <p className="text-[10px] mt-1.5 font-medium uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{timeAgo(n.createdAt)}</p>
                                                </div>
                                                {!n.read && (
                                                    <div className="w-2 h-2 rounded-full bg-[var(--secondary)] shrink-0 mt-1" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
