'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  ArrowLeft,
  Sparkles,
  ArrowRight,
  Check,
  Copy,
  Link as LinkIcon,
  Share2,
  PartyPopper,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface CreatedClass {
  id: string;
  name: string;
  subject: string;
  inviteCode: string;
}

export default function CreateClassPage() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdClass, setCreatedClass] = useState<CreatedClass | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/classes', { name, subject, description });
      if (data.success) {
        setCreatedClass(data.data);
      } else {
        setError(data.error || 'Failed to create class');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const inviteUrl = createdClass
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/classes/join?code=${createdClass.inviteCode}`
    : '';

  const copyInviteCode = async () => {
    if (!createdClass) return;
    await navigator.clipboard.writeText(createdClass.inviteCode);
    setCopiedCode(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyInviteLink = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareClass = async () => {
    if (!createdClass) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join "${createdClass.name}" on Meetrix`,
          text: `Use invite code ${createdClass.inviteCode} to join "${createdClass.name}" on Meetrix!`,
          url: inviteUrl,
        });
      } catch {
        // User cancelled share dialog
      }
    } else {
      copyInviteLink();
    }
  };

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Computer Science',
    'History',
    'Economics',
    'Other',
  ];

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/dashboard/classes"
        className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
        style={{ color: 'var(--text-2)' }}
      >
        <ArrowLeft size={16} /> Back to Classes
      </Link>

      <AnimatePresence mode="wait">
        {createdClass ? (
          /* ─── Success Screen ─── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-card p-8"
          >
            {/* Celebration Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, var(--success), #22c55e)' }}
              >
                <PartyPopper size={28} className="text-white" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-extrabold mb-1"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}
              >
                Class Created! 🎉
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm"
                style={{ color: 'var(--text-2)' }}
              >
                Share the invite details below with your students
              </motion.p>
            </div>

            {/* Class Name Tag */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-6 p-4 rounded-xl border text-center"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
            >
              <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-3)' }}>
                {createdClass.subject}
              </div>
              <div className="text-lg font-bold" style={{ color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>
                {createdClass.name}
              </div>
            </motion.div>

            {/* Invite Code */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-4"
            >
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-2)' }}>
                Invite Code
              </label>
              <div
                className="flex items-center justify-between p-4 rounded-xl border"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <span
                  className="text-2xl font-mono font-extrabold tracking-[0.2em]"
                  style={{ color: 'var(--secondary)' }}
                >
                  {createdClass.inviteCode}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyInviteCode}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  style={{
                    background: copiedCode ? 'rgba(34,197,94,0.1)' : 'var(--surface)',
                    color: copiedCode ? 'rgb(34,197,94)' : 'var(--text-2)',
                    border: `1px solid ${copiedCode ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                  }}
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  {copiedCode ? 'Copied' : 'Copy'}
                </motion.button>
              </div>
            </motion.div>

            {/* Invite Link */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-2)' }}>
                Invite Link
              </label>
              <div
                className="flex items-center justify-between p-3 rounded-xl border gap-3"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <LinkIcon size={14} className="flex-shrink-0" style={{ color: 'var(--text-3)' }} />
                  <span
                    className="text-xs truncate font-mono"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {inviteUrl}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyInviteLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex-shrink-0"
                  style={{
                    background: copiedLink ? 'rgba(34,197,94,0.1)' : 'var(--surface)',
                    color: copiedLink ? 'rgb(34,197,94)' : 'var(--text-2)',
                    border: `1px solid ${copiedLink ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                  }}
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </motion.button>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3"
            >
              <button
                onClick={shareClass}
                className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border"
                style={{
                  borderColor: 'var(--secondary)',
                  color: 'var(--secondary)',
                  background: 'transparent',
                }}
              >
                <Share2 size={16} /> Share
              </button>
              <Link
                href={`/dashboard/classes/${createdClass.id}`}
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                Go to Class <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          /* ─── Create Form ─── */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="glass-card p-8"
          >
            <div className="mb-6">
              <h1
                className="text-2xl font-extrabold mb-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}
              >
                Create a New Class
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                Set up your virtual classroom in seconds
              </p>
            </div>

            {error && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'var(--error-bg)', color: 'var(--error)' }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'var(--text-2)' }}
                >
                  Class Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Calculus — Grade 12"
                  required
                  className="w-full px-4 py-3 text-sm rounded-xl border"
                  style={{
                    background: 'var(--bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-1)',
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'var(--text-2)' }}
                >
                  Subject
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubject(s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border"
                      style={{
                        background:
                          subject === s
                            ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                            : 'var(--bg)',
                        color: subject === s ? 'white' : 'var(--text-2)',
                        borderColor: subject === s ? 'transparent' : 'var(--border)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'var(--text-2)' }}
                >
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this class..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm rounded-xl border resize-none"
                  style={{
                    background: 'var(--bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-1)',
                  }}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !name || !subject}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Class <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            <div
              className="mt-6 flex items-center justify-center gap-2 text-xs"
              style={{ color: 'var(--text-3)' }}
            >
              <Sparkles size={12} /> An invite code will be generated automatically
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
