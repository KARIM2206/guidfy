// controllers/chat.controller.js
// ✅ Fixes:
//   1. Removed `new PrismaClient()` — uses singleton
//   2. getInbox N+1 eliminated — single aggregation query for unread counts
//   3. `read` field used correctly (schema has `read`, not `isRead`)
//   4. Response structure identical to original (frontend-safe)
'use strict';

const prisma = require('../prismaClient');

// ── Send a message ─────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'receiverId and content are required',
      });
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId,
        receiverId: Number(receiverId),
        content:    content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    // Emit to both receiver and sender via Socket.IO
    const io = req.app.get('io');
    io?.to(`user_${receiverId}`).emit('new_message', message);
    io?.to(`user_${senderId}`).emit('new_message', message);

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('sendMessage error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get conversation between two users ────────────────────────
const getConversation = async (req, res) => {
  try {
    const { userId }             = req.params;
    const myId                   = req.user.id;
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(100, Number(req.query.limit) || 30);

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: myId,          receiverId: Number(userId) },
          { senderId: Number(userId), receiverId: myId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      skip:  (page - 1) * limit,
      take:  limit,
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    // Mark incoming messages as read
    await prisma.chatMessage.updateMany({
      where: { senderId: Number(userId), receiverId: myId, read: false },
      data:  { read: true },
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('getConversation error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Inbox — OPTIMIZED (no N+1) ────────────────────────────────
// Original had a DB call inside a loop for unread counts.
// Fixed: one groupBy aggregation fetches ALL unread counts at once.
const getInbox = async (req, res) => {
  try {
    const myId = req.user.id;

    // 1. Fetch all messages involving this user (latest first)
    const messages = await prisma.chatMessage.findMany({
      where: { OR: [{ senderId: myId }, { receiverId: myId }] },
      orderBy: { createdAt: 'desc' },
      select: {
        id:         true,
        senderId:   true,
        receiverId: true,
        content:    true,
        read:       true,
        createdAt:  true,
        sender:   { select: { id: true, name: true, avatar: true, role: true } },
        receiver: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    // 2. One aggregation query — unread counts per sender
    //    Replaces the per-iteration DB call that caused N+1.
    const unreadAgg = await prisma.chatMessage.groupBy({
      by:     ['senderId'],
      where:  { receiverId: myId, read: false },
      _count: { id: true },
    });

    // Build a lookup map: senderId → unreadCount
    const unreadMap = {};
    for (const row of unreadAgg) {
      unreadMap[row.senderId] = row._count.id;
    }

    // 3. Build inbox — one entry per conversation partner
    const seen  = new Set();
    const inbox = [];

    for (const msg of messages) {
      const otherId =
        msg.senderId === myId ? msg.receiverId : msg.senderId;

      if (!seen.has(otherId)) {
        seen.add(otherId);
        inbox.push({
          user:        msg.senderId === myId ? msg.receiver : msg.sender,
          lastMessage: msg,
          unreadCount: unreadMap[otherId] || 0,
        });
      }
    }

    // Response structure identical to original — frontend-safe
    res.json({ success: true, data: inbox });
  } catch (error) {
    console.error('getInbox error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendMessage, getConversation, getInbox };