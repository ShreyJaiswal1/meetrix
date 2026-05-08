'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, Palette, Database, ExternalLink, HelpCircle, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { user, updateProfile } = useAuthStore();
    const [activeTab, setActiveTab] = useState('Profile');

    // Profile Form State
    const [name, setName] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);

    // Notification Preferences State (Mock)
    const [preferences, setPreferences] = useState({
        push: true,
        email: false,
        mentions: true
    });

    useEffect(() => {
        if (user?.name) setName(user.name);
    }, [user?.name]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (activeTab === 'Profile') {
                await updateProfile({ name });
                toast.success('Profile updated successfully');
            } else if (activeTab === 'Notifications') {
                // Mock saving preferences
                await new Promise(r => setTimeout(r, 500));
                toast.success('Preferences saved');
            } else {
                toast.info('Settings saved');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { label: 'Profile', icon: User },
        { label: 'Notifications', icon: Bell },
        { label: 'Security', icon: Shield },
        { label: 'Appearance', icon: Palette },
        { label: 'Account Data', icon: Database },
    ];

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Dashboard Settings</h1>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>Manage your profile, notifications and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Tabs Panel */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map((tab, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(tab.label)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all transition-colors cursor-pointer ${activeTab === tab.label ? 'bg-secondary text-white shadow-lg' : 'text-[var(--text-3)] hover:bg-surface hover:text-[var(--text-1)]'}`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <div className="lg:col-span-3 space-y-6 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'Profile' && (
                            <motion.div key="Profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-6">
                                <h3 className="font-bold text-sm mb-6 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>Personal Information</h3>
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white text-2xl font-bold shadow-soft">
                                        {user?.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <button className="px-4 py-2 rounded-xl bg-surface border text-xs font-bold mb-2 cursor-pointer hover:bg-[var(--border)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                                            Change Avatar
                                        </button>
                                        <p className="text-[10px] text-[var(--text-3)]">JPG, GIF or PNG. Max size of 800K</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest mb-1.5 opacity-60">Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-surface py-3 px-4 rounded-xl text-sm border outline-none focus:border-secondary transition-colors"
                                            style={{ borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest mb-1.5 opacity-60">Email Address</label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full bg-surface py-3 px-4 rounded-xl text-sm border outline-none opacity-60 cursor-not-allowed"
                                            style={{ borderColor: 'var(--border)', color: 'var(--text-1)' }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Notifications' && (
                            <motion.div key="Notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-6">
                                <h3 className="font-bold text-sm mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>Quick Preferences</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold mb-0.5">Push Notifications</p>
                                            <p className="text-[10px] opacity-60">Receive alerts for upcoming live classes</p>
                                        </div>
                                        <button onClick={() => setPreferences(p => ({ ...p, push: !p.push }))} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-all ${preferences.push ? 'bg-secondary' : 'bg-surface border'}`} style={{ borderColor: preferences.push ? 'transparent' : 'var(--border)' }}>
                                            <div className={`w-3 h-3 bg-white rounded-full transition-all ${preferences.push ? 'ml-5' : 'ml-0'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold mb-0.5">Email Reports</p>
                                            <p className="text-[10px] opacity-60">Monthly summary of your learning progress</p>
                                        </div>
                                        <button onClick={() => setPreferences(p => ({ ...p, email: !p.email }))} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-all ${preferences.email ? 'bg-secondary' : 'bg-surface border'}`} style={{ borderColor: preferences.email ? 'transparent' : 'var(--border)' }}>
                                            <div className={`w-3 h-3 bg-white rounded-full transition-all ${preferences.email ? 'ml-5' : 'ml-0'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold mb-0.5">Mention Alerts</p>
                                            <p className="text-[10px] opacity-60">Notification when someone mentions you in chat</p>
                                        </div>
                                        <button onClick={() => setPreferences(p => ({ ...p, mentions: !p.mentions }))} className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-all ${preferences.mentions ? 'bg-secondary' : 'bg-surface border'}`} style={{ borderColor: preferences.mentions ? 'transparent' : 'var(--border)' }}>
                                            <div className={`w-3 h-3 bg-white rounded-full transition-all ${preferences.mentions ? 'ml-5' : 'ml-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {['Security', 'Appearance', 'Account Data'].includes(activeTab) && (
                            <motion.div key="Other" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-12 text-center text-[var(--text-3)]">
                                <h3 className="font-bold text-sm mb-2 text-[var(--text-1)]">{activeTab} Settings</h3>
                                <p className="text-xs">This section is currently under development.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-end gap-3 pt-4">
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-white text-xs font-bold cursor-pointer shadow-soft hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />} 
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-center">
                <button className="flex items-center gap-2 text-xs font-bold text-secondary opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                    <HelpCircle size={14} /> Contact Support for data request <ExternalLink size={12} />
                </button>
            </div>
        </div>
    );
}
