'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { useClassStore } from '@/stores/classes';
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

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { classes, isLoadingClasses: loading, fetchClasses } = useClassStore();

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    { label: 'Active Classes', value: classes.length, icon: BookOpen },
    { label: 'Total Resources', value: classes.reduce((s, c) => s + c._count.resources, 0), icon: FolderOpen },
    { label: 'Assignments', value: classes.reduce((s, c) => s + c._count.assignments, 0), icon: ClipboardList },
    { label: 'Students', value: classes.reduce((s, c) => s + c._count.members, 0), icon: Users },
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
              className="p-5 flex flex-col gap-3 transition-colors duration-200 border rounded-lg hover:bg-[var(--surface)]"
              style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>{stat.label}</div>
                <Icon size={14} style={{ color: 'var(--text-3)' }} />
              </div>
              <div className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>
                {stat.value}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {[
          { label: 'Create Class', icon: Plus, href: '/dashboard/classes/new', primary: true },
          { label: 'Join Class', icon: BookOpen, href: '/dashboard/classes/join' },
          { label: 'Go Live', icon: Video, href: '/dashboard/live' },
          { label: 'View Analytics', icon: TrendingUp, href: '/dashboard/analytics' },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div key={i} variants={fadeUp}>
              <Link
                href={action.href}
                className="flex items-center gap-2.5 p-3 rounded-lg text-sm font-medium transition-all duration-200 border"
                style={{
                  background: action.primary ? 'var(--text-1)' : 'var(--bg)',
                  color: action.primary ? 'var(--bg)' : 'var(--text-1)',
                  borderColor: action.primary ? 'transparent' : 'var(--border)',
                }}
              >
                <Icon size={16} />
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
            <div key={n} className="h-40 rounded-lg border border-[var(--border)] skeleton" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-12 text-center rounded-lg border border-dashed"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="text-3xl mb-4 opacity-50">📚</div>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-1)' }}>
            No classes found
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>
            Create a new class or join an existing one to get started.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/dashboard/classes/join"
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-[var(--surface)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-1)' }}
            >
              Join a Class
            </Link>
            <Link
              href="/dashboard/classes/new"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'var(--text-1)', color: 'var(--bg)' }}
            >
              Create Class
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.slice(0, 6).map((cls) => (
            <motion.div key={cls.id} variants={fadeUp}>
              <Link href={`/dashboard/classes/${cls.id}`} className="block">
                <div className="rounded-lg border bg-[var(--bg)] transition-colors hover:bg-[var(--surface)] group flex flex-col" style={{ borderColor: 'var(--border)' }}>
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border" style={{ color: 'var(--text-2)', borderColor: 'var(--border)' }}>
                        {cls.subject}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-1)' }}>
                      {cls.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-3)' }}>
                      <span className="flex items-center gap-1.5"><FolderOpen size={12} /> {cls._count.resources}</span>
                      <span className="flex items-center gap-1.5"><ClipboardList size={12} /> {cls._count.assignments}</span>
                      <span className="flex items-center gap-1.5"><Users size={12} /> {cls._count.members}</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium" style={{ background: 'var(--text-1)', color: 'var(--bg)' }}>
                      {cls.teacher.name[0]}
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{cls.teacher.name}</span>
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
