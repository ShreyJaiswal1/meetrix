'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth';
import {
  User,
  Shuffle,
  Check,
  Save,
  Shield,
  FileText,
  HelpCircle,
  Mail,
  LogOut,
  ChevronRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

const AVATAR_STYLES = [
  'miniavs',
  'avataaars',
];

function getAvatarUrl(style: string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

const legalLinks = [
  { label: 'Terms of Service', desc: 'Read our terms and conditions', icon: FileText, href: '#' },
  { label: 'Privacy Policy', desc: 'How we handle your data', icon: Shield, href: '#' },
  { label: 'Help Center', desc: 'Get answers to common questions', icon: HelpCircle, href: '#' },
  { label: 'Contact Support', desc: 'Reach out for assistance', icon: Mail, href: 'mailto:support@meetrix.app' },
];

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const logout = useAuthStore((s) => s.logout);

  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarUrl || '');
  const [avatarSeed, setAvatarSeed] = useState(() => String(Date.now()));
  const [saving, setSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const hasChanges = name !== (user?.name || '') || selectedAvatar !== (user?.avatarUrl || '');

  const shuffleAvatars = useCallback(() => {
    const newSeed = String(Date.now()) + Math.random().toString(36).slice(2, 6);
    setAvatarSeed(newSeed);
    setSelectedAvatar(getAvatarUrl(AVATAR_STYLES[0], newSeed + '-0'));
  }, []);

  const handleSave = async () => {
    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        avatarUrl: selectedAvatar || null,
      });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const avatarOptions = AVATAR_STYLES.flatMap((style) =>
    Array.from({ length: 5 }, (_, i) => ({
      style,
      seed: avatarSeed + '-' + i,
      url: getAvatarUrl(style, avatarSeed + '-' + i),
    }))
  );

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}
        >
          Settings
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          Manage your profile and account preferences
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border p-6 mb-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-wider mb-5"
          style={{ color: 'var(--text-2)' }}
        >
          Profile
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedAvatar}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-20 h-20 rounded-full overflow-hidden border-3 cursor-pointer"
                style={{
                  borderColor: 'var(--secondary)',
                  background: 'var(--bg)',
                }}
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              >
                {selectedAvatar ? (
                  <img src={selectedAvatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                  >
                    <User size={32} className="text-white" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div>
            <div className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>
              {user.name}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>
              {user.email}
            </div>
            <button
              type="button"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="text-xs font-medium mt-1.5 cursor-pointer"
              style={{ color: 'var(--secondary)' }}
            >
              {showAvatarPicker ? 'Hide avatars' : 'Change avatar'}
            </button>
          </div>
        </div>

        {/* Avatar Picker (collapsible) */}
        <AnimatePresence>
          {showAvatarPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-6"
            >
              <div
                className="rounded-xl p-4 border"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                    Choose Avatar
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, rotate: 180 }}
                    onClick={shuffleAvatars}
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg cursor-pointer"
                    style={{ color: 'var(--secondary)', background: 'var(--secondary)10' }}
                    type="button"
                  >
                    <Shuffle size={12} /> Shuffle
                  </motion.button>
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  {avatarOptions.map(({ style, seed, url }, i) => {
                    const isSelected = selectedAvatar === url;
                    return (
                      <motion.button
                        key={style + seed}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        type="button"
                        onClick={() => setSelectedAvatar(url)}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2"
                        style={{
                          borderColor: isSelected ? 'var(--secondary)' : 'var(--border)',
                          background: 'var(--surface)',
                          boxShadow: isSelected ? '0 0 0 3px rgba(139, 92, 246, 0.15)' : 'none',
                        }}
                      >
                        <img src={url} alt={style} className="w-full h-full object-cover p-1" />
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: 'var(--secondary)' }}
                          >
                            <Check size={10} className="text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name */}
        <div className="mb-5">
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
            Display Name
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all duration-200"
              style={{
                background: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--text-1)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>
        </div>

        {/* Save Button */}
        <motion.button
          whileHover={hasChanges ? { scale: 1.01, y: -1 } : {}}
          whileTap={hasChanges ? { scale: 0.98 } : {}}
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: hasChanges
              ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
              : 'var(--text-3)',
            boxShadow: hasChanges ? 'var(--shadow-glow)' : 'none',
          }}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={14} /> Save Changes
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border p-6 mb-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--text-2)' }}
        >
          Account
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Mail size={16} style={{ color: 'var(--text-3)' }} />
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Email</div>
                <div className="text-xs" style={{ color: 'var(--text-3)' }}>{user.email}</div>
              </div>
            </div>
            <div
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: user.emailVerified ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: user.emailVerified ? 'rgb(34,197,94)' : 'rgb(239,68,68)',
              }}
            >
              {user.emailVerified ? 'Verified' : 'Unverified'}
            </div>
          </div>
          <div
            className="h-px"
            style={{ background: 'var(--border)' }}
          />
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Sparkles size={16} style={{ color: 'var(--text-3)' }} />
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Role</div>
                <div className="text-xs" style={{ color: 'var(--text-3)' }}>{user.role}</div>
              </div>
            </div>
          </div>
          <div
            className="h-px"
            style={{ background: 'var(--border)' }}
          />
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Calendar size={16} style={{ color: 'var(--text-3)' }} />
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Member since</div>
                <div className="text-xs" style={{ color: 'var(--text-3)' }}>{memberSince}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Legal & Support */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border p-6 mb-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--text-2)' }}
        >
          Legal & Support
        </h2>
        <div className="space-y-1">
          {legalLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer"
                style={{ color: 'var(--text-1)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--bg)' }}
                  >
                    <Icon size={16} style={{ color: 'var(--text-2)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{link.label}</div>
                    <div className="text-xs" style={{ color: 'var(--text-3)' }}>{link.desc}</div>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-3)' }} />
              </motion.a>
            );
          })}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border p-6 mb-8"
        style={{ background: 'var(--surface)', borderColor: 'rgba(239,68,68,0.2)' }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'rgb(239,68,68)' }}
        >
          Danger Zone
        </h2>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
          style={{
            color: 'rgb(239,68,68)',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </motion.div>
    </div>
  );
}
