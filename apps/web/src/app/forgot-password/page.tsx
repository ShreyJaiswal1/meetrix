'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogoFull } from '@/components/Logo';
import { Mail, KeyRound, Lock, ArrowRight, ArrowLeft, RotateCcw, CheckCircle2 } from 'lucide-react';

type Step = 'email' | 'reset';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const router = useRouter();

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep('reset');
      setResendCooldown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
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
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = code.join('');
    if (otp.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await forgotPassword(email);
      setResendCooldown(60);
      setCode(Array(6).fill(''));
      setSuccess('A new code has been sent');
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

        <div className="glass-card p-8">
          {/* Step 1: Enter Email */}
          {step === 'email' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                >
                  <KeyRound size={28} className="text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
                  Forgot password?
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                  Enter your email and we&apos;ll send you a verification code
                </p>
              </div>

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

              <form onSubmit={handleSendCode} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: 'var(--shadow-glow)' }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Send Reset Code <ArrowRight size={16} /></>
                  )}
                </motion.button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: 'var(--text-2)' }}>
                <Link href="/login" className="font-semibold flex items-center justify-center gap-1" style={{ color: 'var(--secondary)' }}>
                  <ArrowLeft size={14} /> Back to login
                </Link>
              </p>
            </motion.div>
          )}

          {/* Step 2: Enter OTP + New Password */}
          {step === 'reset' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                >
                  <CheckCircle2 size={28} className="text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
                  Reset password
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                  Enter the code sent to <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{email}</span>
                </p>
              </div>

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

              <form onSubmit={handleReset} className="flex flex-col gap-5">
                {/* OTP Input */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                    Verification Code
                  </label>
                  <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-11 h-13 text-center text-lg font-bold rounded-xl border-2 transition-all duration-200 outline-none"
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
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border transition-all"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-xs font-medium"
                      style={{ color: 'var(--text-3)' }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: 'var(--shadow-glow)' }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Reset Password <ArrowRight size={16} /></>
                  )}
                </motion.button>
              </form>

              {/* Resend */}
              <div className="flex items-center justify-between mt-5">
                <button
                  onClick={() => { setStep('email'); setError(''); setCode(Array(6).fill('')); }}
                  className="text-sm font-medium flex items-center gap-1 cursor-pointer"
                  style={{ color: 'var(--text-2)' }}
                >
                  <ArrowLeft size={14} /> Change email
                </button>
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-sm font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  style={{ color: resendCooldown > 0 ? 'var(--text-3)' : 'var(--secondary)' }}
                >
                  <RotateCcw size={14} />
                  {resendCooldown > 0 ? `${resendCooldown}s` : 'Resend'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
