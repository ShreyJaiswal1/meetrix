import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest, requireRole, requireClassMember } from '../middleware/auth';

export const sessionRouter = Router();

const createSessionSchema = z.object({
    title: z.string().min(1).max(200),
    scheduledAt: z.string().datetime(),
});

// ─── Schedule Live Session ───
sessionRouter.post(
    '/classes/:classId/sessions',
    auth,
    requireRole('TEACHER', 'ADMIN'),
    requireClassMember,
    async (req: AuthRequest, res: Response) => {
        try {
            const data = createSessionSchema.parse(req.body);
            const jitsiRoom = `meetrix-${req.params.classId}-${Date.now()}`;

            const session = await prisma.liveSession.create({
                data: {
                    ...data,
                    scheduledAt: new Date(data.scheduledAt),
                    jitsiRoom,
                    classId: req.params.classId,
                    hostId: req.userId!,
                },
                include: { host: { select: { id: true, name: true, avatarUrl: true } } },
            });

            res.status(201).json({ success: true, data: session });
        } catch (err) {
            if (err instanceof z.ZodError) {
                res.status(400).json({ success: false, error: err.errors[0].message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to schedule session' });
        }
    }
);

// ─── List Sessions ───
sessionRouter.get('/classes/:classId/sessions', auth, requireClassMember, async (req: AuthRequest, res: Response) => {
    try {
        const sessions = await prisma.liveSession.findMany({
            where: { classId: req.params.classId },
            include: { host: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { scheduledAt: 'desc' },
        });
        res.json({ success: true, data: sessions });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
    }
});

// ─── Get Join Info ───
sessionRouter.get('/sessions/:id/join', auth, async (req: AuthRequest, res: Response) => {
    try {
        const session = await prisma.liveSession.findUnique({ where: { id: req.params.id } });
        if (!session) {
            res.status(404).json({ success: false, error: 'Session not found' });
            return;
        }
        // Jitsi Meet URL — using free public server
        const jitsiUrl = `https://meet.jit.si/${session.jitsiRoom}`;
        res.json({ success: true, data: { jitsiUrl, jitsiRoom: session.jitsiRoom, title: session.title } });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to get join info' });
    }
});
