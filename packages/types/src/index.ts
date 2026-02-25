// ─── User ───
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: UserRole;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// ─── Class ───
export interface Class {
    id: string;
    name: string;
    subject: string;
    description?: string;
    inviteCode: string;
    coverUrl?: string;
    teacherId: string;
    teacher?: User;
    memberCount?: number;
    createdAt: string;
}

export interface ClassMember {
    id: string;
    classId: string;
    userId: string;
    role: 'TEACHER' | 'STUDENT';
    user?: User;
    joinedAt: string;
}

// ─── Resource ───
export type ResourceType = 'PDF' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LINK';

export interface Resource {
    id: string;
    classId: string;
    uploaderId: string;
    uploader?: User;
    title: string;
    type: ResourceType;
    url: string;
    folder?: string;
    createdAt: string;
}

// ─── Assignment ───
export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export interface Assignment {
    id: string;
    classId: string;
    teacherId: string;
    teacher?: User;
    title: string;
    description?: string;
    dueDate: string;
    maxMarks: number;
    status: AssignmentStatus;
    attachments?: string[];
    createdAt: string;
}

export interface Submission {
    id: string;
    assignmentId: string;
    studentId: string;
    student?: User;
    fileUrl?: string;
    textBody?: string;
    marks?: number;
    feedback?: string;
    submittedAt: string;
}

// ─── Announcement ───
export interface Announcement {
    id: string;
    classId: string;
    authorId: string;
    author?: User;
    content: string;
    pinned: boolean;
    createdAt: string;
}

// ─── Chat ───
export interface Message {
    id: string;
    roomId: string;
    senderId: string;
    sender?: User;
    content: string;
    fileUrl?: string;
    createdAt: string;
}

// ─── Live Session ───
export interface LiveSession {
    id: string;
    classId: string;
    hostId: string;
    host?: User;
    title: string;
    scheduledAt: string;
    jitsiRoom: string;
    recordingUrl?: string;
    isLive?: boolean;
}

// ─── Notification ───
export type NotificationType =
    | 'ASSIGNMENT_CREATED'
    | 'SUBMISSION_GRADED'
    | 'ANNOUNCEMENT'
    | 'SESSION_LIVE'
    | 'MESSAGE'
    | 'CLASS_JOINED';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    content: string;
    read: boolean;
    createdAt: string;
}

// ─── API Response Wrappers ───
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
