import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest, requireRole } from '../middleware/auth';
import { generateInviteCode } from '@meetrix/utils';

export const classRouter = Router();

const createClassSchema = z.object({
    name: z.string().min(2).max(100),
    subject: z.string().min(1).max(50),
    description: z.string().max(500).optional(),
    coverUrl: z.string().url().optional(),
});

// ─── Create Class (Teacher/Admin only) ───
classRouter.post('/', auth, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
    try {
        const data = createClassSchema.parse(req.body);
        const inviteCode = generateInviteCode();

        const newClass = await prisma.class.create({
            data: {
                ...data,
                inviteCode,
                teacherId: req.userId!,
                members: {
                    create: { userId: req.userId!, role: 'TEACHER' },
                },
            },
            include: { teacher: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        });

        res.status(201).json({ success: true, data: newClass });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ success: false, error: err.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, error: 'Failed to create class' });
    }
});

// ─── List My Classes ───
classRouter.get('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        const memberships = await prisma.classMember.findMany({
            where: { userId: req.userId },
            include: {
                class: {
                    include: {
                        teacher: { select: { id: true, name: true, avatarUrl: true } },
                        _count: { select: { members: true, resources: true, assignments: true } },
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        });

        const classes = memberships.map((m) => ({ ...m.class, myRole: m.role }));
        res.json({ success: true, data: classes });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch classes' });
    }
});

// ─── Get Class Details ───
classRouter.get('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const cls = await prisma.class.findUnique({
            where: { id: req.params.id },
            include: {
                teacher: { select: { id: true, name: true, email: true, avatarUrl: true } },
                members: {
                    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
                    orderBy: { joinedAt: 'asc' },
                },
                _count: { select: { resources: true, assignments: true, announcements: true } },
            },
        });
        if (!cls) {
            res.status(404).json({ success: false, error: 'Class not found' });
            return;
        }
        res.json({ success: true, data: cls });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch class' });
    }
});

// ─── Join Class via Invite Code ───
classRouter.post('/join', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { inviteCode } = req.body;
        if (!inviteCode) {
            res.status(400).json({ success: false, error: 'Invite code required' });
            return;
        }

        const cls = await prisma.class.findUnique({ where: { inviteCode } });
        if (!cls) {
            res.status(404).json({ success: false, error: 'Invalid invite code' });
            return;
        }

        // Check if already a member
        const existing = await prisma.classMember.findUnique({
            where: { classId_userId: { classId: cls.id, userId: req.userId! } },
        });
        if (existing) {
            res.status(409).json({ success: false, error: 'Already a member of this class' });
            return;
        }

        await prisma.classMember.create({
            data: { classId: cls.id, userId: req.userId!, role: 'STUDENT' },
        });

        res.json({ success: true, data: cls, message: 'Joined class successfully' });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to join class' });
    }
});

// ─── Delete Class (Teacher only) ───
classRouter.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const cls = await prisma.class.findUnique({ where: { id: req.params.id } });
        if (!cls) {
            res.status(404).json({ success: false, error: 'Class not found' });
            return;
        }
        if (cls.teacherId !== req.userId) {
            res.status(403).json({ success: false, error: 'Only the class teacher can delete' });
            return;
        }

        await prisma.class.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Class deleted' });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to delete class' });
    }
});
