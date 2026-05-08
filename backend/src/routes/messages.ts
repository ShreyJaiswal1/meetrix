import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest, requireClassMember } from '../middleware/auth';

export const messageRouter = Router({ mergeParams: true });

// ─── Get Messages for a Class ───
messageRouter.get('/', auth, requireClassMember, async (req: AuthRequest, res: Response) => {
    try {
        const { classId } = req.params;
        const messages = await prisma.message.findMany({
            where: { roomId: classId },
            include: {
                sender: { select: { id: true, name: true, avatarUrl: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
        
        res.json({ success: true, data: messages });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
});
