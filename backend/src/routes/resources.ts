import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest, requireClassMember } from '../middleware/auth';

export const resourceRouter = Router();

const createResourceSchema = z.object({
    title: z.string().min(1).max(200),
    type: z.enum(['PDF', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LINK']),
    url: z.string().url(),
    folder: z.string().max(100).optional(),
});

// ─── Upload Resource ───
resourceRouter.post('/classes/:classId/resources', auth, requireClassMember, async (req: AuthRequest, res: Response) => {
    try {
        const data = createResourceSchema.parse(req.body);
        const resource = await prisma.resource.create({
            data: { ...data, classId: req.params.classId, uploaderId: req.userId! },
            include: { uploader: { select: { id: true, name: true, avatarUrl: true } } },
        });
        res.status(201).json({ success: true, data: resource });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ success: false, error: err.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, error: 'Failed to upload resource' });
    }
});

// ─── List Resources ───
resourceRouter.get('/classes/:classId/resources', auth, requireClassMember, async (req: AuthRequest, res: Response) => {
    try {
        const { folder } = req.query;
        const where: any = { classId: req.params.classId };
        if (folder) where.folder = folder as string;

        const resources = await prisma.resource.findMany({
            where,
            include: { uploader: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: resources });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch resources' });
    }
});

// ─── Delete Resource ───
resourceRouter.delete('/resources/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const resource = await prisma.resource.findUnique({ where: { id: req.params.id } });
        if (!resource) {
            res.status(404).json({ success: false, error: 'Resource not found' });
            return;
        }
        if (resource.uploaderId !== req.userId) {
            res.status(403).json({ success: false, error: 'Only uploader can delete' });
            return;
        }
        await prisma.resource.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Resource deleted' });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to delete resource' });
    }
});
