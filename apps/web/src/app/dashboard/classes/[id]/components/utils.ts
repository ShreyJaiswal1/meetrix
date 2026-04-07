'use client';

export function timeAgo(dateStr: string) {
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

export function formatDueDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function dueDateStatus(dateStr: string): { label: string; color: string; bg: string } {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff < 0) return { label: 'Overdue', color: 'rgb(239,68,68)', bg: 'rgba(239,68,68,0.1)' };
    if (diff < 86400000) return { label: 'Due today', color: 'rgb(234,179,8)', bg: 'rgba(234,179,8,0.1)' };
    if (diff < 3 * 86400000) return { label: 'Due soon', color: 'rgb(249,115,22)', bg: 'rgba(249,115,22,0.1)' };
    return { label: 'Upcoming', color: 'var(--success)', bg: 'var(--success-bg)' };
}
