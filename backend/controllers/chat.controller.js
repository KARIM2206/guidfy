const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ── إرسال رسالة ───────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ success: false, message: "receiverId and content are required" });
    }

    const message = await prisma.chatMessage.create({
      data: { senderId, receiverId: Number(receiverId), content: content.trim() },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    // ✅ نفس الـ pattern — emit للـ receiver
    const io = req.app.get("io");
    io?.to(`user_${receiverId}`).emit("new_message", message);

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── جلب المحادثة بين يوزرين ───────────────────────
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user.id;
    const { page = 1, limit = 30 } = req.query;

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: myId,          receiverId: Number(userId) },
          { senderId: Number(userId), receiverId: myId },
        ],
      },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * Number(limit),
      take: Number(limit),
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    // ✅ mark as read
    await prisma.chatMessage.updateMany({
      where: { senderId: Number(userId), receiverId: myId, read: false },
      data: { read: true },
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── الـ Inbox ─────────────────────────────────────
const getInbox = async (req, res) => {
  try {
    const myId = req.user.id;

    const messages = await prisma.chatMessage.findMany({
      where: { OR: [{ senderId: myId }, { receiverId: myId }] },
      orderBy: { createdAt: "desc" },
      include: {
        sender:   { select: { id: true, name: true, avatar: true, role: true } },
        receiver: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    // خد آخر رسالة مع كل شخص
    const seen = new Set();
    const inbox = [];

    for (const msg of messages) {
      const otherId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      if (!seen.has(otherId)) {
        seen.add(otherId);
        const unreadCount = await prisma.chatMessage.count({
          where: { senderId: otherId, receiverId: myId, read: false },
        });
        inbox.push({
          user: msg.senderId === myId ? msg.receiver : msg.sender,
          lastMessage: msg,
          unreadCount,
        });
      }
    }

    res.json({ success: true, data: inbox });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendMessage, getConversation, getInbox };