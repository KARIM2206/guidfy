const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.$queryRawUnsafe('DESCRIBE community');
  console.log(c);
  
  const b = await prisma.$queryRawUnsafe('DESCRIBE bannedmember');
  console.log(b);
}
main().catch(console.error).finally(() => prisma.$disconnect());
