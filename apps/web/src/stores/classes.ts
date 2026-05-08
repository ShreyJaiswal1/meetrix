import { create } from 'zustand';
import api from '@/lib/api';

export interface ClassItem {
  id: string;
  name: string;
  subject: string;
  coverUrl?: string;
  inviteCode: string;
  myRole: string;
  _count: { members: number; resources: number; assignments: number };
  teacher: { id: string; name: string; avatarUrl?: string };
}

export interface ClassMember {
  id: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string; email: string; avatarUrl?: string };
}

export interface ClassDetail {
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

export interface GlobalAssignment {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  maxMarks: number;
  createdAt: string;
  classId: string;
  class: { name: string };
  teacher: { id: string; name: string; avatarUrl?: string };
}

export interface GlobalResource {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  type: string;
  size?: number;
  createdAt: string;
  classId: string;
  class: { name: string };
  uploader: { id: string; name: string; avatarUrl?: string };
}

export interface GlobalSession {
  id: string;
  title: string;
  scheduledAt: string;
  jitsiRoom: string;
  classId: string;
  class: { name: string };
  host: { id: string; name: string; avatarUrl?: string };
}

interface ClassesState {
  classes: ClassItem[];
  globalAssignments: GlobalAssignment[];
  globalResources: GlobalResource[];
  globalSessions: GlobalSession[];
  classDetails: Record<string, { data: ClassDetail; fetchedAt: number }>;
  isLoadingClasses: boolean;
  isLoadingAssignments: boolean;
  isLoadingResources: boolean;
  isLoadingSessions: boolean;
  loadingClassDetails: Record<string, boolean>;
  classesFetchedAt: number;
  assignmentsFetchedAt: number;
  resourcesFetchedAt: number;
  sessionsFetchedAt: number;

  fetchClasses: (force?: boolean) => Promise<void>;
  fetchGlobalAssignments: (force?: boolean) => Promise<void>;
  fetchGlobalResources: (force?: boolean) => Promise<void>;
  fetchGlobalSessions: (force?: boolean) => Promise<void>;
  fetchClassDetail: (id: string, force?: boolean) => Promise<ClassDetail | null>;
}

export const useClassStore = create<ClassesState>((set, get) => ({
  classes: [],
  globalAssignments: [],
  globalResources: [],
  globalSessions: [],
  classDetails: {},
  isLoadingClasses: false,
  isLoadingAssignments: false,
  isLoadingResources: false,
  isLoadingSessions: false,
  loadingClassDetails: {},
  classesFetchedAt: 0,
  assignmentsFetchedAt: 0,
  resourcesFetchedAt: 0,
  sessionsFetchedAt: 0,

  fetchClasses: async (force = false) => {
    const { classesFetchedAt, isLoadingClasses } = get();
    const cacheValid = Date.now() - classesFetchedAt < 5 * 60 * 1000;
    
    // If not forcing, and cache is valid, or it's currently loading and we already have some classes, do nothing
    if (!force && cacheValid) return;
    if (isLoadingClasses && get().classes.length > 0) return;

    // Only show loading if we don't have cached data to prevent layout shift
    if (get().classes.length === 0) {
      set({ isLoadingClasses: true });
    }

    try {
      const res = await api.get('/classes');
      if (res.data.success) {
        set({ classes: res.data.data, classesFetchedAt: Date.now() });
      }
    } finally {
      set({ isLoadingClasses: false });
    }
  },

  fetchGlobalAssignments: async (force = false) => {
    const { assignmentsFetchedAt, isLoadingAssignments } = get();
    const cacheValid = Date.now() - assignmentsFetchedAt < 5 * 60 * 1000;

    if (!force && cacheValid) return;
    if (isLoadingAssignments && get().globalAssignments.length > 0) return;

    if (get().globalAssignments.length === 0) {
      set({ isLoadingAssignments: true });
    }

    try {
      const res = await api.get('/classes/global/assignments');
      if (res.data.success) {
        set({ globalAssignments: res.data.data, assignmentsFetchedAt: Date.now() });
      }
    } finally {
      set({ isLoadingAssignments: false });
    }
  },

  fetchGlobalResources: async (force = false) => {
    const { resourcesFetchedAt, isLoadingResources } = get();
    const cacheValid = Date.now() - resourcesFetchedAt < 5 * 60 * 1000;

    if (!force && cacheValid) return;
    if (isLoadingResources && get().globalResources.length > 0) return;

    if (get().globalResources.length === 0) {
      set({ isLoadingResources: true });
    }

    try {
      const res = await api.get('/classes/global/resources');
      if (res.data.success) {
        set({ globalResources: res.data.data, resourcesFetchedAt: Date.now() });
      }
    } finally {
      set({ isLoadingResources: false });
    }
  },

  fetchGlobalSessions: async (force = false) => {
    const { sessionsFetchedAt, isLoadingSessions } = get();
    const cacheValid = Date.now() - sessionsFetchedAt < 5 * 60 * 1000;

    if (!force && cacheValid) return;
    if (isLoadingSessions && get().globalSessions.length > 0) return;

    if (get().globalSessions.length === 0) {
      set({ isLoadingSessions: true });
    }

    try {
      const res = await api.get('/classes/global/sessions');
      if (res.data.success) {
        set({ globalSessions: res.data.data, sessionsFetchedAt: Date.now() });
      }
    } finally {
      set({ isLoadingSessions: false });
    }
  },

  fetchClassDetail: async (id: string, force = false) => {
    const { classDetails, loadingClassDetails } = get();
    const existing = classDetails[id];
    const cacheValid = existing && (Date.now() - existing.fetchedAt < 5 * 60 * 1000);

    if (!force && cacheValid) return existing.data;
    if (loadingClassDetails[id] && existing) return existing.data;

    set((state) => ({ loadingClassDetails: { ...state.loadingClassDetails, [id]: true } }));

    try {
      const res = await api.get(`/classes/${id}`);
      if (res.data.success) {
        set((state) => ({
          classDetails: { ...state.classDetails, [id]: { data: res.data.data, fetchedAt: Date.now() } }
        }));
        return res.data.data;
      }
      return null;
    } catch {
      return null;
    } finally {
      set((state) => ({ loadingClassDetails: { ...state.loadingClassDetails, [id]: false } }));
    }
  }
}));
