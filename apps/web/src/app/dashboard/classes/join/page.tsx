'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, KeyRound, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function JoinClassPage() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Pre-fill code from invite link URL param
  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setCode(codeParam.toUpperCase().trim());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await api.post('/classes/join', { inviteCode: code.toUpperCase().trim() });
      if (data.success) {
        setSuccess(`Joined "${data.data.name}" successfully!`);
        setTimeout(() => router.push(`/dashboard/classes/${data.data.id}`), 1500);
      } else {
        setError(data.error || 'Failed to join class');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid invite code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Link href="/dashboard/classes" className="inline-flex items-center gap-2 text-sm font-medium mb-6" style={{ color: 'var(--text-2)' }}>
        <ArrowLeft size={16} /> Back to Classes
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            <KeyRound size={24} className="text-white" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>Join a Class</h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>Enter the invite code shared by your teacher</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>{error}</motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <CheckCircle size={16} /> {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="MTX-XXXX"
            required
            maxLength={8}
            className="w-full px-4 py-4 text-center text-lg font-mono font-bold tracking-widest rounded-xl border"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)', letterSpacing: '0.15em' }}
          />

          <motion.button
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || code.length < 4}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: 'var(--shadow-glow)' }}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
              <>Join Class <ArrowRight size={16} /></>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-xs" style={{ color: 'var(--text-3)' }}>
          Ask your teacher for the invite code — it looks like <code className="font-mono" style={{ color: 'var(--secondary)' }}>MTX-4F91</code>
        </div>
      </motion.div>
    </div>
  );
}
