import { Server as SocketServer, Socket } from 'socket.io';

interface SocketUser {
    userId: string;
    name: string;
}

export function setupSocket(io: SocketServer) {
    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

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
        socket.on('send_message', (data: {
            roomId: string;
            senderId: string;
            senderName: string;
            content: string;
            fileUrl?: string;
        }) => {
            const message = {
                id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                ...data,
                createdAt: new Date().toISOString(),
            };

            // Broadcast to room (including sender)
            io.to(data.roomId).emit('receive_message', message);
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

    // ─── Helper: Send notification to a user ───
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
