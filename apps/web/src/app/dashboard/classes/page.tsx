'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import {
  Plus,
  Search,
  FolderOpen,
  ClipboardList,
  Users,
  KeyRound,
} from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  inviteCode: string;
  myRole: string;
  _count: { members: number; resources: number; assignments: number };
  teacher: { id: string; name: string; avatarUrl?: string };
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function ClassesListPage() {
  const user = useAuthStore((s) => s.user);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/classes').then((res) => {
      if (res.data.success) setClasses(res.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = classes.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-1)' }}>
            My Classes
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>{classes.length} classes</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/classes/join"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border"
            style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)', background: 'transparent' }}
          >
            <KeyRound size={16} /> Join Class
          </Link>
          {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
            <Link
              href="/dashboard/classes/new"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: 'var(--shadow-glow)' }}
            >
              <Plus size={16} /> Create Class
            </Link>
          )}
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search classes..."
          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="h-52 skeleton rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>No classes found</h3>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            {search ? 'Try a different search term.' : 'Create or join a class to get started.'}
          </p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cls) => (
            <motion.div key={cls.id} variants={fadeUp}>
              <Link href={`/dashboard/classes/${cls.id}`} className="block">
                <div className="glass-card overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
                  <div className="h-20" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary) 60%, var(--accent))' }}>
                    <div className="p-4 flex justify-between items-start h-full">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                        {cls.subject}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                        {cls.inviteCode}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-2 group-hover:text-[var(--secondary)] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>{cls.name}</h3>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-2)' }}>
                      <span className="flex items-center gap-1"><FolderOpen size={12} /> {cls._count.resources}</span>
                      <span className="flex items-center gap-1"><ClipboardList size={12} /> {cls._count.assignments}</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {cls._count.members}</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-2)' }}>{cls.teacher.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                      background: cls.myRole === 'TEACHER' ? 'rgba(61,45,181,0.12)' : 'var(--success-bg)',
                      color: cls.myRole === 'TEACHER' ? 'var(--primary)' : 'var(--success)',
                    }}>{cls.myRole}</span>
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
