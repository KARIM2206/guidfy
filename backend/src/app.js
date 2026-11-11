// src/app.js — PRODUCTION-HARDENED
'use strict';

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const dotenv     = require('dotenv');

dotenv.config();

// ── Singleton Prisma — imported early so DB is verified before routes load
require('./config/prismaClient');

const app = express();

// =====================
// SECURITY — HELMET
// =====================
// ✅ عدّل إعدادات helmet عشان يسمح بالصور cross-origin
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // ← ده المهم
  crossOriginEmbedderPolicy: false,
}));

// =====================
// SECURITY — STRICT CORS
// =====================
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman / server-to-server / same-origin
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Version'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));
// في آخر الـ CORS middleware — قبل routes
app.use((req, res, next) => {
  console.log('📡 Request from origin:', req.headers.origin);
  next();
});
// =====================
// BODY PARSING
// =====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
// =====================
// STATIC FILES
// =====================
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// =====================
// RATE LIMITING — Auth endpoints only
// =====================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
  skip: (req) => req.method === 'OPTIONS',
});

// =====================
// ROUTES
// =====================
const authRoute          = require('./modules/auth/auth.routes');
const roadmapRoute       = require('../routes/admin/roadmapRoute');
const stepRoute          = require('../routes/admin/stepRoute');
const lessonRoute        = require('../routes/admin/lessonRoute');
const learningPathRoute  = require('../routes/super-admin/learningPathRoute');
const studentRoute       = require('../routes/student/studentRoute');
const jobsRoute          = require('../routes/admin/jobsRoute');
const projectRoute       = require('../routes/admin/projectRoute');
const userRoute          = require('../routes/userRoute');
const communityRoute     = require('../routes/communityRoute');
const postRoute          = require('../routes/postRoute');
const notificationRoutes = require('../routes/notificationRoutes');
const chatRoutes         = require('../routes/chatRoutes');
const superAdminRoute    = require('../routes/community/superAdminRoute');
const adminRoute         = require('../routes/community/adminRoute');
const reportRoute        = require('../routes/community/reportRoute');
const n8nRoutes          = require('../routes/n8nRoutes');
const aiTrainingRoute    = require('../routes/super-admin/aiTrainingRoute');
const knowledgeRoute     = require('../routes/super-admin/knowledgeRoute');

// ── Apply rate limiter ONLY on auth login / register
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth',                     authRoute);
app.use('/api/admin/roadmaps',           roadmapRoute);
app.use('/api/admin/steps',              stepRoute);
app.use('/api/admin/lessons',            lessonRoute);
app.use('/api/super-admin/learning-paths', learningPathRoute);
app.use('/api/student',                  studentRoute);
app.use('/api/admin/jobs',               jobsRoute);
app.use('/api/admin/projects',           projectRoute);
app.use('/api/users',                    userRoute);
app.use('/api/communities',              communityRoute);
app.use('/api',                          postRoute);
app.use('/api/notifications',            notificationRoutes);
app.use('/api/chat',                     chatRoutes);
app.use('/api/quiz',                     require('../routes/quizRoute'));
app.use('/api/admin/quiz',               require('../routes/quizRoute')); // <-- Added to fix frontend pathing
app.use('/api/admin',                    adminRoute);
app.use('/api/super-admin',              superAdminRoute);
app.use('/api/super-admin/ai-training',  aiTrainingRoute);
app.use('/api/super-admin/knowledge',    knowledgeRoute);
app.use('/api/reports',                  reportRoute);
app.use('/api/n8n',                      n8nRoutes);
app.use('/api/recommendations',          require('../routes/recommendationRoute'));
app.use('/api/feedback',                 require('../routes/feedbackRoute'));
app.use('/api/career-report',            require('../routes/student/careerReportRoute'));


// =====================
// TEST SOCKET ROUTES
// =====================

// 3. اختبر الإرسال اليدوي + 4. تأكد أن الرسائل تصل للـ Room
app.post('/api/test-socket/send', (req, res) => {
  const io = req.app.get('io');
  const { userId, eventName = 'new_message', payload } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  const roomName = `user_${userId}`;
  io.to(roomName).emit(eventName, payload);
  
  console.log(`📤 Manually sent event '${eventName}' to room '${roomName}' with payload:`, payload);

  res.json({
    success: true,
    message: `Message sent to room ${roomName}`,
    eventName,
    payload
  });
});

// 5. اعرض الـ Rooms الموجودة في السيرفر بالكامل (أقوى اختبار)
app.get('/api/test-socket/rooms', (req, res) => {
  const io = req.app.get('io');
  const rooms = io.sockets.adapter.rooms;
  const sids = io.sockets.adapter.sids;
  
  const activeRooms = {};
  for (const [roomName, socketsSet] of rooms.entries()) {
    activeRooms[roomName] = Array.from(socketsSet);
  }

  res.json({
    success: true,
    totalConnectedSockets: sids.size,
    activeRooms
  });
});

app.get('/test-socket/:userId', (req, res) => {
  const io       = req.app.get('io');
  const { userId } = req.params;

  io.to(`user_${userId}`).emit('new_notification', {
    message: '🔥 Test notification from backend',
    type: 'TEST',
  });

  res.json({ success: true, message: `Test notification sent to user_${userId}` });
});

// =====================
// GLOBAL ERROR MIDDLEWARE  ← must be LAST, after all routes
// =====================
const { notFound, errorHandlerMiddleware } = require('./common/middlewares/error');
app.use(notFound);
app.use(errorHandlerMiddleware);

app.allowedOrigins = allowedOrigins;

module.exports = app;

