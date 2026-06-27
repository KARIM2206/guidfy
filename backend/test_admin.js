const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.community.findUnique({
    where: { id: 6 },
    include: { admin: true }
  });
  console.log('Query successful:', !!c);
}
main().catch(console.error).finally(() => prisma.$disconnect());
