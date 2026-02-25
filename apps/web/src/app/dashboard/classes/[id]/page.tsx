'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
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
  Link as LinkIcon,
  Trash2,
  Crown,
  GraduationCap,
  Pin,
  Send,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

/* ── Interfaces ── */
interface ClassMember {
  id: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string; email: string; avatarUrl?: string };
}
interface Announcement {
  id: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  author: { id: string; name: string; avatarUrl?: string };
}
interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  maxMarks: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  createdAt: string;
  teacher: { id: string; name: string; avatarUrl?: string };
  _count: { submissions: number };
}
interface ClassDetail {
  id: string;
  name: string;
  subject: string;
  description?: string;
  inviteCode: string;
  coverUrl?: string;
  createdAt: string;
  teacher: { id: string; name: string; email: string; avatarUrl?: string };
  members: ClassMember[];
  _count: { resources: number; assignments: number; announcements: number };
}

type Tab = 'overview' | 'announcements' | 'assignments' | 'members' | 'invite';

/* ── Helper ── */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDueDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function dueDateStatus(dateStr: string): { label: string; color: string; bg: string } {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return { label: 'Overdue', color: 'rgb(239,68,68)', bg: 'rgba(239,68,68,0.1)' };
  if (diff < 86400000) return { label: 'Due today', color: 'rgb(234,179,8)', bg: 'rgba(234,179,8,0.1)' };
  if (diff < 3 * 86400000) return { label: 'Due soon', color: 'rgb(249,115,22)', bg: 'rgba(249,115,22,0.1)' };
  return { label: 'Upcoming', color: 'var(--success)', bg: 'var(--success-bg)' };
}

