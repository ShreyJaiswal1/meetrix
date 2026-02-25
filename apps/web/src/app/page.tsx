'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';
import { LogoMark, LogoWordmark } from '@/components/Logo';
import {
  ArrowRight,
  BookOpen,
  Video,
  MessageSquare,
  ClipboardList,
  Upload,
  Users,
  ChevronRight,
  Zap,
  Shield,
  Globe,
  MonitorSmartphone,
  GraduationCap,
} from 'lucide-react';

/* ─── Data ─── */
const features = [
  { icon: BookOpen, title: 'Virtual Classrooms', desc: 'Spin up classes in seconds with auto-generated invite codes. Students join with one tap.', accent: '#7C5CFC' },
  { icon: Upload, title: 'Resource Hub', desc: 'Drag-and-drop notes, slides, PDFs, and links into organized folders your class can access instantly.', accent: '#22D3EE' },
  { icon: ClipboardList, title: 'Smart Assignments', desc: 'Set deadlines, collect submissions, and grade — all without leaving the platform.', accent: '#F59E0B' },
  { icon: Video, title: 'One-Click Live Classes', desc: 'Jump into HD video sessions powered by Jitsi. No downloads. No sign-ups. Just go live.', accent: '#10B981' },
  { icon: MessageSquare, title: 'Class Chat', desc: 'Real-time messaging within each class. Share ideas, ask questions, stay in the loop.', accent: '#EC4899' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Every user — student, teacher, admin — sees exactly what they need and nothing more.', accent: '#3D2DB5' },
];

const steps = [
  { num: '01', title: 'Sign up in 10 seconds', desc: 'Pick your role, enter your name and email. That\'s it — no credit card, no friction.' },
  { num: '02', title: 'Create or join a class', desc: 'Teachers create a class and share the invite code. Students paste the code and they\'re in.' },
  { num: '03', title: 'Start teaching & learning', desc: 'Upload resources, post assignments, go live, chat — everything your classroom needs.' },
];

const stats = [
  { value: 'Free', label: 'forever', sublabel: 'No hidden costs' },
  { value: '< 1min', label: 'to set up', sublabel: 'Zero config needed' },
  { value: '∞', label: 'classes', sublabel: 'No limits at all' },
  { value: '🔒', label: 'secure', sublabel: 'End-to-end safe' },
];

const marqueeItems = [
  'Virtual Classrooms', 'Live Video', 'Real-time Chat', 'Assignment Grading',
  'Resource Sharing', 'Invite Codes', 'Role-based Access', 'PDF Uploads',
  'Student Analytics', 'Session Scheduling', 'Mobile Ready', 'Zero Cost',
];

/* ─── Animated Section Wrapper ─── */
function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.96]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, 60]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ━━━ NAVBAR ━━━ */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-8 lg:px-16 py-3.5" style={{ background: 'rgba(245,243,255,0.7)', backdropFilter: 'blur(20px) saturate(1.6)', borderBottom: '1px solid rgba(226,232,240,0.5)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={44} />
            <LogoWordmark size={76} className="hidden sm:inline-flex" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'About'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-medium transition-colors hover:text-[var(--secondary)]" style={{ color: 'var(--text-2)' }}>
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="px-3 sm:px-4 py-2 text-sm font-semibold rounded-xl transition-colors" style={{ color: 'var(--text-1)' }}>
              Log in
            </Link>
            <Link href="/signup" className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: 'var(--shadow-glow)' }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ━━━ HERO ━━━ */}
      <section ref={heroRef} className="relative overflow-hidden pt-28 sm:pt-36 pb-20 sm:pb-32 px-5 sm:px-8 lg:px-16 grain-overlay">
        {/* Decorative shapes */}
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.12] pointer-events-none" style={{ background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)', top: '-150px', left: '50%', transform: 'translateX(-50%)' }} />
        <div className="absolute w-[250px] h-[250px] rounded-full opacity-[0.08] pointer-events-none float-slow" style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', bottom: '80px', right: '5%' }} />
        <div className="absolute w-[180px] h-[180px] rounded-full opacity-[0.06] pointer-events-none float-medium" style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', top: '200px', left: '5%' }} />

        {/* Floating icons — desktop only */}
        <div className="hidden lg:block">
          <div className="absolute top-32 left-[12%] float-slow opacity-20"><GraduationCap size={40} style={{ color: 'var(--secondary)' }} /></div>
          <div className="absolute top-48 right-[10%] float-medium opacity-15"><Globe size={36} style={{ color: 'var(--accent)' }} /></div>
          <div className="absolute bottom-40 left-[8%] float-fast opacity-15"><MonitorSmartphone size={32} style={{ color: 'var(--primary)' }} /></div>
          <div className="absolute bottom-28 right-[15%] float-slow opacity-10"><Zap size={28} style={{ color: 'var(--warning)' }} /></div>
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{ background: 'rgba(124,92,252,0.08)', color: 'var(--secondary)', border: '1px solid rgba(124,92,252,0.15)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--success)' }} />
            Open-source & free forever
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold leading-[1.1] mb-6 sm:mb-7 tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}
          >
            The classroom{' '}
            <br className="hidden sm:block" />
            that fits in{' '}
            <span className="gradient-text">your pocket</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base sm:text-lg md:text-xl mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2"
            style={{ color: 'var(--text-2)' }}
          >
            Create classes, share resources, go live, grade assignments, and chat with students —
            all from a single, beautifully simple platform. No cost. No complexity.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              href="/signup"
              className="group w-full sm:w-auto px-7 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', boxShadow: 'var(--shadow-glow)' }}
            >
              Start for Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all hover:-translate-y-0.5"
              style={{ borderColor: 'var(--border)', color: 'var(--text-1)', background: 'var(--surface)' }}
            >
              See How It Works <ChevronRight size={16} />
            </Link>
          </motion.div>

          {/* Minimal trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-xs font-medium"
            style={{ color: 'var(--text-3)' }}
          >
            Built with Next.js, Express, and PostgreSQL. Deploys anywhere.
          </motion.p>
        </motion.div>
      </section>

      {/* ━━━ MARQUEE ━━━ */}
      <section className="py-5 overflow-hidden" style={{ background: 'var(--dark-bg)' }}>
        <div className="flex whitespace-nowrap">
          <div className="marquee-track flex items-center gap-8 pr-8">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                <span className="w-1 h-1 rounded-full" style={{ background: 'var(--secondary)' }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ STATS BAND ━━━ */}
      <section className="py-12 sm:py-16 px-5 sm:px-8 lg:px-16" style={{ background: 'var(--surface)' }}>
        <div className="max-w-5xl mx-auto">
          <RevealSection>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="text-center p-5 sm:p-6 rounded-2xl border cursor-default transition-shadow hover:shadow-md"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                >
                  <div className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>{s.value}</div>
                  <div className="text-sm font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-1)' }}>{s.label}</div>
                  <div className="text-xs" style={{ color: 'var(--text-3)' }}>{s.sublabel}</div>
                </motion.div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ━━━ FEATURES ━━━ */}
      <section id="features" className="py-20 sm:py-28 px-5 sm:px-8 lg:px-16" style={{ background: 'var(--bg)' }}>
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-14 sm:mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--secondary)' }}>Capabilities</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5 leading-tight" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
              Everything your school needs.
              <br />
              <span style={{ color: 'var(--text-3)' }}>Nothing it doesn&apos;t.</span>
            </h2>
            <p className="text-sm sm:text-base max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-2)' }}>
              We stripped out the bloat and kept the essentials — then made them really, really good.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <RevealSection key={i} delay={i * 0.06}>
                  <motion.div
                    whileHover={{ y: -6, transition: { duration: 0.25 } }}
                    className="p-6 sm:p-7 rounded-2xl border cursor-default transition-all duration-300 hover:shadow-lg group"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: `${feat.accent}14`, color: feat.accent }}
                    >
                      <Icon size={22} />
                    </div>
                    <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
                      {feat.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                      {feat.desc}
                    </p>
                  </motion.div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS — Sticky Scroll Section ━━━ */}
      <section id="how-it-works" className="py-20 sm:py-28 px-5 sm:px-8 lg:px-16 relative" style={{ background: 'var(--surface)' }}>
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-14 sm:mb-20">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--accent-dark)' }}>Getting Started</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5 leading-tight" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
              From zero to classroom
              <br />
              <span className="gradient-text">in three steps</span>
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <RevealSection key={i} delay={i * 0.12}>
                <div className="relative">
                  {/* Connector line — desktop */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 right-0 w-[calc(100%+2rem)] h-[1px]" style={{ background: 'linear-gradient(90deg, var(--border) 0%, var(--secondary) 50%, var(--border) 100%)', opacity: 0.3, transform: 'translateX(50%)' }} />
                  )}
                  <div className="p-6 sm:p-8 rounded-2xl border relative" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
                    <span className="text-[40px] sm:text-[52px] font-extrabold leading-none mb-4 block" style={{ fontFamily: 'var(--font-heading)', color: 'rgba(124,92,252,0.1)' }}>
                      {step.num}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SOCIAL PROOF / TESTIMONIAL STYLE ━━━ */}
      <section className="py-20 sm:py-28 px-5 sm:px-8 lg:px-16 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
        <div className="max-w-4xl mx-auto">
          <RevealSection>
            <div className="text-center p-8 sm:p-14 rounded-3xl relative" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {/* Decorative quote marks */}
              <span className="text-[80px] sm:text-[120px] font-serif leading-none absolute top-2 sm:top-4 left-6 sm:left-10 select-none" style={{ color: 'rgba(124,92,252,0.07)' }}>&ldquo;</span>

              <p className="text-lg sm:text-xl md:text-2xl font-medium leading-relaxed mb-8 relative z-10 px-2 sm:px-8" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
                We built Meetrix because every free classroom tool we tried felt like it was built
                in 2010. We wanted something that feels like it belongs in your hand —
                <span className="gradient-text font-bold"> fast, beautiful, and effortless.</span>
              </p>

              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                  M
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Meetrix Team</div>
                  <div className="text-xs" style={{ color: 'var(--text-3)' }}>Builders & Educators</div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ━━━ BOTTOM CTA ━━━ */}
      <section id="about" className="py-24 sm:py-32 px-5 sm:px-8 lg:px-16 text-center relative overflow-hidden grain-overlay" style={{ background: 'var(--dark-bg)' }}>
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-15 pointer-events-none spin-slow" style={{ background: 'conic-gradient(from 0deg, var(--secondary), var(--accent), var(--primary), var(--secondary))', top: '-300px', left: '50%', transform: 'translateX(-50%)', filter: 'blur(100px)' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--accent)', border: '1px solid rgba(34,211,238,0.15)' }}>
            <Zap size={12} /> Ready when you are
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Your students are waiting.
            <br />
            <span style={{ color: 'var(--accent)' }}>Let&apos;s go.</span>
          </h2>

          <p className="text-sm sm:text-base mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Set up your first classroom in under a minute. No credit card. No contracts. Just
            a better way to teach and learn.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/signup"
              className="group w-full sm:w-auto px-8 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, var(--secondary), var(--accent))', boxShadow: '0 4px 24px rgba(34,211,238,0.3)' }}
            >
              Create Your Classroom
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all hover:-translate-y-0.5"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
            >
              Sign In <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="py-8 sm:py-10 px-5 sm:px-8 lg:px-16" style={{ background: 'var(--dark-bg)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoMark size={34} />
            <LogoWordmark size={60} className="text-white" />
          </div>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'GitHub'].map((link) => (
              <a key={link} href="#" className="text-xs font-medium transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.3)' }}>{link}</a>
            ))}
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} Meetrix
          </span>
        </div>
      </footer>

    </div>
  );
}
