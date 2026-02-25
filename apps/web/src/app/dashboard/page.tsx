'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import api from '@/lib/api';
import {
  BookOpen,
  Plus,
  ClipboardList,
  Video,
  TrendingUp,
  Clock,
  Users,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  coverUrl?: string;
  inviteCode: string;
  myRole: string;
  _count: { members: number; resources: number; assignments: number };
  teacher: { id: string; name: string; avatarUrl?: string };
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/classes')
      .then((res) => {
        if (res.data.success) setClasses(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    { label: 'Active Classes', value: classes.length, icon: BookOpen, color: 'var(--secondary)' },
    { label: 'Total Resources', value: classes.reduce((s, c) => s + c._count.resources, 0), icon: FolderOpen, color: 'var(--accent)' },
    { label: 'Assignments', value: classes.reduce((s, c) => s + c._count.assignments, 0), icon: ClipboardList, color: 'var(--warning)' },
    { label: 'Students', value: classes.reduce((s, c) => s + c._count.members, 0), icon: Users, color: 'var(--success)' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-2)' }}>
          {greeting()} 👋
        </p>
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
          {user?.name}
        </h1>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              variants={fadeUp}
              className="glass-card p-5 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:shadow-md"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${stat.color}18`, color: stat.color }}
              >
                <Icon size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
                  {stat.value}
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Create Class', icon: Plus, href: '/dashboard/classes/new', gradient: 'linear-gradient(135deg, var(--primary), var(--secondary))' },
          { label: 'Join Class', icon: BookOpen, href: '/dashboard/classes/join', gradient: 'linear-gradient(135deg, #0891B2, var(--accent))' },
          { label: 'Go Live', icon: Video, href: '/dashboard/live', gradient: 'linear-gradient(135deg, #7C3AED, #EC4899)' },
          { label: 'View Analytics', icon: TrendingUp, href: '/dashboard/analytics', gradient: 'linear-gradient(135deg, var(--success), #059669)' },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div key={i} variants={fadeUp}>
              <Link
                href={action.href}
                className="flex items-center gap-3 p-3.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: action.gradient }}
              >
                <Icon size={18} />
                <span>{action.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* My Classes */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
          My Classes
        </h2>
        <Link
          href="/dashboard/classes"
          className="text-sm font-medium flex items-center gap-1 transition-colors"
          style={{ color: 'var(--secondary)' }}
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card h-48 skeleton" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
            No classes yet
          </h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>
            {user?.role === 'STUDENT'
              ? 'Join a class using an invite code to get started.'
              : 'Create your first class to start sharing resources.'}
          </p>
          <Link
            href={user?.role === 'STUDENT' ? '/dashboard/classes/join' : '/dashboard/classes/new'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
          >
            {user?.role === 'STUDENT' ? 'Join a Class' : 'Create a Class'} <ArrowRight size={14} />
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.slice(0, 6).map((cls) => (
            <motion.div key={cls.id} variants={fadeUp}>
              <Link href={`/dashboard/classes/${cls.id}`} className="block">
                <div className="glass-card overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
                  {/* Header Gradient */}
                  <div
                    className="h-20 relative"
                    style={{
                      background: `linear-gradient(135deg, var(--primary) 0%, var(--secondary) 60%, var(--accent) 100%)`,
                    }}
                  >
                    <div className="absolute bottom-3 left-4">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                        style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                      >
                        {cls.subject}
                      </span>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1.5 group-hover:text-[var(--secondary)] transition-colors" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
                      {cls.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-2)' }}>
                      <span className="flex items-center gap-1"><FolderOpen size={12} /> {cls._count.resources}</span>
                      <span className="flex items-center gap-1"><ClipboardList size={12} /> {cls._count.assignments}</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {cls._count.members}</span>
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                      >
                        {cls.teacher.name[0]}
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{cls.teacher.name}</span>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: cls.myRole === 'TEACHER' ? 'rgba(61,45,181,0.12)' : 'var(--success-bg)',
                        color: cls.myRole === 'TEACHER' ? 'var(--primary)' : 'var(--success)',
                      }}
                    >
                      {cls.myRole}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
