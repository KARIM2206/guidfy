'use strict';

const path = require('path');
const dotenv = require('dotenv');

function assertTestDatabaseUrl(dbUrl = process.env.DATABASE_URL) {
  if (!dbUrl) {
    throw new Error('Refusing to run tests: DATABASE_URL is not set.');
  }

  let parsed;
  try {
    parsed = new URL(dbUrl);
  } catch {
    throw new Error('Refusing to run tests: DATABASE_URL is not a valid URL.');
  }

  const dbName = parsed.pathname.replace(/^\//, '').trim();
  if (!dbName || !/test/i.test(dbName)) {
    throw new Error(
      `Refusing to run tests against non-test DATABASE_URL database "${dbName}". Database name must contain "test".`
    );
  }

  return dbName;
}

// Load .env.test (override: false) ONLY if DATABASE_URL is not already present in the environment
if (!process.env.DATABASE_URL) {
  dotenv.config({
    path: path.resolve(__dirname, '../.env.test'),
    override: false,
  });
}

// Guard 1: Verify DATABASE_URL before loading prismaClient or app
assertTestDatabaseUrl(process.env.DATABASE_URL);

const prisma = require('../src/config/prismaClient');

// Guard 2: Query active database from MySQL via SELECT DATABASE() before any destructive operation
async function verifyActiveDatabaseIsTest(prismaClient = prisma) {
  assertTestDatabaseUrl(process.env.DATABASE_URL);
  const rows = await prismaClient.$queryRaw`SELECT DATABASE() AS dbName`;
  const row = Array.isArray(rows) && rows[0] ? rows[0] : {};
  const activeDb = row.dbName ?? row['DATABASE()'] ?? null;

  if (!activeDb || !/test/i.test(String(activeDb))) {
    throw new Error(
      `Refusing to run deleteMany: active MySQL database "${activeDb}" does not contain "test".`
    );
  }

  return String(activeDb);
}

async function cleanDatabase() {
  await verifyActiveDatabaseIsTest(prisma);

  await prisma.$transaction([
    prisma.jobRecommendationFeedback.deleteMany(),
    prisma.learningPathPermission.deleteMany(),
    prisma.bannedMember.deleteMany(),
    prisma.community.deleteMany(),
    prisma.learningPathRoadmap.deleteMany(),
    prisma.roadmap.deleteMany(),
    prisma.learningPath.deleteMany(),
    prisma.userBadge.deleteMany(),
    prisma.badge.deleteMany(),
    prisma.userStats.deleteMany(),
    prisma.trackProgress.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.userRoadmapProgress.deleteMany(),
    prisma.userLearningPath.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

module.exports = {
  prisma,
  assertTestDatabaseUrl,
  verifyActiveDatabaseIsTest,
  cleanDatabase,
};

