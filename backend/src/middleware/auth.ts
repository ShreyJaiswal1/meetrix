import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
}

export function auth(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            res.status(401).json({ success: false, error: 'No token provided' });
            return;
        }

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };

        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch {
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
}

export function requireRole(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            res.status(403).json({ success: false, error: 'Insufficient permissions' });
            return;
        }
        next();
    };
}

// Verify the user is a member of a given class
export async function requireClassMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const classId = req.params.classId || req.params.id;
    if (!classId || !req.userId) {
        res.status(400).json({ success: false, error: 'Missing class or user' });
        return;
    }

    const member = await prisma.classMember.findUnique({
        where: { classId_userId: { classId, userId: req.userId } },
    });

    if (!member) {
        res.status(403).json({ success: false, error: 'Not a member of this class' });
        return;
    }

    next();
}
