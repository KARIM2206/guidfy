// sockets/notification.socket.js
const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

const SOCKET_EVENTS = {
  NEW: 'notification:new',
  READ: 'notification:read',
  ALL_READ: 'notification:all-read',
  ERROR: 'socket:error',
  CONNECTED: 'socket:connected',
  JOIN_ROOM: 'join:room',
};

/**
 * Initialize Socket.io handlers
 * @param {import('socket.io').Server} io
 */
const initSocketHandlers = (io) => {
  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, role: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { user } = socket;
    const userRoom = `user_${user.id}`;

    // Auto-join user's personal room on connect
    socket.join(userRoom);
    console.log(`[Socket] User ${user.name} (${user.id}) connected → joined room: ${userRoom}`);

    // Emit connection success
    socket.emit(SOCKET_EVENTS.CONNECTED, {
      message: `Connected successfully. Listening on room: ${userRoom}`,
      user: { id: user.id, name: user.name, role: user.role },
      room: userRoom,
    });

    // ADMIN/SUPER_ADMIN: Join admin room for system alerts
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      socket.join('admin_room');
      console.log(`[Socket] ${user.role} ${user.name} joined admin_room`);
    }

    // SUPER_ADMIN: Join broadcast room
    if (user.role === 'SUPER_ADMIN') {
      socket.join('super_admin_room');
      console.log(`[Socket] SUPER_ADMIN ${user.name} joined super_admin_room`);
    }

    // Handle manual room join (e.g., rejoin after reconnect)
    socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ userId }) => {
      // Security: can only join own room unless admin
      if (
        parseInt(userId) === user.id ||
        user.role === 'ADMIN' ||
        user.role === 'SUPER_ADMIN'
      ) {
        const room = `user_${userId}`;
        socket.join(room);
        socket.emit('room:joined', { room });
      } else {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Cannot join another user\'s room' });
      }
    });

    // Ping/Pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] User ${user.name} (${user.id}) disconnected: ${reason}`);
    });

    socket.on('error', (error) => {
      console.error(`[Socket] Error for user ${user.id}:`, error);
    });
  });

  console.log('[Socket.io] Handlers initialized');
};

module.exports = { initSocketHandlers, SOCKET_EVENTS };