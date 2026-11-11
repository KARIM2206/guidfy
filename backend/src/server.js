// src/server.js — HTTP + Socket.IO Server Entry Point
'use strict';

const http       = require('http');
const { Server } = require('socket.io');
const app        = require('./app');

const PORT           = process.env.PORT || 8000;
const allowedOrigins = app.allowedOrigins;

// =====================
// HTTP SERVER
// =====================
const server = http.createServer(app);

// =====================
// SOCKET.IO SETUP
// =====================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  socket.on('register', (userId) => {
    if (!userId) return;
    const roomName = `user_${userId}`;
    socket.join(roomName);
    console.log(`📩 User (Socket: ${socket.id}) joined room: ${roomName}`);
    // 5. اعرض الـ Rooms الموجودة للمستخدم
    console.log(`🏠 Active Rooms for ${socket.id}:`, Array.from(socket.rooms));
  });

  // 4. تأكد أن الرسائل تصل للـ Room
  // You can optionally listen to events sent from client to server if needed
  socket.on('ping_room', (data) => {
    console.log(`🏓 Ping received from socket ${socket.id}:`, data);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

app.set('io', io);

// =====================
// START SERVER
// =====================
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Allowed origins: ${allowedOrigins.join(', ')}`);
});

module.exports = server;

