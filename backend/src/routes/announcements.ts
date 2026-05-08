import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest, requireClassMember, requireClassTeacher } from '../middleware/auth';
import { io } from '../index';

export const announcementRouter = Router({ mergeParams: true });

const createAnnouncementSchema = z.object({
    content: z.string().min(1).max(2000),
    pinned: z.boolean().default(false),
});

// ─── Create Announcement ───
announcementRouter.post(
    '/',
    auth,
    requireClassTeacher,
    async (req: AuthRequest, res: Response) => {
        try {
            const data = createAnnouncementSchema.parse(req.body);
            const classId = req.params.classId;

            const announcement = await prisma.announcement.create({
                data: { ...data, classId, authorId: req.userId! },
                include: { author: { select: { id: true, name: true, avatarUrl: true } } },
            });

            // ─── Notify all class members (except the author) ───
            const cls = await prisma.class.findUnique({ where: { id: classId }, select: { name: true } });
            const members = await prisma.classMember.findMany({
                where: { classId, userId: { not: req.userId } },
                select: { userId: true },
            });

            if (members.length > 0 && cls) {
                const notifications = await prisma.$transaction(
                    members.map(m =>
                        prisma.notification.create({
                            data: {
                                userId: m.userId,
                                type: 'ANNOUNCEMENT',
                                title: `New announcement in ${cls.name}`,
                                body: data.content.length > 100
                                    ? data.content.slice(0, 97) + '...'
                                    : data.content,
                            },
                        })
                    )
                );

                // Push real-time notification to each member's personal socket room
                for (let i = 0; i < members.length; i++) {
                    io.sendNotification(members[i].userId, notifications[i]);
                }
            }

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
announcementRouter.get('/', auth, requireClassMember, async (req: AuthRequest, res: Response) => {
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
