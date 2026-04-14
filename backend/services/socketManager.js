/**
 * Socket.io Real-Time Manager
 * ============================
 * Handles authenticated WebSocket connections.
 * Used for: team match notifications, live updates, invitation events.
 */

const jwt = require('jsonwebtoken');

// Map: userId -> Set of socket IDs
const userSockets = new Map();
// Map: socketId -> userId
const socketUsers = new Map();

let io;

function initSocket(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Auth middleware for socket connections ──
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: user=${userId}`);

    // Register socket
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);
    socketUsers.set(socket.id, userId);

    // Join personal room
    socket.join(`user:${userId}`);

    // ── Events from client ──
    socket.on('ping', () => socket.emit('pong'));

    socket.on('mark_notifications_read', async () => {
      try {
        const User = require('../models/User');
        await User.updateOne(
          { _id: userId },
          { $set: { 'notifications.$[].read': true } }
        );
        socket.emit('notifications_cleared');
      } catch (err) {
        console.error('Notification mark read error:', err);
      }
    });

    socket.on('join_team_room', (data) => {
      if (data?.teamId) {
        socket.join(`team:${data.teamId}`);
        console.log(`🔌 Socket ${socket.id} joined team ${data.teamId}`);
      }
    });

    socket.on('leave_team_room', (data) => {
      if (data?.teamId) {
        socket.leave(`team:${data.teamId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: user=${userId}`);
      userSockets.get(userId)?.delete(socket.id);
      if (userSockets.get(userId)?.size === 0) userSockets.delete(userId);
      socketUsers.delete(socket.id);
    });
  });

  return io;
}

/**
 * Send a notification to a specific user (all their connected sockets).
 */
function notifyUser(userId, event, data) {
  if (!io) return;
  io.to(`user:${String(userId)}`).emit(event, data);
}

/**
 * Broadcast to all connected users (e.g., new user joined pool).
 */
function broadcast(event, data) {
  if (!io) return;
  io.emit(event, data);
}

/**
 * Check if a user is currently online.
 */
function isOnline(userId) {
  return userSockets.has(String(userId)) && userSockets.get(String(userId)).size > 0;
}

/**
 * Get count of online users.
 */
function getOnlineCount() {
  return userSockets.size;
}

/**
 * Send a notification to a specific team room.
 */
function notifyTeam(teamId, event, data) {
  if (!io) return;
  io.to(`team:${String(teamId)}`).emit(event, data);
}

module.exports = { initSocket, notifyUser, notifyTeam, broadcast, isOnline, getOnlineCount };
