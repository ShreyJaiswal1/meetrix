'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth';
import { useClassStore, ClassDetail } from '@/stores/classes';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Users,
  FolderOpen,
  ClipboardList,
  Megaphone,
  Copy,
  Check,
  Share2,
  Video,
} from 'lucide-react';

/* ── Components ── */
import AnnouncementsTab from './components/AnnouncementsTab';
import AssignmentsTab from './components/AssignmentsTab';
import MembersTab from './components/MembersTab';
import OverviewTab from './components/OverviewTab';
import InviteTab from './components/InviteTab';
import ResourcesTab from './components/ResourcesTab';
import LiveSessionsTab from './components/LiveSessionsTab';
import { timeAgo, formatDueDate, dueDateStatus } from './components/utils';

/* ── Interfaces ── */
// Imported ClassDetail from store

type Tab = 'overview' | 'announcements' | 'assignments' | 'resources' | 'live' | 'members' | 'invite';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { fetchClassDetail, classDetails, loadingClassDetails } = useClassStore();
  
  const classIdStr = typeof params.id === 'string' ? params.id : params.id?.[0];
  const cls = classIdStr ? classDetails[classIdStr]?.data : null;
  const loading = classIdStr ? (loadingClassDetails[classIdStr] ?? true) : false;

  const [activeTab, setActiveTab] = useState<Tab>('announcements');
  const [copiedCode, setCopiedCode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ─── Fetch Class ─── */
  useEffect(() => {
    if (!classIdStr) return;
    
    // We initially check if it's already there
    const existing = useClassStore.getState().classDetails[classIdStr]?.data;
    if (!existing && !useClassStore.getState().loadingClassDetails[classIdStr]) {
       // Only if it doesn't exist at all, we show loading
    }
    
    fetchClassDetail(classIdStr).then((data) => {
      if (!data) router.push('/dashboard/classes');
    });
  }, [classIdStr, fetchClassDetail, router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-36 skeleton rounded-2xl mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((n) => <div key={n} className="h-24 skeleton rounded-xl" />)}
        </div>
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  if (!cls) return null;

  const isTeacher = cls.teacher.id === user?.id;
  const myMembership = cls.members.find((m) => m.user.id === user?.id);
  const isClassTeacher = isTeacher || myMembership?.role === 'TEACHER';
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/dashboard/classes/join?code=${cls.inviteCode}`
    : '';

  const copyInviteCode = async () => {
    await navigator.clipboard.writeText(cls.inviteCode);
    setCopiedCode(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this class? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/classes/${cls.id}`);
      toast.success('Class deleted');
      router.push('/dashboard/classes');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to delete class');
    } finally { setDeleting(false); }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'announcements', label: 'Announcements', icon: Megaphone },
    { key: 'assignments', label: 'Assignments', icon: ClipboardList },
    { key: 'resources', label: 'Resources', icon: FolderOpen },
    { key: 'live', label: 'Live', icon: Video },
    { key: 'members', label: `Members (${cls.members.length})`, icon: Users },
    { key: 'overview', label: 'Overview', icon: FolderOpen },
    { key: 'invite', label: 'Invite', icon: Share2 },
  ];

  /* ─── Avatar helper ─── */
  const Avatar = ({ src, name, size = 9 }: { src?: string; name: string; size?: number }) => (
    <div
      className={`w-${size} h-${size} rounded-full overflow-hidden flex items-center justify-center shrink-0`}
      style={{
        width: size * 4,
        height: size * 4,
        background: src ? 'transparent' : 'linear-gradient(135deg, var(--primary), var(--accent))',
      }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <span className="text-xs font-bold text-white">
          {name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/dashboard/classes" className="inline-flex items-center gap-2 text-sm font-medium mb-4 transition-colors" style={{ color: 'var(--text-2)' }}>
        <ArrowLeft size={16} /> Back to Classes
      </Link>

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden mb-6"
        style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary) 60%, var(--accent))' }}
      >
        <div className="p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-2 inline-block" style={{ background: 'rgba(255,255,255,0.2)' }}>
                {cls.subject}
              </span>
              <h1 className="text-2xl font-extrabold mt-2" style={{ fontFamily: 'var(--font-heading)' }}>{cls.name}</h1>
              {cls.description && <p className="text-sm mt-1 opacity-80 max-w-lg">{cls.description}</p>}
            </div>
            {isClassTeacher && (
              <button onClick={copyInviteCode} className="text-xs font-mono font-bold px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                {cls.inviteCode} {copiedCode ? <Check size={12} /> : <Copy size={12} />}
              </button>
            )}
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-1.5 opacity-80"><Users size={14} /> {cls.members.length} members</div>
            <div className="flex items-center gap-1.5 opacity-80"><FolderOpen size={14} /> {cls._count.resources} resources</div>
            <div className="flex items-center gap-1.5 opacity-80"><ClipboardList size={14} /> {cls._count.assignments} assignments</div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto no-scrollbar" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold flex-1 justify-center cursor-pointer transition-all whitespace-nowrap"
              style={{ background: isActive ? 'var(--bg)' : 'transparent', color: isActive ? 'var(--text-1)' : 'var(--text-3)', boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* ═══════════ Tab Content ═══════════ */}
      <AnimatePresence mode="wait">
        {activeTab === 'announcements' && (
          <AnnouncementsTab
            key="announcements"
            classId={cls.id}
            isClassTeacher={isClassTeacher}
            user={user}
            Avatar={Avatar}
            timeAgo={timeAgo}
          />
        )}
        {activeTab === 'assignments' && (
          <AssignmentsTab
            key="assignments"
            classId={cls.id}
            isClassTeacher={isClassTeacher}
            formatDueDate={formatDueDate}
            dueDateStatus={dueDateStatus}
            timeAgo={timeAgo}
          />
        )}
        {activeTab === 'resources' && (
          <ResourcesTab
            key="resources"
            classId={cls.id}
            isClassTeacher={isClassTeacher}
            userId={user?.id || ''}
            timeAgo={timeAgo}
          />
        )}
        {activeTab === 'live' && (
          <LiveSessionsTab
            key="live"
            classId={cls.id}
            isClassTeacher={isClassTeacher}
            formatDueDate={formatDueDate}
            timeAgo={timeAgo}
          />
        )}
        {activeTab === 'members' && (
          <MembersTab
            key="members"
            members={cls.members}
            user={user}
            Avatar={Avatar}
          />
        )}
        {activeTab === 'overview' && (
          <OverviewTab
            key="overview"
            cls={cls}
            isClassTeacher={isClassTeacher}
            deleting={deleting}
            handleDelete={handleDelete}
            Avatar={Avatar}
          />
        )}
        {activeTab === 'invite' && (
          <InviteTab
            key="invite"
            inviteCode={cls.inviteCode}
            inviteUrl={inviteUrl}
            clsName={cls.name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
