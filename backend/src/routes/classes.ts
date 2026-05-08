import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest, requireRole, requireClassMember, requireClassTeacher } from '../middleware/auth';
import { generateInviteCode } from '@meetrix/utils';
import { sessionRouter } from './sessions';
import { resourceRouter } from './resources';
import { assignmentRouter } from './assignments';
import { announcementRouter } from './announcements';
import { messageRouter } from './messages';

export const classRouter = Router();

// ─── Global Aggregators (User's cross-class data) ───
classRouter.get('/global/sessions', auth, async (req: AuthRequest, res: Response) => {
    try {
        const memberships = await prisma.classMember.findMany({ where: { userId: req.userId } });
        const classIds = memberships.map(m => m.classId);
        const sessions = await prisma.liveSession.findMany({
            where: { classId: { in: classIds } },
            include: { host: { select: { id: true, name: true, avatarUrl: true } }, class: { select: { name: true } } },
            orderBy: { scheduledAt: 'asc' }
        });
        res.json({ success: true, data: sessions });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch global sessions' });
    }
});

classRouter.get('/global/assignments', auth, async (req: AuthRequest, res: Response) => {
    try {
        const memberships = await prisma.classMember.findMany({ where: { userId: req.userId } });
        const classIds = memberships.map(m => m.classId);
        const assignments = await prisma.assignment.findMany({
            where: { classId: { in: classIds } },
            include: { teacher: { select: { id: true, name: true, avatarUrl: true } }, class: { select: { name: true } } },
            orderBy: { dueDate: 'asc' }
        });
        res.json({ success: true, data: assignments });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch global assignments' });
    }
});

classRouter.get('/global/resources', auth, async (req: AuthRequest, res: Response) => {
    try {
        const memberships = await prisma.classMember.findMany({ where: { userId: req.userId } });
        const classIds = memberships.map(m => m.classId);
        const resources = await prisma.resource.findMany({
            where: { classId: { in: classIds } },
            include: { uploader: { select: { id: true, name: true, avatarUrl: true } }, class: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: resources });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch global resources' });
    }
});

// ─── Sub-routers (Nested under /api/classes/:classId) ───
classRouter.use('/:classId/sessions', sessionRouter);
classRouter.use('/:classId/resources', resourceRouter);
classRouter.use('/:classId/assignments', assignmentRouter);
classRouter.use('/:classId/announcements', announcementRouter);
classRouter.use('/:classId/messages', messageRouter);



const createClassSchema = z.object({
    name: z.string().min(2).max(100),
    subject: z.string().min(1).max(50),
    description: z.string().max(500).optional(),
    coverUrl: z.string().url().optional(),
});

// ─── Create Class ───
classRouter.post('/', auth, async (req: AuthRequest, res: Response) => {
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
classRouter.get('/:id', auth, requireClassMember, async (req: AuthRequest, res: Response) => {
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
classRouter.delete('/:id', auth, requireClassTeacher, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.class.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Class deleted' });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to delete class' });
    }
});
