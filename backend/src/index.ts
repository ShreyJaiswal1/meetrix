import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { classRouter } from './routes/classes';
import { resourceRouter } from './routes/resources';
import { assignmentRouter } from './routes/assignments';
import { announcementRouter } from './routes/announcements';
import { sessionRouter } from './routes/sessions';
import { notificationRouter } from './routes/notifications';
import { setupSocket } from './socket';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ─── Middleware ───
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ───
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'meetrix-api', timestamp: new Date().toISOString() });
});

// ─── Routes ───
app.use('/api/auth', authRouter);
app.use('/api/classes', classRouter);
app.use('/api/resources', resourceRouter);
app.use('/api/assignments', assignmentRouter);
app.use('/api/announcements', announcementRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/notifications', notificationRouter);

// ─── Socket.io ───
const io = new SocketServer(server, {
    cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true },
});
setupSocket(io);

// ─── Start ───
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`⚡ Meetrix API running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.io ready`);
});

export { app, io };
