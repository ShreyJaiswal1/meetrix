import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

export const notificationRouter = Router();

// ─── List Notifications ───
notificationRouter.get('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        const unreadCount = await prisma.notification.count({
            where: { userId: req.userId, read: false },
        });
        res.json({ success: true, data: { notifications, unreadCount } });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
});

// ─── Mark as Read ───
notificationRouter.patch('/:id/read', auth, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.updateMany({
            where: { id: req.params.id, userId: req.userId },
            data: { read: true },
        });
        res.json({ success: true, message: 'Marked as read' });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to update notification' });
    }
});

// ─── Mark All as Read ───
notificationRouter.patch('/read-all', auth, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.userId, read: false },
            data: { read: true },
        });
        res.json({ success: true, message: 'All marked as read' });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to update notifications' });
    }
});
