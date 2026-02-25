import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';
import { generateOTP, sendVerificationEmail, sendPasswordResetEmail } from '../lib/email';

export const authRouter = Router();

// ─── Schemas ───
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const googleLoginSchema = z.object({
    credential: z.string(),
});

const onboardSchema = z.object({
    name: z.string().min(2).max(50),
    role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
    avatarUrl: z.string().url().optional().nullable(),
});

const verifyEmailSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
});

const resendVerificationSchema = z.object({
    email: z.string().email(),
});

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

const resetPasswordSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(8),
});

// ─── Helpers ───
function generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

function sanitizeUser(user: any) {
    return { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, onboarded: user.onboarded ?? true, emailVerified: user.emailVerified ?? false, createdAt: user.createdAt };
}

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

// ─── Register (Email/Password) ───
authRouter.post('/register', async (req, res: Response) => {
    try {
        const data = registerSchema.parse(req.body);
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            res.status(409).json({ success: false, error: 'Email already registered' });
            return;
        }

        const passwordHash = await bcrypt.hash(data.password, 12);
        await prisma.user.create({
            data: { name: data.email.split('@')[0], email: data.email, passwordHash, provider: 'EMAIL', onboarded: false, emailVerified: false },
        });

        // Generate and send OTP
        const code = generateOTP();
        await prisma.verificationCode.create({
            data: {
                email: data.email,
                code,
                type: 'EMAIL_VERIFY',
                expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
            },
        });

        await sendVerificationEmail(data.email, code);

        res.status(201).json({ success: true, data: { needsVerification: true, email: data.email } });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ success: false, error: err.errors[0].message });
            return;
        }
        console.error('Registration error:', err);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

// ─── Verify Email ───
authRouter.post('/verify-email', async (req, res: Response) => {
    try {
        const data = verifyEmailSchema.parse(req.body);

        const record = await prisma.verificationCode.findFirst({
            where: {
                email: data.email,
                code: data.code,
                type: 'EMAIL_VERIFY',
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!record) {
            res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
            return;
        }

        // Mark email as verified
        const user = await prisma.user.update({
            where: { email: data.email },
            data: { emailVerified: true },
            select: { id: true, name: true, email: true, role: true, avatarUrl: true, onboarded: true, emailVerified: true, createdAt: true },
        });

        // Clean up used codes
        await prisma.verificationCode.deleteMany({
            where: { email: data.email, type: 'EMAIL_VERIFY' },
        });

        const tokens = generateTokens(user.id, user.role);
        res.json({ success: true, data: { user, ...tokens } });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ success: false, error: err.errors[0].message });
            return;
        }
        console.error('Verify email error:', err);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
});

// ─── Resend Verification Code ───
authRouter.post('/resend-verification', async (req, res: Response) => {
    try {
        const data = resendVerificationSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            // Don't reveal if user exists
            res.json({ success: true, data: { sent: true } });
            return;
        }

        if (user.emailVerified) {
            res.status(400).json({ success: false, error: 'Email is already verified' });
            return;
        }

        // Rate-limit: check if a code was sent recently
        const recentCode = await prisma.verificationCode.findFirst({
            where: {
                email: data.email,
                type: 'EMAIL_VERIFY',
                createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) },
            },
        });

        if (recentCode) {
            res.status(429).json({ success: false, error: 'Please wait before requesting a new code' });
            return;
        }

        // Invalidate old codes
        await prisma.verificationCode.deleteMany({
            where: { email: data.email, type: 'EMAIL_VERIFY' },
        });

        const code = generateOTP();
        await prisma.verificationCode.create({
            data: {
                email: data.email,
                code,
                type: 'EMAIL_VERIFY',
                expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
            },
        });

        await sendVerificationEmail(data.email, code);

        res.json({ success: true, data: { sent: true } });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ success: false, error: err.errors[0].message });
            return;
        }
        console.error('Resend verification error:', err);
        res.status(500).json({ success: false, error: 'Failed to resend code' });
    }
});

// ─── Login (Email/Password) ───
authRouter.post('/login', async (req, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }

        // Guard: if user signed up with Google, they don't have a password
        if (user.provider === 'GOOGLE') {
            res.status(400).json({ success: false, error: 'This account uses Google Sign-In. Please use the "Continue with Google" button.' });
            return;
        }

        if (!user.passwordHash) {
            res.status(400).json({ success: false, error: 'No password set for this account' });
            return;
        }

        const validPassword = await bcrypt.compare(data.password, user.passwordHash);
        if (!validPassword) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }

        // Block unverified email users
        if (!user.emailVerified) {
            // Send a fresh OTP so they can verify
            const code = generateOTP();
            await prisma.verificationCode.deleteMany({ where: { email: data.email, type: 'EMAIL_VERIFY' } });
            await prisma.verificationCode.create({
                data: {
                    email: data.email,
                    code,
                    type: 'EMAIL_VERIFY',
                    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
                },
            });
            await sendVerificationEmail(data.email, code);

            res.status(403).json({
                success: false,
                error: 'Please verify your email first. A new verification code has been sent.',
                needsVerification: true,
                email: data.email,
            });
            return;
        }

        const tokens = generateTokens(user.id, user.role);
        res.json({ success: true, data: { user: sanitizeUser(user), ...tokens } });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ success: false, error: err.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// ─── Forgot Password (send OTP) ───
