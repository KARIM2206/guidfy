const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const prisma = require('./prismaClient');

const app = express();
const PORT = process.env.PORT || 8000;

// =====================
// HTTP SERVER
// =====================
const server = http.createServer(app);

// =====================
// SOCKET.IO SETUP
// =====================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5000", // Next.js
    credentials: true,
  },
});

// =====================
// SOCKET CONNECTION
// =====================
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // register user to room
  socket.on("register", (userId) => {
    if (!userId) return;

    socket.join(`user_${userId}`);
    console.log(`📩 User joined room: user_${userId}`);
  });

  // listen for disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// =====================
// MAKE SOCKET GLOBAL
// =====================
app.set("io", io);

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// =====================
// PREVENT CACHING FOR STUDENT API
// =====================
// app.use('/api/student', (req, res, next) => {
//   res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
//   res.set('Pragma', 'no-cache');
//   res.set('Expires', '0');
//   next();
// });
// =====================
// ROUTES
// =====================
const authRoute = require('./routes/authRoute');
const roadmapRoute = require('./routes/admin/roadmapRoute');
const stepRoute = require('./routes/admin/stepRoute');
const lessonRoute = require('./routes/admin/lessonRoute');
const learningPathRoute = require('./routes/super-admin/learningPathRoute');
const studentRoute = require('./routes/student/studentRoute');
const jobsRoute = require('./routes/admin/jobsRoute');
const projectRoute = require('./routes/admin/projectRoute');
const userRoute = require('./routes/userRoute');
const communityRoute = require('./routes/communityRoute');
const postRoute = require('./routes/postRoute');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes=require('./routes/chatRoutes');

app.use('/api/auth', authRoute);
app.use('/api/admin/roadmaps', roadmapRoute);
app.use('/api/admin/steps', stepRoute);
app.use('/api/admin/lessons', lessonRoute);
app.use('/api/super-admin/learning-paths', learningPathRoute);
app.use('/api/student', studentRoute);
app.use('/api/admin/jobs', jobsRoute);
app.use('/api/admin/projects', projectRoute);
app.use('/api/users', userRoute);
app.use('/api/communities', communityRoute);
app.use('/api', postRoute);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/quiz", require("./routes/quizRoute"));

// =====================
// TEST SOCKET ROUTE (اختياري مفيد جدًا)
// =====================
app.get("/test-socket/:userId", (req, res) => {
  const io = req.app.get("io");
  const { userId } = req.params;

  io.to(`user_${userId}`).emit("new_notification", {
    message: "🔥 Test notification from backend",
    type: "TEST",
  });

  res.json({ success: true });
});

// =====================
// START SERVER
// =====================
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});