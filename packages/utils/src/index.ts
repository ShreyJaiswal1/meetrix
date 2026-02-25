// ─── Invite Code Generator ───
export function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'MTX-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ─── Date Formatters ───
export function formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export function formatDueDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return `Due ${date.toLocaleDateString()}`;
}

// ─── Validators ───
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidInviteCode(code: string): boolean {
    return /^MTX-[A-Z0-9]{4}$/.test(code);
}

export function isValidPassword(password: string): boolean {
    return password.length >= 8;
}

// ─── String Helpers ───
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 3) + '...';
}

// ─── File Helpers ───
export function getFileExtension(filename: string): string {
    return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
}

export function getResourceType(
    filename: string
): 'PDF' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LINK' {
    const ext = getFileExtension(filename);
    if (ext === 'pdf') return 'PDF';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext))
        return 'IMAGE';
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'VIDEO';
    return 'DOCUMENT';
}

// ─── Constants ───
export const ROLES = {
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER',
    STUDENT: 'STUDENT',
} as const;

export const COLORS = {
    primary: '#3D2DB5',
    secondary: '#7C5CFC',
    accent: '#22D3EE',
    background: '#F5F3FF',
    surface: '#FFFFFF',
    darkBg: '#0F0E2E',
    text1: '#1A1A2E',
    text2: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#F43F5E',
} as const;
