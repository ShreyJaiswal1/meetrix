import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest, requireClassMember, requireClassTeacher, requireRole } from '../middleware/auth';

export const assignmentRouter = Router({ mergeParams: true });

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
    '/',
    auth,
    requireClassTeacher,
    async (req: AuthRequest, res: Response) => {
        try {
            const data = createAssignmentSchema.parse(req.body);
            const { classId } = req.params;
            const assignment = await prisma.assignment.create({
                data: {
                    ...data,
                    dueDate: new Date(data.dueDate),
                    attachments: data.attachments || [],
                    classId,
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
assignmentRouter.get('/', auth, requireClassMember, async (req: AuthRequest, res: Response) => {
    try {
        const { classId } = req.params;
        const assignments = await prisma.assignment.findMany({
            where: { classId },
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
assignmentRouter.post('/:id/submit', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { fileUrl, textBody } = req.body;
        if (!fileUrl && !textBody) {
            res.status(400).json({ success: false, error: 'Provide a file or text response' });
            return;
        }

        const assignment = await prisma.assignment.findUnique({
            where: { id: req.params.id },
            include: { class: { include: { members: { where: { userId: req.userId! } } } } }
        });

        if (!assignment) {
            res.status(404).json({ success: false, error: 'Assignment not found' });
            return;
        }

        // Verify membership
        if (assignment.class.members.length === 0) {
            res.status(403).json({ success: false, error: 'Not a member of this class' });
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
assignmentRouter.get('/:id/submissions', auth, async (req: AuthRequest, res: Response) => {
    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: req.params.id },
            include: { class: { include: { members: { where: { userId: req.userId!, role: 'TEACHER' } } } } }
        });

        if (!assignment) {
            res.status(404).json({ success: false, error: 'Assignment not found' });
            return;
        }

        if (assignment.class.members.length === 0) {
            res.status(403).json({ success: false, error: 'Only the class teacher can view submissions' });
            return;
        }

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
assignmentRouter.patch('/submissions/:id/grade', auth, async (req: AuthRequest, res: Response) => {
    try {
        const data = gradeSchema.parse(req.body);
        
        const submission = await prisma.submission.findUnique({
            where: { id: req.params.id },
            include: { 
                assignment: { 
                    include: { 
                        class: { 
                            include: { 
                                members: { where: { userId: req.userId!, role: 'TEACHER' } } 
                            } 
                        } 
                    } 
                } 
            }
        });

        if (!submission) {
            res.status(404).json({ success: false, error: 'Submission not found' });
            return;
        }

        if (submission.assignment.class.members.length === 0) {
            res.status(403).json({ success: false, error: 'Only the class teacher can grade submissions' });
            return;
        }

        const updated = await prisma.submission.update({
            where: { id: req.params.id },
            data: { marks: data.marks, feedback: data.feedback },
        });
        
        res.json({ success: true, data: updated });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ success: false, error: err.errors[0].message });
            return;
        }
        res.status(500).json({ success: false, error: 'Failed to grade submission' });
    }
});
