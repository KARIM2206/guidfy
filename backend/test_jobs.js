const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$executeRawUnsafe(`UPDATE Job SET status = 'PUBLISHED' WHERE status = 'ACTIVE'`);
  console.log('Updated rows:', result);
  
  const jobs = await prisma.job.findMany({
    select: { id: true, status: true, learningPathId: true }
  });
  console.log('Current jobs:', jobs);
}

main().finally(() => prisma.$disconnect());