/* ──────────────────────────────── Component ──────────────────────────────── */

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('announcements');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  // Assignments state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100,
  });
  const [creatingAssignment, setCreatingAssignment] = useState(false);

  /* ─── Fetch Class ─── */
  useEffect(() => {
    if (!params.id) return;
    api
      .get(`/classes/${params.id}`)
      .then((res) => {
        if (res.data.success) setCls(res.data.data);
        else router.push('/dashboard/classes');
      })
      .catch(() => router.push('/dashboard/classes'))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  /* ─── Fetch Announcements ─── */
  const fetchAnnouncements = useCallback(async () => {
    if (!params.id) return;
    setAnnouncementsLoading(true);
    try {
      const { data } = await api.get(`/classes/${params.id}/announcements`);
      if (data.success) setAnnouncements(data.data);
    } catch { /* silent */ }
    setAnnouncementsLoading(false);
  }, [params.id]);

  /* ─── Fetch Assignments ─── */
  const fetchAssignments = useCallback(async () => {
    if (!params.id) return;
    setAssignmentsLoading(true);
    try {
      const { data } = await api.get(`/classes/${params.id}/assignments`);
      if (data.success) setAssignments(data.data);
    } catch { /* silent */ }
    setAssignmentsLoading(false);
  }, [params.id]);

  /* ─── Lazy-load tab data ─── */
  useEffect(() => {
    if (activeTab === 'announcements' && announcements.length === 0) fetchAnnouncements();
    if (activeTab === 'assignments' && assignments.length === 0) fetchAssignments();
  }, [activeTab, fetchAnnouncements, fetchAssignments, announcements.length, assignments.length]);

  /* ─── Actions ─── */
  const postAnnouncement = async () => {
    if (!newAnnouncement.trim() || !params.id) return;
    setPostingAnnouncement(true);
    try {
      const { data } = await api.post(`/classes/${params.id}/announcements`, { content: newAnnouncement.trim() });
      if (data.success) {
        setAnnouncements((prev) => [data.data, ...prev]);
        setNewAnnouncement('');
        toast.success('Announcement posted!');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to post announcement');
    }
    setPostingAnnouncement(false);
  };

  const createAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.dueDate || !params.id) return;
    setCreatingAssignment(true);
    try {
      const { data } = await api.post(`/classes/${params.id}/assignments`, {
        title: assignmentForm.title,
        description: assignmentForm.description || undefined,
        dueDate: new Date(assignmentForm.dueDate).toISOString(),
        maxMarks: assignmentForm.maxMarks,
      });
      if (data.success) {
        setAssignments((prev) => [data.data, ...prev]);
        setShowCreateAssignment(false);
        setAssignmentForm({ title: '', description: '', dueDate: '', maxMarks: 100 });
        toast.success('Assignment created!');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to create assignment');
    }
    setCreatingAssignment(false);
  };

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
  const copyInviteLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
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
    { key: 'members', label: `Members (${cls.members.length})`, icon: Users },
    { key: 'overview', label: 'Overview', icon: FolderOpen },
    { key: 'invite', label: 'Invite', icon: Share2 },
  ];

  /* ─── Avatar helper ─── */
  const Avatar = ({ src, name, size = 9 }: { src?: string; name: string; size?: number }) => (
    <div
      className={`w-${size} h-${size} rounded-full overflow-hidden flex items-center justify-center flex-shrink-0`}
      style={{
        width: size * 4,
        height: size * 4,
        background: src ? 'transparent' : 'linear-gradient(135deg, var(--primary), var(--accent))',
      }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
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

        {/* ─── ANNOUNCEMENTS ─── */}
        {activeTab === 'announcements' && (
          <motion.div key="announcements" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Compose Box (Teacher) */}
            {isClassTeacher && (
              <div className="glass-card p-4 mb-4">
                <div className="flex gap-3">
                  <Avatar src={user?.avatarUrl} name={user?.name || ''} size={10} />
                  <div className="flex-1">
                    <textarea
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      placeholder="Share an announcement with your class..."
                      rows={2}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border resize-none"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                    />
                    <div className="flex justify-end mt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={postAnnouncement}
                        disabled={postingAnnouncement || !newAnnouncement.trim()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                      >
                        {postingAnnouncement ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={13} /> Post</>}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Announcements Feed */}
            {announcementsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => <div key={n} className="h-24 skeleton rounded-2xl" />)}
              </div>
            ) : announcements.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Megaphone size={32} className="mx-auto mb-3" style={{ color: 'var(--text-3)' }} />
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>No announcements yet</h3>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  {isClassTeacher ? 'Share updates with your class above.' : 'Your teacher will post announcements here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar src={a.author.avatarUrl} name={a.author.name} size={9} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{a.author.name}</span>
                          {a.pinned && <Pin size={11} style={{ color: 'var(--warning)' }} />}
                          <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{timeAgo(a.createdAt)}</span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-2)' }}>{a.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── ASSIGNMENTS ─── */}
        {activeTab === 'assignments' && (
          <motion.div key="assignments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Teacher: Create Button */}
            {isClassTeacher && (
              <div className="mb-4">
                {!showCreateAssignment ? (
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateAssignment(true)}
                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--surface)' }}
                  >
                    <Plus size={16} /> Create Assignment
                  </motion.button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>New Assignment</h3>
                      <button onClick={() => setShowCreateAssignment(false)} className="cursor-pointer" style={{ color: 'var(--text-3)' }}><X size={16} /></button>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>Title</label>
                        <input
                          type="text"
                          value={assignmentForm.title}
                          onChange={(e) => setAssignmentForm((f) => ({ ...f, title: e.target.value }))}
                          placeholder="e.g. Chapter 5 Problem Set"
                          className="w-full px-3 py-2.5 text-sm rounded-xl border"
                          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>Description (optional)</label>
                        <textarea
                          value={assignmentForm.description}
                          onChange={(e) => setAssignmentForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="Instructions for students..."
                          rows={2}
                          className="w-full px-3 py-2.5 text-sm rounded-xl border resize-none"
                          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>Due Date</label>
                          <input
                            type="datetime-local"
                            value={assignmentForm.dueDate}
                            onChange={(e) => setAssignmentForm((f) => ({ ...f, dueDate: e.target.value }))}
                            className="w-full px-3 py-2.5 text-sm rounded-xl border"
                            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-2)' }}>Max Marks</label>
                          <input
                            type="number"
                            value={assignmentForm.maxMarks}
                            onChange={(e) => setAssignmentForm((f) => ({ ...f, maxMarks: parseInt(e.target.value) || 0 }))}
                            className="w-full px-3 py-2.5 text-sm rounded-xl border"
                            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
                          />
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={createAssignment}
                        disabled={creatingAssignment || !assignmentForm.title || !assignmentForm.dueDate}
                        className="w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                      >
                        {creatingAssignment ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 size={14} /> Create Assignment</>}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Assignment List */}
            {assignmentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => <div key={n} className="h-28 skeleton rounded-2xl" />)}
              </div>
            ) : assignments.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <ClipboardList size={32} className="mx-auto mb-3" style={{ color: 'var(--text-3)' }} />
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>No assignments yet</h3>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  {isClassTeacher ? 'Create your first assignment above.' : 'Assignments will appear here when your teacher posts them.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((a, i) => {
                  const due = dueDateStatus(a.dueDate);
                  return (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="glass-card p-5 transition-all hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold" style={{ color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>{a.title}</h3>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: due.bg, color: due.color }}>
                              {due.label}
                            </span>
                            {a.status === 'CLOSED' && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--bg)', color: 'var(--text-3)' }}>Closed</span>
                            )}
                          </div>
                          {a.description && (
                            <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-2)' }}>{a.description}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <div className="text-lg font-bold" style={{ color: 'var(--secondary)' }}>{a.maxMarks}</div>
                          <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>marks</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-3)' }}>
                        <span className="flex items-center gap-1"><Calendar size={11} /> {formatDueDate(a.dueDate)}</span>
                        <span className="flex items-center gap-1"><Users size={11} /> {a._count.submissions} submitted</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(a.createdAt)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── MEMBERS ─── */}
        {activeTab === 'members' && (
          <motion.div key="members" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="glass-card overflow-hidden">
              <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Class Members</h3>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg)', color: 'var(--text-2)' }}>{cls.members.length} total</span>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {cls.members.map((member, i) => (
                  <motion.div key={member.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={member.user.avatarUrl} name={member.user.name} />
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                          {member.user.name}
                          {member.user.id === user?.id && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg)', color: 'var(--text-3)' }}>You</span>}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-3)' }}>{member.user.email}</div>
                      </div>
                    </div>
                    {member.role === 'TEACHER' ? (
                      <span className="text-[10px] font-semibold flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(61,45,181,0.12)', color: 'var(--primary)' }}><Crown size={10} /> Teacher</span>
                    ) : (
                      <span className="text-[10px] font-semibold flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><GraduationCap size={10} /> Student</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Resources', count: cls._count.resources, Icon: FolderOpen },
                { label: 'Assignments', count: cls._count.assignments, Icon: ClipboardList },
                { label: 'Announcements', count: cls._count.announcements, Icon: Megaphone },
              ].map(({ label, count, Icon }) => (
                <div key={label} className="glass-card p-5 flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,92,252,0.1)' }}>
                    <Icon size={18} style={{ color: 'var(--secondary)' }} />
                  </div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>{count}</div>
                  <div className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Teacher Card */}
            <div className="glass-card p-5 mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-2)' }}>Class Teacher</h3>
              <div className="flex items-center gap-3">
                <Avatar src={cls.teacher.avatarUrl} name={cls.teacher.name} size={10} />
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                    {cls.teacher.name} <Crown size={12} style={{ color: 'var(--warning)' }} />
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-3)' }}>{cls.teacher.email}</div>
                </div>
              </div>
            </div>

            {isClassTeacher && (
              <div className="rounded-2xl border p-5" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'var(--surface)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgb(239,68,68)' }}>Danger Zone</h3>
                <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors disabled:opacity-50" style={{ color: 'rgb(239,68,68)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete Class'}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── INVITE ─── */}
        {activeTab === 'invite' && (
          <motion.div key="invite" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Share this class</h3>
              <div className="mb-5">
                <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-2)' }}>Invite Code</label>
                <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                  <span className="text-2xl font-mono font-extrabold tracking-[0.2em]" style={{ color: 'var(--secondary)' }}>{cls.inviteCode}</span>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyInviteCode} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors" style={{ background: copiedCode ? 'rgba(34,197,94,0.1)' : 'var(--surface)', color: copiedCode ? 'rgb(34,197,94)' : 'var(--text-2)', border: `1px solid ${copiedCode ? 'rgba(34,197,94,0.3)' : 'var(--border)'}` }}>
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />} {copiedCode ? 'Copied' : 'Copy'}
                  </motion.button>
                </div>
              </div>
              <div className="mb-5">
                <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-2)' }}>Invite Link</label>
                <div className="flex items-center justify-between p-3 rounded-xl border gap-3" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <LinkIcon size={14} className="flex-shrink-0" style={{ color: 'var(--text-3)' }} />
                    <span className="text-xs truncate font-mono" style={{ color: 'var(--text-2)' }}>{inviteUrl}</span>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyInviteLink} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex-shrink-0" style={{ background: copiedLink ? 'rgba(34,197,94,0.1)' : 'var(--surface)', color: copiedLink ? 'rgb(34,197,94)' : 'var(--text-2)', border: `1px solid ${copiedLink ? 'rgba(34,197,94,0.3)' : 'var(--border)'}` }}>
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />} {copiedLink ? 'Copied' : 'Copy'}
                  </motion.button>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (navigator.share) {
                    try { await navigator.share({ title: `Join "${cls.name}" on Meetrix`, text: `Use invite code ${cls.inviteCode} to join "${cls.name}" on Meetrix!`, url: inviteUrl }); } catch {}
                  } else { copyInviteLink(); }
                }}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border"
                style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
              >
                <Share2 size={16} /> Share with Students
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
