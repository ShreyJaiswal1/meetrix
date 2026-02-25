'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogoFull } from '@/components/Logo';
import { Mail, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';

export default function VerifyEmailPage() {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const resendVerification = useAuthStore((s) => s.resendVerification);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  // Redirect if no email
  useEffect(() => {
    if (!email) router.push('/signup');
  }, [email, router]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Start with a 60s cooldown (code was just sent during registration)
  useEffect(() => {
    setResendCooldown(60);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newCode.every((d) => d !== '') && value) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleSubmit(pasted);
    }
  };

  const handleSubmit = async (otp?: string) => {
    const finalCode = otp || code.join('');
    if (finalCode.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyEmail(email, finalCode);
      setSuccess('Email verified successfully!');
      setTimeout(() => router.push('/onboarding'), 800);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Verification failed');
      // Clear code on error
      setCode(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await resendVerification(email);
      setSuccess('A new code has been sent to your email');
      setResendCooldown(60);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to resend');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <LogoFull size={32} />
        </div>

        <div className="glass-card p-8 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
          >
            <ShieldCheck size={28} className="text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
            Verify your email
          </h2>
          <p className="text-sm mb-1" style={{ color: 'var(--text-2)' }}>
            We sent a 6-digit code to
          </p>
          <p className="text-sm font-semibold mb-6 flex items-center justify-center gap-1.5" style={{ color: 'var(--text-1)' }}>
            <Mail size={14} /> {email}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'var(--error-bg)', color: 'var(--error)' }}
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
            >
              {success}
            </motion.div>
          )}

          {/* OTP Inputs */}
          <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <motion.input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 outline-none"
                style={{
                  background: 'var(--bg)',
                  borderColor: digit ? 'var(--primary)' : 'var(--border)',
                  color: 'var(--text-1)',
                  fontFamily: 'var(--font-heading)',
                  boxShadow: digit ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit()}
            disabled={loading || code.some((d) => !d)}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 mb-4"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: 'var(--shadow-glow)' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Verify Email <ArrowRight size={16} /></>
            )}
          </motion.button>

          {/* Resend */}
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-sm font-medium flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-colors disabled:opacity-50"
            style={{ color: resendCooldown > 0 ? 'var(--text-3)' : 'var(--secondary)' }}
          >
            <RotateCcw size={14} />
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
