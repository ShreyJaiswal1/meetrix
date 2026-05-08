import { Server as SocketServer, Socket } from 'socket.io';
import { prisma } from './lib/prisma';
import jwt from 'jsonwebtoken';

interface SocketUser {
    userId: string;
    name: string;
}

export function setupSocket(io: SocketServer) {
    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // ─── Authenticate & join personal notification room ───
        socket.on('authenticate', (token: string) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
                const userRoom = `user_${decoded.userId}`;
                socket.join(userRoom);
                console.log(`✅ Socket ${socket.id} authenticated as ${decoded.userId}, joined ${userRoom}`);
                socket.emit('authenticated', { userId: decoded.userId });
            } catch {
                console.warn(`⚠️ Socket ${socket.id} sent invalid token`);
                socket.emit('auth_error', { message: 'Invalid token' });
            }
        });

        // ─── Join class room ───
        socket.on('join_room', (roomId: string) => {
            socket.join(roomId);
            console.log(`→ ${socket.id} joined room: ${roomId}`);
        });

        // ─── Leave room ───
        socket.on('leave_room', (roomId: string) => {
            socket.leave(roomId);
        });

        // ─── Send message ───
        socket.on('send_message', async (data: {
            roomId: string;
            senderId: string;
            senderName: string;
            content: string;
            fileUrl?: string;
        }) => {
            try {
                // Save to DB
                const dbMessage = await prisma.message.create({
                    data: {
                        roomId: data.roomId,
                        senderId: data.senderId,
                        content: data.content,
                        fileUrl: data.fileUrl,
                    },
                    include: {
                        sender: { select: { id: true, name: true, avatarUrl: true } }
                    }
                });

                // Broadcast to room (including sender)
                io.to(data.roomId).emit('receive_message', dbMessage);
            } catch (err) {
                console.error('Failed to save message:', err);
                socket.emit('message_error', { message: 'Failed to send message' });
            }
        });

        // ─── Typing indicator ───
        socket.on('typing_start', (data: { roomId: string; user: SocketUser }) => {
            socket.to(data.roomId).emit('user_typing', data.user);
        });

        socket.on('typing_stop', (data: { roomId: string; userId: string }) => {
            socket.to(data.roomId).emit('user_stopped_typing', data.userId);
        });

        // ─── Disconnect ───
        socket.on('disconnect', () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);
        });
    });

    // ─── Helper: Send notification to a user's personal room ───
    io.sendNotification = (userId: string, notification: any) => {
        io.to(`user_${userId}`).emit('notification', notification);
    };

    // ─── Helper: Broadcast to a class ───
    io.broadcastToClass = (classId: string, event: string, data: any) => {
        io.to(classId).emit(event, data);
    };
}

// Extend Socket.io Server type
declare module 'socket.io' {
    interface Server {
        sendNotification: (userId: string, notification: any) => void;
        broadcastToClass: (classId: string, event: string, data: any) => void;
    }
}
