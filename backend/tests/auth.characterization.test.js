'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const argon2 = require('argon2');
const {
  prisma,
  assertTestDatabaseUrl,
  verifyActiveDatabaseIsTest,
  cleanDatabase,
} = require('./setup');
const app = require('../src/app');
const generateToken = require('../src/common/utils/generateToken');

describe('Auth Module — Characterization & Known-Issue Tests (/api/auth)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  // ── Helper to seed a user directly in DB without hitting rate-limited /login or /register
  async function createTestUser({
    email = 'student@test.com',
    name = 'Test Student',
    password = 'Password123!',
    role = 'STUDENT',
    useBcrypt = false,
  } = {}) {
    const hashedPassword = useBcrypt
      ? await bcrypt.hash(password, 10)
      : await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role,
      },
    });

    const token = generateToken(user.id);
    return { user, token };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 0. Database Isolation & Guard Verification
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Database Safety Guards (setup.js)', () => {
    test('rejects DATABASE_URL when database name does not contain "test"', () => {
      expect(() =>
        assertTestDatabaseUrl('mysql://root:root@127.0.0.1:3306/guidfy_db')
      ).toThrow(/must contain "test"/i);

      expect(() =>
        assertTestDatabaseUrl('mysql://root:root@127.0.0.1:3306/production')
      ).toThrow(/must contain "test"/i);

      expect(() => assertTestDatabaseUrl('')).toThrow(/DATABASE_URL is not set/i);
    });

    test('confirms active MySQL connection via SELECT DATABASE() is a test database', async () => {
      const activeDb = await verifyActiveDatabaseIsTest(prisma);
      expect(activeDb.toLowerCase()).toContain('test');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. POST /api/auth/register
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /api/auth/register', () => {
    test('registers a new user (201) and hashes password with Argon2', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'NewUser@Test.com',
        name: 'New User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        success: true,
        message: 'User registered successfully',
      });

      const saved = await prisma.user.findUnique({
        where: { email: 'newuser@test.com' },
      });
      expect(saved).not.toBeNull();
      expect(saved.name).toBe('New User');
      expect(saved.role).toBe('STUDENT');
      expect(saved.password.startsWith('$argon2')).toBe(true);
    });

    test('returns 400 when email or password is missing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: '',
        password: '',
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        error: 'Email and password are required',
      });
    });

    test('returns 400 when password and confirmPassword do not match', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'mismatch@test.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword!',
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        error: 'Passwords do not match',
      });
    });

    test('Question (أ): ignores role in req.body and always assigns STUDENT', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'attempt-admin@test.com',
        name: 'Attempt Admin',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'SUPER_ADMIN',
      });

      expect(res.status).toBe(201);
      const userInDb = await prisma.user.findUnique({
        where: { email: 'attempt-admin@test.com' },
      });
      expect(userInDb.role).toBe('STUDENT');
    });

    test('KNOWN ISSUE: registering with a duplicate email returns 500 instead of 400/409', async () => {
      await createTestUser({ email: 'dup@test.com' });

      const res = await request(app).post('/api/auth/register').send({
        email: 'dup@test.com',
        name: 'Duplicate',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      // KNOWN ISSUE - current behavior: unhandled Prisma P2002 unique constraint falls into catch block returning 500
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Failed to register');
      expect(res.body).toHaveProperty('details');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. POST /api/auth/login & Question (ب)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /api/auth/login', () => {
    test('Question (ب): logs in user (200), returns 30d JWT in body and HttpOnly cookie with expected attributes', async () => {
      const { user } = await createTestUser({
        email: 'login@test.com',
        name: 'Login User',
        password: 'Password123!',
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'login@test.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.data).toEqual({
        id: user.id,
        email: 'login@test.com',
        role: 'STUDENT',
        name: 'Login User',
      });
      expect(typeof res.body.token).toBe('string');

      // Verify JWT expiry is 30 days (2,592,000 seconds)
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(user.id);
      expect(decoded.exp - decoded.iat).toBe(30 * 24 * 60 * 60);

      // Verify Set-Cookie attributes
      const setCookie = res.headers['set-cookie'];
      expect(setCookie).toBeDefined();
      const tokenCookie = setCookie.find((c) => c.startsWith('token='));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toContain('HttpOnly');
      expect(tokenCookie).toContain('Path=/');
      expect(tokenCookie).toMatch(/SameSite=Lax/i);
      expect(tokenCookie).toContain('Max-Age=2592000');
      expect(tokenCookie).not.toContain('Secure');
    });

    test('supports legacy bcrypt password hashes and upgrades them to Argon2 on login', async () => {
      const { user } = await createTestUser({
        email: 'legacy@test.com',
        password: 'LegacyPassword123!',
        useBcrypt: true,
      });

      const beforeLogin = await prisma.user.findUnique({ where: { id: user.id } });
      expect(beforeLogin.password.startsWith('$2b$')).toBe(true);

      const res = await request(app).post('/api/auth/login').send({
        email: 'legacy@test.com',
        password: 'LegacyPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const afterLogin = await prisma.user.findUnique({ where: { id: user.id } });
      expect(afterLogin.password.startsWith('$argon2')).toBe(true);
    });

    test('returns 400 when email or password is missing', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        error: 'Email and password are required',
      });
    });

    test('returns 400 when email does not exist or password is wrong', async () => {
      await createTestUser({ email: 'valid@test.com', password: 'CorrectPassword!' });

      const resWrongPass = await request(app).post('/api/auth/login').send({
        email: 'valid@test.com',
        password: 'WrongPassword!',
      });
      expect(resWrongPass.status).toBe(400);
      expect(resWrongPass.body).toEqual({
        success: false,
        error: 'Invalid credentials',
      });

      const resNoUser = await request(app).post('/api/auth/login').send({
        email: 'nobody@test.com',
        password: 'CorrectPassword!',
      });
      expect(resNoUser.status).toBe(400);
      expect(resNoUser.body).toEqual({
        success: false,
        error: 'Invalid credentials',
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. POST /api/auth/logout
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /api/auth/logout', () => {
    test('clears token cookie and returns 200', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Logged out successfully',
      });
      expect(res.headers['set-cookie'][0]).toContain('token=;');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. GET /api/auth/me & Known Issue (stack trace in error responses)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/auth/me', () => {
    test('returns current user (200) via Bearer token and via Cookie without password field', async () => {
      const { user, token } = await createTestUser({
        email: 'me@test.com',
        name: 'Current User',
      });

      const resBearer = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(resBearer.status).toBe(200);
      expect(resBearer.body.success).toBe(true);
      expect(resBearer.body.data).toMatchObject({
        id: user.id,
        email: 'me@test.com',
        name: 'Current User',
        role: 'STUDENT',
      });
      expect(resBearer.body.data).not.toHaveProperty('password');

      const resCookie = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${token}`]);

      expect(resCookie.status).toBe(200);
      expect(resCookie.body.data.id).toBe(user.id);
    });

    test('returns 401 when no token is provided and KNOWN ISSUE: includes stack in error response', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Not authorized, no token');
      // KNOWN ISSUE - current behavior: errorHandlerMiddleware exposes err.stack when NODE_ENV !== 'production'
      expect(res.body).toHaveProperty('stack');
    });

    test('returns 401 when token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Not authorized, token failed');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. GET /api/auth/dashboard-stats (Characterization + Known Issue B.2)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/auth/dashboard-stats', () => {
    test('returns platform statistics (200) for SUPER_ADMIN', async () => {
      const { token } = await createTestUser({
        email: 'superadmin@test.com',
        role: 'SUPER_ADMIN',
      });

      const res = await request(app)
        .get('/api/auth/dashboard-stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        users: 1,
        students: 0,
        admins: 1,
        learningPaths: 0,
        roadmaps: 0,
        lessons: 0,
        jobs: 0,
        communities: 0,
        projects: 0,
      });
    });

    test('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/auth/dashboard-stats');
      expect(res.status).toBe(401);
    });

    test('KNOWN ISSUE: allows STUDENT to access /api/auth/dashboard-stats (200 instead of 403)', async () => {
      const { token: studentToken } = await createTestUser({
        email: 'student-stats@test.com',
        role: 'STUDENT',
      });

      const res = await request(app)
        .get('/api/auth/dashboard-stats')
        .set('Authorization', `Bearer ${studentToken}`);

      // KNOWN ISSUE - current behavior: missing allowedTo('SUPER_ADMIN') on /dashboard-stats route
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('users');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. GET /api/auth/all-users (Characterization + Known Issue B.2)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /api/auth/all-users', () => {
    test('returns paginated users list (200) for SUPER_ADMIN and filters by role', async () => {
      const { token: saToken } = await createTestUser({
        email: 'sa@test.com',
        role: 'SUPER_ADMIN',
      });
      await createTestUser({ email: 's1@test.com', role: 'STUDENT' });
      await createTestUser({ email: 'a1@test.com', role: 'ADMIN' });

      const res = await request(app)
        .get('/api/auth/all-users?role=STUDENT&page=1&limit=10')
        .set('Authorization', `Bearer ${saToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].email).toBe('s1@test.com');
      expect(res.body.data[0]).not.toHaveProperty('password');
      expect(res.body.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    test('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/auth/all-users');
      expect(res.status).toBe(401);
    });

    test('KNOWN ISSUE: allows STUDENT to access /api/auth/all-users (200 instead of 403)', async () => {
      const { token: studentToken } = await createTestUser({
        email: 'student-dump@test.com',
        role: 'STUDENT',
      });

      const res = await request(app)
        .get('/api/auth/all-users')
        .set('Authorization', `Bearer ${studentToken}`);

      // KNOWN ISSUE - current behavior: missing allowedTo('SUPER_ADMIN') on /all-users route
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. POST /api/auth/change-role
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /api/auth/change-role', () => {
    test('allows SUPER_ADMIN to change user role (200)', async () => {
      const { token: saToken } = await createTestUser({
        email: 'sa@test.com',
        role: 'SUPER_ADMIN',
      });
      await createTestUser({ email: 'target@test.com', role: 'STUDENT' });

      const res = await request(app)
        .post('/api/auth/change-role')
        .set('Authorization', `Bearer ${saToken}`)
        .send({ email: 'target@test.com', role: 'ADMIN' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        message: 'Role updated successfully',
        data: {
          email: 'target@test.com',
          role: 'ADMIN',
        },
      });
    });

    test('returns 400 for invalid role', async () => {
      const { token: saToken } = await createTestUser({
        email: 'sa@test.com',
        role: 'SUPER_ADMIN',
      });

      const res = await request(app)
        .post('/api/auth/change-role')
        .set('Authorization', `Bearer ${saToken}`)
        .send({ email: 'sa@test.com', role: 'INVALID_ROLE' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid role');
    });

    test('returns 401 without token and 403 for STUDENT', async () => {
      const { token: studentToken } = await createTestUser({
        email: 'student@test.com',
        role: 'STUDENT',
      });

      const resUnauth = await request(app)
        .post('/api/auth/change-role')
        .send({ email: 'student@test.com', role: 'ADMIN' });
      expect(resUnauth.status).toBe(401);

      const resForbidden = await request(app)
        .post('/api/auth/change-role')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ email: 'student@test.com', role: 'ADMIN' });
      expect(resForbidden.status).toBe(403);
      expect(resForbidden.body.error).toBe('You are not allowed to access this route');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. POST /api/auth/add-user
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /api/auth/add-user', () => {
    test('allows SUPER_ADMIN to add a new user (201) without returning password', async () => {
      const { token: saToken } = await createTestUser({
        email: 'sa@test.com',
        role: 'SUPER_ADMIN',
      });

      const res = await request(app)
        .post('/api/auth/add-user')
        .set('Authorization', `Bearer ${saToken}`)
        .send({
          email: 'added-admin@test.com',
          name: 'Added Admin',
          role: 'ADMIN',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('ADMIN added successfully');
      expect(res.body.data.email).toBe('added-admin@test.com');
      expect(res.body.data.role).toBe('ADMIN');
      expect(res.body.data).not.toHaveProperty('password');
    });

    test('returns 400 on missing fields, invalid role, or existing user', async () => {
      const { token: saToken } = await createTestUser({
        email: 'sa@test.com',
        role: 'SUPER_ADMIN',
      });

      const resMissing = await request(app)
        .post('/api/auth/add-user')
        .set('Authorization', `Bearer ${saToken}`)
        .send({ email: 'a@b.com' });
      expect(resMissing.status).toBe(400);
      expect(resMissing.body.error).toBe('All fields are required');

      const resInvalidRole = await request(app)
        .post('/api/auth/add-user')
        .set('Authorization', `Bearer ${saToken}`)
        .send({
          email: 'a@b.com',
          name: 'Name',
          role: 'GUEST',
          password: 'Password123!',
        });
      expect(resInvalidRole.status).toBe(400);
      expect(resInvalidRole.body.error).toBe('Invalid role');

      const resExisting = await request(app)
        .post('/api/auth/add-user')
        .set('Authorization', `Bearer ${saToken}`)
        .send({
          email: 'sa@test.com',
          name: 'SA',
          role: 'ADMIN',
          password: 'Password123!',
        });
      expect(resExisting.status).toBe(400);
      expect(resExisting.body.error).toBe('User already exists');
    });

    test('returns 401 without token and 403 for STUDENT', async () => {
      const { token: studentToken } = await createTestUser({
        email: 'student@test.com',
        role: 'STUDENT',
      });

      const resUnauth = await request(app).post('/api/auth/add-user').send({});
      expect(resUnauth.status).toBe(401);

      const resForbidden = await request(app)
        .post('/api/auth/add-user')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});
      expect(resForbidden.status).toBe(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. DELETE /api/auth/delete-user & Question (د)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('DELETE /api/auth/delete-user', () => {
    test('Question (د - الجزء 1): deletes user and cascades deletion for relations with onDelete: Cascade (UserStats, Notification)', async () => {
      const { token: saToken } = await createTestUser({
        email: 'sa@test.com',
        role: 'SUPER_ADMIN',
      });
      const { user: targetUser } = await createTestUser({
        email: 'delete-me@test.com',
      });

      await prisma.userStats.create({
        data: { userId: targetUser.id, reputation: 10 },
      });
      await prisma.notification.create({
        data: { userId: targetUser.id, message: 'Welcome' },
      });

      const res = await request(app)
        .delete('/api/auth/delete-user')
        .set('Authorization', `Bearer ${saToken}`)
        .send({ email: 'delete-me@test.com' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'User deleted successfully',
      });

      const statsCount = await prisma.userStats.count({
        where: { userId: targetUser.id },
      });
      expect(statsCount).toBe(0);
    });

    test('Question (د - الجزء 2) / KNOWN ISSUE: returns 500 when deleting a user who owns a Roadmap/LearningPath (missing onDelete: Cascade)', async () => {
      const { token: saToken } = await createTestUser({
        email: 'sa@test.com',
        role: 'SUPER_ADMIN',
      });
      const { user: creatorUser } = await createTestUser({
        email: 'creator@test.com',
        role: 'SUPER_ADMIN',
      });

      await prisma.roadmap.create({
        data: {
          title: 'Test Roadmap',
          slug: 'test-roadmap-fk',
          category: 'Web',
          estimatedDuration: 10,
          createdById: creatorUser.id,
        },
      });

      const res = await request(app)
        .delete('/api/auth/delete-user')
        .set('Authorization', `Bearer ${saToken}`)
        .send({ email: 'creator@test.com' });

      // KNOWN ISSUE - current behavior: Prisma FK constraint error P2003 caught and returned as 500
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Failed to delete user');
    });

    test('returns 400 when email is missing and 404 when user does not exist', async () => {
      const { token: saToken } = await createTestUser({
        email: 'sa@test.com',
        role: 'SUPER_ADMIN',
      });

      const resMissing = await request(app)
        .delete('/api/auth/delete-user')
        .set('Authorization', `Bearer ${saToken}`)
        .send({});
      expect(resMissing.status).toBe(400);
      expect(resMissing.body.error).toBe('Email is required');

      const resNotFound = await request(app)
        .delete('/api/auth/delete-user')
        .set('Authorization', `Bearer ${saToken}`)
        .send({ email: 'ghost@test.com' });
      expect(resNotFound.status).toBe(404);
      expect(resNotFound.body.error).toBe('User not found');
    });

    test('returns 401 without token and 403 for STUDENT', async () => {
      const { token: studentToken } = await createTestUser({
        email: 'student@test.com',
        role: 'STUDENT',
      });

      const resUnauth = await request(app)
        .delete('/api/auth/delete-user')
        .send({ email: 'student@test.com' });
      expect(resUnauth.status).toBe(401);

      const resForbidden = await request(app)
        .delete('/api/auth/delete-user')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ email: 'student@test.com' });
      expect(resForbidden.status).toBe(403);
    });
  });
});

