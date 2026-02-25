'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { LogoFull } from '@/components/Logo';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      router.push(user?.onboarded === false ? '/onboarding' : '/dashboard');
    } catch (err: any) {
      // If user needs email verification, redirect them
      if (err?.response?.data?.needsVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(err.response.data.email)}`);
        return;
      }
      toast.error(err?.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const { isNewUser } = await googleLogin(tokenResponse.access_token);
        router.push(isNewUser ? '/onboarding' : '/dashboard');
      } catch (err: any) {
        toast.error(err?.response?.data?.error || err.message || 'Google login failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error('Google login was cancelled or failed');
    },
  });

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left Panel — Branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center"
        style={{ background: 'var(--dark-bg)' }}
      >
        {/* Background Glow */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)',
            top: '-100px',
            right: '-100px',
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
            bottom: '-50px',
            left: '50px',
          }}
        />

        <div className="relative z-10 px-16 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <LogoFull size={40} className="mb-6 text-white" />
            <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              Your all-in-one virtual classroom. Join classes, share resources, attend live sessions,
              and ace your assignments — all in one beautifully crafted platform.
            </p>

            <div className="flex flex-col gap-4">
              {[
                { icon: '📚', text: 'Share resources and notes' },
                { icon: '🎥', text: 'Host live video classes' },
                { icon: '📋', text: 'Manage assignments & grades' },
                { icon: '💬', text: 'Real-time class chat' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <LogoFull size={32} />
          </div>

          <div className="glass-card p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
                Welcome back
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                Sign in to your Meetrix account
              </p>
            </div>



            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 border transition-all duration-200 cursor-pointer hover:shadow-md disabled:opacity-60"
              style={{
                background: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--text-1)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
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

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border transition-all duration-200"
                    style={{
                      background: 'var(--bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-1)',
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: 'var(--text-3)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="text-center mt-6 flex flex-col gap-2">
              <Link
                href="/forgot-password"
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--text-2)' }}
              >
                Forgot password?
              </Link>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="font-semibold transition-colors"
                  style={{ color: 'var(--secondary)' }}
                >
                  Sign up free
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs mt-6 flex items-center justify-center gap-1" style={{ color: 'var(--text-3)' }}>
            <Sparkles size={12} /> Built for modern classrooms
          </p>
        </motion.div>
      </div>
    </div>
  );
}
