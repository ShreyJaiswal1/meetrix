'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { LogoMark, LogoWordmark } from '@/components/Logo';
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  ClipboardList,
  MessageSquare,
  Video,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/classes', label: 'Classes', icon: BookOpen },
  { href: '/dashboard/resources', label: 'Resources', icon: FolderOpen },
  { href: '/dashboard/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
  { href: '/dashboard/live', label: 'Live Classes', icon: Video },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, fetchUser, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-3 rounded-full"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--secondary)' }}
        />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          width: collapsed ? '72px' : '260px',
          background: 'var(--dark-bg)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {!collapsed ? (
            <LogoWordmark size={86} className="text-white" />
          ) : (
            <LogoMark size={38} />
          )}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) setSidebarOpen(false);
              else setCollapsed(!collapsed);
            }}
            className="p-1.5 rounded-lg cursor-pointer transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {sidebarOpen ? <X size={18} /> : collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  collapsed ? 'justify-center' : ''
                }`}
                style={{
                  background: isActive ? 'rgba(124,92,252,0.2)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                  border: isActive ? '1px solid rgba(124,92,252,0.35)' : '1px solid transparent',
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            href="/dashboard/settings"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${collapsed ? 'justify-center' : ''}`}
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden"
              style={{ background: user.avatarUrl ? 'transparent' : 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user.name}</div>
                <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{user.role}</div>
              </div>
            )}
            {!collapsed && (
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }} className="p-1.5 rounded-lg cursor-pointer transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }} title="Logout">
                <LogOut size={16} />
              </button>
            )}
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-3"
          style={{ background: 'rgba(245,243,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg cursor-pointer"
            style={{ color: 'var(--text-2)' }}
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl cursor-pointer transition-colors" style={{ color: 'var(--text-2)', background: 'var(--surface)' }}>
              <Bell size={18} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full pulse-dot"
                style={{ background: 'var(--error)' }}
              />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