authRouter.post('/forgot-password', async (req, res: Response) => {
    try {
        const data = forgotPasswordSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email: data.email } });

        // Always respond with success to prevent email enumeration
        if (!user || user.provider === 'GOOGLE') {
            res.json({ success: true, data: { sent: true } });
            return;
        }

        // Rate-limit
        const recentCode = await prisma.verificationCode.findFirst({
            where: {
                email: data.email,
                type: 'PASSWORD_RESET',
                createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) },
            },
        });

        if (recentCode) {
            res.status(429).json({ success: false, error: 'Please wait before requesting a new code' });
            return;
        }

        // Invalidate old codes
        await prisma.verificationCode.deleteMany({ where: { email: data.email, type: 'PASSWORD_RESET' } });

        const code = generateOTP();
        await prisma.verificationCode.create({
            data: {
                email: data.email,
                code,
                type: 'PASSWORD_RESET',
                expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
            },
        });

        await sendPasswordResetEmail(data.email, code);

        res.json({ success: true, data: { sent: true } });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ success: false, error: err.errors[0].message });
            return;
        }
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, error: 'Failed to send reset code' });
    }
});

// ─── Reset Password (verify OTP + set new password) ───
authRouter.post('/reset-password', async (req, res: Response) => {
    try {
        const data = resetPasswordSchema.parse(req.body);

        const record = await prisma.verificationCode.findFirst({
            where: {
                email: data.email,
                code: data.code,
                type: 'PASSWORD_RESET',
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!record) {
            res.status(400).json({ success: false, error: 'Invalid or expired reset code' });
            return;
        }

        const passwordHash = await bcrypt.hash(data.newPassword, 12);

        await prisma.user.update({
            where: { email: data.email },
            data: { passwordHash, emailVerified: true }, // also verify email if they weren't
        });

        // Clean up used codes
        await prisma.verificationCode.deleteMany({
            where: { email: data.email, type: 'PASSWORD_RESET' },
        });

        res.json({ success: true, data: { message: 'Password reset successfully' } });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ success: false, error: err.errors[0].message });
            return;
        }
        console.error('Reset password error:', err);
        res.status(500).json({ success: false, error: 'Password reset failed' });
    }
});

// ─── Google OAuth Login/Signup ───
authRouter.post('/google', async (req, res: Response) => {
    try {
        const { credential } = googleLoginSchema.parse(req.body);

        // Verify the Google access token by fetching user info
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${credential}` },
        });
        if (!googleRes.ok) {
            res.status(401).json({ success: false, error: 'Invalid Google token' });
            return;
        }

        const payload = await googleRes.json() as {
            sub: string;
            email: string;
            name: string;
            picture?: string;
        };

        // Upsert user: find by email first, then create/update
        let user = await prisma.user.findUnique({ where: { email: payload.email } });
        let isNewUser = false;

        if (user) {
            // Existing user — update Google info if needed
            if (user.provider !== 'GOOGLE') {
                // User signed up with email, now linking Google
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { provider: 'GOOGLE', providerId: payload.sub, avatarUrl: user.avatarUrl || payload.picture, emailVerified: true },
                });
            }
        } else {
            // New user — create account with Google provider (email is auto-verified by Google)
            isNewUser = true;
            user = await prisma.user.create({
                data: {
                    name: payload.name,
                    email: payload.email,
                    avatarUrl: payload.picture || null,
                    provider: 'GOOGLE',
                    providerId: payload.sub,
                    role: 'STUDENT',
                    onboarded: false,
                    emailVerified: true,
                },
            });
        }

        const tokens = generateTokens(user.id, user.role);
        res.json({ success: true, data: { user: sanitizeUser(user), ...tokens, isNewUser } });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ success: false, error: err.errors[0].message });
            return;
        }
        console.error('Google auth error:', err);
        res.status(500).json({ success: false, error: 'Google authentication failed' });
    }
});

// ─── Onboarding (Complete Profile) ───
authRouter.put('/onboard', auth, async (req: AuthRequest, res: Response) => {
    try {
        const data = onboardSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: {
                name: data.name,
                role: data.role,
                avatarUrl: data.avatarUrl || undefined,
                onboarded: true,
            },
            select: { id: true, name: true, email: true, role: true, avatarUrl: true, onboarded: true, emailVerified: true, createdAt: true },
        });

        // Generate new tokens with updated role
        const tokens = generateTokens(user.id, user.role);
        res.json({ success: true, data: { user, ...tokens } });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ success: false, error: err.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, error: 'Onboarding failed' });
    }
});

// ─── Refresh Token ───
authRouter.post('/refresh', async (req, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ success: false, error: 'Refresh token required' });
            return;
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string; role: string };
        const tokens = generateTokens(decoded.userId, decoded.role);
        res.json({ success: true, data: tokens });
    } catch {
        res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
});

// ─── Get Current User ───
authRouter.get('/me', auth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, name: true, email: true, role: true, avatarUrl: true, onboarded: true, emailVerified: true, createdAt: true },
        });
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
});

// ─── Update Profile ───
const profileUpdateSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    avatarUrl: z.string().url().optional().nullable(),
});

authRouter.put('/profile', auth, async (req: AuthRequest, res: Response) => {
    try {
        const data = profileUpdateSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
            },
            select: { id: true, name: true, email: true, role: true, avatarUrl: true, onboarded: true, emailVerified: true, createdAt: true },
        });

        res.json({ success: true, data: user });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ success: false, error: err.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
});
