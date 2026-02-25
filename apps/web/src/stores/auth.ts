import { create } from 'zustand';
import type { User } from '@meetrix/types';
import api from '@/lib/api';

interface AuthState {
    user: (User & { onboarded?: boolean; emailVerified?: boolean }) | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<{ needsVerification: boolean; email: string }>;
    googleLogin: (credential: string) => Promise<{ isNewUser: boolean }>;
    onboard: (data: { name: string; role: string; avatarUrl?: string | null }) => Promise<void>;
    verifyEmail: (email: string, code: string) => Promise<void>;
    resendVerification: (email: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
    updateProfile: (data: { name?: string; avatarUrl?: string | null }) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        if (data.success) {
            localStorage.setItem('meetrix_token', data.data.accessToken);
            localStorage.setItem('meetrix_refresh', data.data.refreshToken);
            set({ user: data.data.user, isAuthenticated: true, isLoading: false });
        } else {
            throw new Error(data.error || 'Login failed');
        }
    },

    register: async (email, password) => {
        const { data } = await api.post('/auth/register', { email, password });
        if (data.success) {
            return { needsVerification: data.data.needsVerification, email: data.data.email };
        } else {
            throw new Error(data.error || 'Registration failed');
        }
    },

    googleLogin: async (credential) => {
        const { data } = await api.post('/auth/google', { credential });
        if (data.success) {
            localStorage.setItem('meetrix_token', data.data.accessToken);
            localStorage.setItem('meetrix_refresh', data.data.refreshToken);
            set({ user: data.data.user, isAuthenticated: true, isLoading: false });
            return { isNewUser: data.data.isNewUser || false };
        } else {
            throw new Error(data.error || 'Google login failed');
        }
    },

    verifyEmail: async (email, code) => {
        const { data } = await api.post('/auth/verify-email', { email, code });
        if (data.success) {
            localStorage.setItem('meetrix_token', data.data.accessToken);
            localStorage.setItem('meetrix_refresh', data.data.refreshToken);
            set({ user: data.data.user, isAuthenticated: true, isLoading: false });
        } else {
            throw new Error(data.error || 'Verification failed');
        }
    },

    resendVerification: async (email) => {
        const { data } = await api.post('/auth/resend-verification', { email });
        if (!data.success) {
            throw new Error(data.error || 'Failed to resend code');
        }
    },

    forgotPassword: async (email) => {
        const { data } = await api.post('/auth/forgot-password', { email });
        if (!data.success) {
            throw new Error(data.error || 'Failed to send reset code');
        }
    },

    resetPassword: async (email, code, newPassword) => {
        const { data } = await api.post('/auth/reset-password', { email, code, newPassword });
        if (!data.success) {
            throw new Error(data.error || 'Password reset failed');
        }
    },

    onboard: async (onboardData) => {
        const { data } = await api.put('/auth/onboard', onboardData);
        if (data.success) {
            localStorage.setItem('meetrix_token', data.data.accessToken);
            localStorage.setItem('meetrix_refresh', data.data.refreshToken);
            set({ user: data.data.user, isAuthenticated: true, isLoading: false });
        } else {
            throw new Error(data.error || 'Onboarding failed');
        }
    },

    updateProfile: async (profileData) => {
        const { data } = await api.put('/auth/profile', profileData);
        if (data.success) {
            set({ user: data.data });
        } else {
            throw new Error(data.error || 'Profile update failed');
        }
    },

    logout: () => {
        localStorage.removeItem('meetrix_token');
        localStorage.removeItem('meetrix_refresh');
        set({ user: null, isAuthenticated: false, isLoading: false });
        window.location.href = '/login';
    },

    fetchUser: async () => {
        try {
            const token = localStorage.getItem('meetrix_token');
            if (!token) {
                set({ isLoading: false });
                return;
            }
            const { data } = await api.get('/auth/me');
            if (data.success) {
                set({ user: data.data, isAuthenticated: true, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },
}));
