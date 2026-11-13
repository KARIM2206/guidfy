// prismaClient.js — SINGLETON ENFORCED
// ⚠️  Import ONLY this file for Prisma access. Never use `new PrismaClient()` elsewhere.

'use strict';

const { PrismaClient } = require('@prisma/client');

const logLevels =
  process.env.NODE_ENV === 'production'
    ? ['warn', 'error']
    : ['warn', 'error']; // add 'query' locally if you need SQL tracing

let prisma;

if (process.env.NODE_ENV === 'production') {
  // Production: single instance, no global leak
  prisma = new PrismaClient({ log: logLevels });
} else {
  // Development / test: reuse across hot-reloads (Next.js / nodemon)
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({ log: logLevels });
  }
  prisma = global.__prisma;
}

// ── Lazy connect — Prisma connects on first query automatically.
// We still verify connectivity at startup so a bad DATABASE_URL fails fast.
prisma
  .$connect()
  .then(() => {
    console.info('✅ Prisma connected successfully');
  })
  .catch((err) => {
    console.error('❌ Prisma connection failed:', err.message);
    process.exit(1);
  });

// ── Graceful shutdown
const shutdown = async () => {
  await prisma.$disconnect();
};
process.on('beforeExit', shutdown);
process.on('SIGINT',     shutdown);
process.on('SIGTERM',    shutdown);

module.exports = prisma;

