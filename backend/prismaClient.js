// prismaClient.js
const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: [ 'warn', 'error'], // Enable logging for debugging
    });
  }
  prisma = global.__prisma;
}

// Test connection
prisma.$connect()
  .then(() => {
     ('✅ Prisma connected successfully');
  })
  .catch((error) => {
    console.error('❌ Prisma connection failed:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
   //('🔌 Disconnecting Prisma...');
  await prisma.$disconnect();
});

module.exports = prisma;