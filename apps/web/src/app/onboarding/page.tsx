'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { LogoFull } from '@/components/Logo';
import { GraduationCap, BookOpen, Shield, ArrowRight, User, Shuffle, Check } from 'lucide-react';

type RoleOption = { value: string; label: string; icon: React.ReactNode; desc: string; color: string };

const roles: RoleOption[] = [
  { value: 'STUDENT', label: 'Student', icon: <GraduationCap size={28} />, desc: 'Join classes, submit work, and learn', color: 'var(--accent)' },
  { value: 'TEACHER', label: 'Teacher', icon: <BookOpen size={28} />, desc: 'Create classes and manage students', color: 'var(--secondary)' },
  { value: 'ADMIN', label: 'Admin', icon: <Shield size={28} />, desc: 'Manage the entire school', color: 'var(--primary)' },
];

const AVATAR_STYLES = [
  'miniavs',
  'avataaars',
];

function getAvatarUrl(style: string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

export default function OnboardingPage() {
  const user = useAuthStore((s) => s.user);
  const onboard = useAuthStore((s) => s.onboard);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();

  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(() => String(Date.now()));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (user) {
      setName(user.name || '');
      if ((user as any).onboarded) {
        router.push('/dashboard');
      }
      // Default: use Google avatar if available, else first DiceBear style
      if (user.avatarUrl) {
        setSelectedAvatar(user.avatarUrl);
      } else {
        setSelectedAvatar(getAvatarUrl(AVATAR_STYLES[0], avatarSeed));
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  const shuffleAvatars = useCallback(() => {
    const newSeed = String(Date.now()) + Math.random().toString(36).slice(2, 6);
    setAvatarSeed(newSeed);
    setSelectedAvatar(getAvatarUrl(AVATAR_STYLES[0], newSeed + '-0'));
  }, []);

  const handleSubmit = async () => {
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onboard({ name: name.trim(), role, avatarUrl: selectedAvatar || null });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const avatarOptions = AVATAR_STYLES.flatMap((style) =>
    Array.from({ length: 5 }, (_, i) => ({
      style,
      seed: avatarSeed + '-' + i,
      url: getAvatarUrl(style, avatarSeed + '-' + i),
    }))
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)', top: '-200px', right: '-200px' }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', bottom: '-100px', left: '-100px' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <LogoFull size={36} />
        </div>

        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}
            >
              Welcome to Meetrix! 🎉
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm"
              style={{ color: 'var(--text-2)' }}
            >
              Let&apos;s set up your profile to get started
            </motion.p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'var(--error-bg)', color: 'var(--error)' }}
            >
              {error}
            </motion.div>
          )}

          {/* Selected Avatar Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedAvatar}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-24 h-24 rounded-full overflow-hidden border-3"
                  style={{
                    borderColor: 'var(--secondary)',
                    background: 'var(--surface)',
                  }}
                >
                  {selectedAvatar ? (
                    <img src={selectedAvatar} alt="Selected avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                    >
                      <User size={36} className="text-white" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Avatar Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                Choose Avatar
              </label>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, rotate: 180 }}
                onClick={shuffleAvatars}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                style={{ color: 'var(--secondary)', background: 'var(--secondary)10' }}
                type="button"
              >
                <Shuffle size={12} /> Shuffle
              </motion.button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {avatarOptions.map(({ style, seed, url }, i) => {
                const isSelected = selectedAvatar === url;
                return (
                  <motion.button
                    key={style + seed}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.04 }}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2"
                    style={{
                      borderColor: isSelected ? 'var(--secondary)' : 'var(--border)',
                      background: 'var(--surface)',
                      boxShadow: isSelected ? '0 0 0 3px rgba(139, 92, 246, 0.15)' : 'none',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
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
          </motion.div>

          {/* Name Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
              Your Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all duration-200"
                style={{
                  background: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-1)',
                  fontFamily: 'var(--font-body)',
                }}
              />
            </div>
          </motion.div>

          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-8"
          >
            <label className="block text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
              I am a...
            </label>
            <div className="flex flex-col gap-3">
              {roles.map((r, i) => (
                <motion.button
                  key={r.value}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.1 }}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border text-left"
                  style={{
                    background: role === r.value ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg)',
                    borderColor: role === r.value ? 'transparent' : 'var(--border)',
                    color: role === r.value ? '#fff' : 'var(--text-1)',
                    boxShadow: role === r.value ? 'var(--shadow-glow)' : 'none',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: role === r.value ? 'rgba(255,255,255,0.2)' : `${r.color}15`,
                      color: role === r.value ? '#fff' : r.color,
                    }}
                  >
                    {r.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{r.label}</div>
                    <div className="text-xs mt-0.5" style={{ opacity: role === r.value ? 0.8 : 0.5 }}>{r.desc}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Submit */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Get Started <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-3)' }}>
          You can always change these settings later
        </p>
      </motion.div>
    </div>
  );
}
