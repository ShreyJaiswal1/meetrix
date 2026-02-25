import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest, requireClassMember, requireRole } from '../middleware/auth';

export const announcementRouter = Router();

const createAnnouncementSchema = z.object({
    content: z.string().min(1).max(2000),
    pinned: z.boolean().default(false),
});

// ─── Create Announcement ───
announcementRouter.post(
    '/classes/:classId/announcements',
    auth,
    requireRole('TEACHER', 'ADMIN'),
    requireClassMember,
    async (req: AuthRequest, res: Response) => {
        try {
            const data = createAnnouncementSchema.parse(req.body);
            const announcement = await prisma.announcement.create({
                data: { ...data, classId: req.params.classId, authorId: req.userId! },
                include: { author: { select: { id: true, name: true, avatarUrl: true } } },
            });
            res.status(201).json({ success: true, data: announcement });
        } catch (err) {
            if (err instanceof z.ZodError) {
                res.status(400).json({ success: false, error: err.errors[0].message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to create announcement' });
        }
    }
);

// ─── List Announcements ───
announcementRouter.get('/classes/:classId/announcements', auth, requireClassMember, async (req: AuthRequest, res: Response) => {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { classId: req.params.classId },
            include: { author: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        });
        res.json({ success: true, data: announcements });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch announcements' });
    }
});
