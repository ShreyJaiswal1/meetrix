import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest, requireClassMember, requireRole } from '../middleware/auth';

export const assignmentRouter = Router();

const createAssignmentSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    dueDate: z.string().datetime(),
    maxMarks: z.number().int().min(1).max(1000),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
    attachments: z.array(z.string().url()).optional(),
});

const gradeSchema = z.object({
    marks: z.number().int().min(0),
    feedback: z.string().max(1000).optional(),
});

// ─── Create Assignment (Teacher) ───
assignmentRouter.post(
    '/classes/:classId/assignments',
    auth,
    requireRole('TEACHER', 'ADMIN'),
    requireClassMember,
    async (req: AuthRequest, res: Response) => {
        try {
            const data = createAssignmentSchema.parse(req.body);
            const assignment = await prisma.assignment.create({
                data: {
                    ...data,
                    dueDate: new Date(data.dueDate),
                    attachments: data.attachments || [],
                    classId: req.params.classId,
                    teacherId: req.userId!,
                },
                include: { teacher: { select: { id: true, name: true, avatarUrl: true } } },
            });
            res.status(201).json({ success: true, data: assignment });
        } catch (err) {
            if (err instanceof z.ZodError) {
                res.status(400).json({ success: false, error: err.errors[0].message });
                return;
            }
            res.status(500).json({ success: false, error: 'Failed to create assignment' });
        }
    }
);

// ─── List Assignments ───
assignmentRouter.get('/classes/:classId/assignments', auth, requireClassMember, async (req: AuthRequest, res: Response) => {
    try {
        const assignments = await prisma.assignment.findMany({
            where: { classId: req.params.classId },
            include: {
                teacher: { select: { id: true, name: true, avatarUrl: true } },
                _count: { select: { submissions: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: assignments });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
    }
});

// ─── Submit Assignment (Student) ───
assignmentRouter.post('/assignments/:id/submit', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { fileUrl, textBody } = req.body;
        if (!fileUrl && !textBody) {
            res.status(400).json({ success: false, error: 'Provide a file or text response' });
            return;
        }

        const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });
        if (!assignment) {
            res.status(404).json({ success: false, error: 'Assignment not found' });
            return;
        }
        if (assignment.status === 'CLOSED') {
            res.status(400).json({ success: false, error: 'Assignment is closed' });
            return;
        }

        const submission = await prisma.submission.upsert({
            where: { assignmentId_studentId: { assignmentId: req.params.id, studentId: req.userId! } },
            create: { assignmentId: req.params.id, studentId: req.userId!, fileUrl, textBody },
            update: { fileUrl, textBody, submittedAt: new Date() },
        });

        res.json({ success: true, data: submission });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to submit assignment' });
    }
});

// ─── Get Submissions (Teacher) ───
assignmentRouter.get('/assignments/:id/submissions', auth, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
    try {
        const submissions = await prisma.submission.findMany({
            where: { assignmentId: req.params.id },
            include: { student: { select: { id: true, name: true, email: true, avatarUrl: true } } },
            orderBy: { submittedAt: 'desc' },
        });
        res.json({ success: true, data: submissions });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
    }
});

// ─── Grade Submission (Teacher) ───
assignmentRouter.patch('/submissions/:id/grade', auth, requireRole('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
    try {
        const data = gradeSchema.parse(req.body);
        const submission = await prisma.submission.update({
            where: { id: req.params.id },
            data: { marks: data.marks, feedback: data.feedback },
        });
        res.json({ success: true, data: submission });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ success: false, error: err.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, error: 'Failed to grade submission' });
    }
});
