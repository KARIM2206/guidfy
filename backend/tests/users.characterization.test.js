'use strict';

const fs = require('fs');
const path = require('path');
const request = require('supertest');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const {
  prisma,
  cleanDatabase,
} = require('./setup');

const app = require('../src/app');

function signTokenForUser(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function createUserFixture({
  name = 'Test User',
  email = 'user@example.com',
  password = 'Password123!',
  role = 'STUDENT',
  title = 'Developer',
  bio = 'Test bio',
} = {}) {
  const hashedPassword = await argon2.hash(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      title,
      bio,
    },
  });
  const token = signTokenForUser(user);
  return { user, token };
}

// Track ONLY the specific files created during upload tests for surgical cleanup
const uploadedTestFiles = new Set();

function recordUploadedFile(relativeUrl) {
  if (!relativeUrl || typeof relativeUrl !== 'string') return;
  const normalizedRel = relativeUrl.replace(/^\/+/, '');
  const absolutePath = path.resolve(__dirname, '..', normalizedRel);
  uploadedTestFiles.add(absolutePath);
}

describe('/api/users — Characterization & Known-Issue Tests', () => {
  beforeAll(() => {
    fs.mkdirSync(path.resolve(__dirname, '../uploads/avatars'), { recursive: true });
    fs.mkdirSync(path.resolve(__dirname, '../uploads/covers'), { recursive: true });
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    for (const filePath of uploadedTestFiles) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    uploadedTestFiles.clear();

    await cleanDatabase();
    await prisma.$disconnect();
  });

  // =========================================================================
  // 1. GET /api/users/ (getUserProfile)
  // =========================================================================
  describe('GET /api/users/', () => {
    test('returns 200 with full user profile AND exposes password hash (Known Issue)', async () => {
      const { user, token } = await createUserFixture({
        name: 'Profile User',
        email: 'profile@example.com',
      });

      await prisma.userStats.create({
        data: { userId: user.id, reputation: 42, followers: 5, following: 3 },
      });

      const res = await request(app)
        .get('/api/users/')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Profile fetched successfully');
      expect(res.body.data.id).toBe(user.id);
      expect(res.body.data.email).toBe('profile@example.com');
      expect(res.body.data.stats).toMatchObject({
        userId: user.id,
        reputation: 42,
        followers: 5,
        following: 3,
      });
      expect(Array.isArray(res.body.data.learningPaths)).toBe(true);
      expect(Array.isArray(res.body.data.roadmapProgress)).toBe(true);

      // KNOWN ISSUE - current behavior: findUserWithStatsAndNotificationsById uses include without omitting password
      expect(res.body.data).toHaveProperty('password');
      expect(typeof res.body.data.password).toBe('string');
      expect(res.body.data.password).toMatch(/^\$argon2/);
    });

    test('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/users/');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // 2. PUT /api/users/profile (updateUserProfile)
  // =========================================================================
  describe('PUT /api/users/profile', () => {
    test('returns 200 and updates name, title, bio, cover without returning password', async () => {
      const { user, token } = await createUserFixture({
        name: 'Old Name',
        email: 'update@example.com',
        title: 'Old Title',
        bio: 'Old Bio',
      });

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Name',
          title: 'Senior Engineer',
          bio: 'Updated bio text',
          cover: '/uploads/covers/custom.png',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user.id,
          name: 'New Name',
          title: 'Senior Engineer',
          bio: 'Updated bio text',
          avatar: null,
          cover: '/uploads/covers/custom.png',
        },
      });
      expect(res.body.data).not.toHaveProperty('password');
    });

    test('returns 401 when unauthenticated', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({ name: 'Hacker' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // 3. POST /api/users/avatar (uploadAvatar)
  // =========================================================================
  describe('POST /api/users/avatar', () => {
    test('returns 200 when a valid PNG image is uploaded and updates user avatar', async () => {
      const { user, token } = await createUserFixture({
        email: 'avatar@example.com',
      });

      // Minimal 1x1 PNG buffer
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const res = await request(app)
        .post('/api/users/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', pngBuffer, {
          filename: 'test-avatar.png',
          contentType: 'image/png',
        });

      if (res.body?.data?.avatar) {
        recordUploadedFile(res.body.data.avatar);
      }

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Avatar uploaded successfully');
      expect(res.body.data.avatar).toMatch(new RegExp(`^/uploads/avatars/${user.id}-\\d+\\.png$`));

      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated.avatar).toBe(res.body.data.avatar);
    });

    test('returns 500 instead of 400 when no file is uploaded due to reversed errorHandler(400, msg) (Known Issue)', async () => {
      const { token } = await createUserFixture({
        email: 'noavatar@example.com',
      });

      const res = await request(app)
        .post('/api/users/avatar')
        .set('Authorization', `Bearer ${token}`);

      // KNOWN ISSUE - current behavior: errorHandler(400, 'No file uploaded') sets statusCode = 'No file uploaded', causing Express res.status() to fail with 500 instead of 400
      expect(res.status).toBe(500);
    });

    test('returns 401 when unauthenticated', async () => {
      const res = await request(app).post('/api/users/avatar');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // 4. POST /api/users/cover (uploadCover)
  // =========================================================================
  describe('POST /api/users/cover', () => {
    test('returns 200 when a valid PNG image is uploaded and updates user cover', async () => {
      const { user, token } = await createUserFixture({
        email: 'cover@example.com',
      });

      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const res = await request(app)
        .post('/api/users/cover')
        .set('Authorization', `Bearer ${token}`)
        .attach('cover', pngBuffer, {
          filename: 'test-cover.png',
          contentType: 'image/png',
        });

      if (res.body?.data?.cover) {
        recordUploadedFile(res.body.data.cover);
      }

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Cover uploaded successfully');
      expect(res.body.data.cover).toMatch(new RegExp(`^/uploads/covers/${user.id}-\\d+\\.png$`));

      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated.cover).toBe(res.body.data.cover);
    });

    test('returns 500 instead of 400 when no file is uploaded due to reversed errorHandler(400, msg) (Known Issue)', async () => {
      const { token } = await createUserFixture({
        email: 'nocover@example.com',
      });

      const res = await request(app)
        .post('/api/users/cover')
        .set('Authorization', `Bearer ${token}`);

      // KNOWN ISSUE - current behavior: errorHandler(400, 'No file uploaded') sets statusCode = 'No file uploaded', causing Express res.status() to fail with 500 instead of 400
      expect(res.status).toBe(500);
    });

    test('returns 401 when unauthenticated', async () => {
      const res = await request(app).post('/api/users/cover');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // 5. GET /api/users/:id/stats (getUserStats)
  // =========================================================================
  describe('GET /api/users/:id/stats', () => {
    test('returns 200 publicly when UserStats exists for the user', async () => {
      const { user } = await createUserFixture({
        email: 'stats@example.com',
      });

      await prisma.userStats.create({
        data: {
          userId: user.id,
          reputation: 120,
          followers: 15,
          following: 8,
        },
      });

      const res = await request(app).get(`/api/users/${user.id}/stats`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        userId: user.id,
        reputation: 120,
        followers: 15,
        following: 8,
      });
    });

    test('returns 500 instead of 404 when UserStats does not exist due to reversed errorHandler(404, msg) (Known Issue)', async () => {
      const { user } = await createUserFixture({
        email: 'nostats@example.com',
      });

      const res = await request(app).get(`/api/users/${user.id}/stats`);

      // KNOWN ISSUE - current behavior: errorHandler(404, 'Stats not found') sets statusCode = 'Stats not found', causing Express res.status() to fail with 500 instead of 404
      expect(res.status).toBe(500);
    });
  });

  // =========================================================================
  // 6. GET /api/users/:id/badges (getUserBadges)
  // =========================================================================
  describe('GET /api/users/:id/badges', () => {
    test('returns 200 publicly with array of user badges', async () => {
      const { user } = await createUserFixture({
        email: 'badges@example.com',
      });

      const badge = await prisma.badge.create({
        data: {
          name: 'Problem Solver',
          icon: 'trophy',
          color: '#FFD700',
        },
      });

      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: badge.id,
        },
      });

      const res = await request(app).get(`/api/users/${user.id}/badges`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: [
          {
            id: badge.id,
            name: 'Problem Solver',
            icon: 'trophy',
            color: '#FFD700',
          },
        ],
      });
    });
  });

  // =========================================================================
  // 7. GET /api/users/:id/tracks (getUserTracks)
  // =========================================================================
  describe('GET /api/users/:id/tracks', () => {
    test('returns 200 publicly with formatted user tracks progress', async () => {
      const { user } = await createUserFixture({
        email: 'tracks@example.com',
      });

      const track = await prisma.trackProgress.create({
        data: {
          userId: user.id,
          trackName: 'Backend Node.js',
          progress: 75,
          color: '#10B981',
        },
      });

      const res = await request(app).get(`/api/users/${user.id}/tracks`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: [
          {
            id: track.id,
            name: 'Backend Node.js',
            progress: 75,
            color: '#10B981',
          },
        ],
      });
    });
  });

  // =========================================================================
  // 8. GET /api/users/:id/info (getUserById) — Question (ج) + Known Issues
  // =========================================================================
  describe('GET /api/users/:id/info', () => {
    test('Question (ج): returns 200 with public user fields only (id, name, avatar, title, role) and does NOT return password', async () => {
      const { user, token } = await createUserFixture({
        name: 'Info Target',
        email: 'infotarget@example.com',
        title: 'AI Researcher',
        role: 'STUDENT',
      });

      const res = await request(app)
        .get(`/api/users/${user.id}/info`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: {
          id: user.id,
          name: 'Info Target',
          avatar: null,
          title: 'AI Researcher',
          role: 'STUDENT',
        },
      });
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data).not.toHaveProperty('email');
    });

    test('returns 500 instead of 400 for non-numeric :id due to reversed errorHandler(400, msg) (Known Issue)', async () => {
      const { token } = await createUserFixture({
        email: 'invalidid@example.com',
      });

      const res = await request(app)
        .get('/api/users/not-a-number/info')
        .set('Authorization', `Bearer ${token}`);

      // KNOWN ISSUE - current behavior: errorHandler(400, 'Invalid user ID') sets statusCode = 'Invalid user ID', causing Express res.status() to fail with 500 instead of 400
      expect(res.status).toBe(500);
    });

    test('returns 500 instead of 404 when user is not found due to reversed errorHandler(404, msg) (Known Issue)', async () => {
      const { token } = await createUserFixture({
        email: 'missinguser@example.com',
      });

      const res = await request(app)
        .get('/api/users/999999/info')
        .set('Authorization', `Bearer ${token}`);

      // KNOWN ISSUE - current behavior: errorHandler(404, 'User not found') sets statusCode = 'User not found', causing Express res.status() to fail with 500 instead of 404
      expect(res.status).toBe(500);
    });

    test('returns 401 when unauthenticated', async () => {
      const { user } = await createUserFixture({
        email: 'unauthinfo@example.com',
      });

      const res = await request(app).get(`/api/users/${user.id}/info`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // 9. POST /api/users/admin/badges/assign (assignBadge)
  // =========================================================================
  describe('POST /api/users/admin/badges/assign', () => {
    test('returns 201 when ADMIN assigns a badge to a user', async () => {
      const { token: adminToken } = await createUserFixture({
        email: 'admin@example.com',
        role: 'ADMIN',
      });
      const { user: student } = await createUserFixture({
        email: 'student@example.com',
        role: 'STUDENT',
      });

      const badge = await prisma.badge.create({
        data: {
          name: 'Fast Learner',
          icon: 'zap',
          color: '#3B82F6',
        },
      });

      const res = await request(app)
        .post('/api/users/admin/badges/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: student.id, badgeId: badge.id });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Badge assigned successfully');
      expect(res.body.data).toMatchObject({
        userId: student.id,
        badgeId: badge.id,
        badge: {
          id: badge.id,
          name: 'Fast Learner',
          icon: 'zap',
          color: '#3B82F6',
        },
      });
    });

    test('returns 500 instead of 400 when badge is already assigned due to reversed errorHandler(400, msg) (Known Issue)', async () => {
      const { token: adminToken } = await createUserFixture({
        email: 'admin2@example.com',
        role: 'ADMIN',
      });
      const { user: student } = await createUserFixture({
        email: 'student2@example.com',
        role: 'STUDENT',
      });

      const badge = await prisma.badge.create({
        data: {
          name: 'Duplicate Badge',
          icon: 'star',
          color: '#F59E0B',
        },
      });

      await prisma.userBadge.create({
        data: {
          userId: student.id,
          badgeId: badge.id,
        },
      });

      const res = await request(app)
        .post('/api/users/admin/badges/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: student.id, badgeId: badge.id });

      // KNOWN ISSUE - current behavior: errorHandler(400, 'Badge already assigned') sets statusCode = 'Badge already assigned', causing Express res.status() to fail with 500 instead of 400
      expect(res.status).toBe(500);
    });

    test('returns 401 when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/users/admin/badges/assign')
        .send({ userId: 1, badgeId: 1 });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('returns 403 when STUDENT attempts to assign a badge', async () => {
      const { user: student, token: studentToken } = await createUserFixture({
        email: 'student3@example.com',
        role: 'STUDENT',
      });

      const badge = await prisma.badge.create({
        data: {
          name: 'Forbidden Badge',
          icon: 'lock',
          color: '#EF4444',
        },
      });

      const res = await request(app)
        .post('/api/users/admin/badges/assign')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ userId: student.id, badgeId: badge.id });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});

