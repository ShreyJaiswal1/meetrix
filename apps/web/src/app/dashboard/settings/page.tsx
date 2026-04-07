'use client';

import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Palette, Database, ExternalLink, HelpCircle, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

export default function SettingsPlaceholder() {
    const user = useAuthStore(s => s.user);

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Dashboard Settings</h1>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>Manage your profile, notifications and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Tabs Panel */}
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { label: 'Profile', icon: User, active: true },
                        { label: 'Notifications', icon: Bell },
                        { label: 'Security', icon: Shield },
                        { label: 'Appearance', icon: Palette },
                        { label: 'Account Data', icon: Database },
                    ].map((tab, i) => (
                        <button
                            key={i}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all transition-colors cursor-pointer ${tab.active ? 'bg-secondary text-white shadow-lg' : 'text-[var(--text-3)] hover:bg-surface hover:text-[var(--text-1)]'}`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Profile Section */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                        <h3 className="font-bold text-sm mb-6 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>Personal Information</h3>
                        <div className="flex items-center gap-6 mb-8">
                             <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white text-2xl font-bold shadow-soft">
                                  {user?.name[0]}
                             </div>
                             <div>
                                  <button className="px-4 py-2 rounded-xl bg-surface border text-xs font-bold mb-2 cursor-pointer hover:bg-[var(--border)]" style={{ borderColor: 'var(--border)' }}>
                                      Change Avatar
                                  </button>
                                  <p className="text-[10px] text-[var(--text-3)]">JPG, GIF or PNG. Max size of 800K</p>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-[10px] uppercase font-bold tracking-widest mb-1.5 opacity-60">Full Name</label>
                                 <input
                                     type="text"
                                     value={user?.name}
                                     className="w-full bg-surface py-3 px-4 rounded-xl text-sm border outline-none focus:border-secondary"
                                     style={{ borderColor: 'var(--border)' }}
                                 />
                             </div>
                             <div>
                                 <label className="block text-[10px] uppercase font-bold tracking-widest mb-1.5 opacity-60">Email Address</label>
                                 <input
                                     type="email"
                                     value={user?.email}
                                     className="w-full bg-surface py-3 px-4 rounded-xl text-sm border outline-none focus:border-secondary"
                                     style={{ borderColor: 'var(--border)' }}
                                 />
                             </div>
                        </div>
                    </motion.div>

                    {/* Notification Preferences */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                         <h3 className="font-bold text-sm mb-4">Quick Preferences</h3>
                         <div className="space-y-4">
                             {[
                                 { label: 'Push Notifications', desc: 'Receive alerts for upcoming live classes', enabled: true },
                                 { label: 'Email Reports', desc: 'Monthly summary of your learning progress', enabled: false },
                                 { label: 'Mention Alerts', desc: 'Notification when someone mentions you in chat', enabled: true },
                             ].map((opt, i) => (
                                 <div key={i} className="flex items-center justify-between">
                                     <div>
                                         <p className="text-xs font-bold mb-0.5">{opt.label}</p>
                                         <p className="text-[10px] opacity-60">{opt.desc}</p>
                                     </div>
                                     <div className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-all ${opt.enabled ? 'bg-secondary' : 'bg-surface border'}`} style={{ borderColor: opt.enabled ? 'transparent' : 'var(--border)' }}>
                                         <div className={`w-3 h-3 bg-white rounded-full transition-all ${opt.enabled ? 'ml-5' : 'ml-0'}`} />
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </motion.div>

                    <div className="flex justify-end gap-3 pt-4">
                         <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-white text-xs font-bold cursor-pointer shadow-soft hover:shadow-xl hover:scale-105 transition-all">
                              <Save size={14} /> Save Changes
                         </button>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-center">
                 <button className="flex items-center gap-2 text-xs font-bold text-secondary opacity-60 hover:opacity-100 transition-opacity">
                      <HelpCircle size={14} /> Contact Support for data request <ExternalLink size={12} />
                 </button>
            </div>
        </div>
    );
}
