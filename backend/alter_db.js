const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE community ADD COLUMN adminId INT NULL;');
    await prisma.$executeRawUnsafe('ALTER TABLE community ADD CONSTRAINT community_adminId_fkey FOREIGN KEY (adminId) REFERENCES User(id) ON DELETE SET NULL ON UPDATE CASCADE;');
    console.log('Added adminId successfully!');
  } catch(e) {
    console.error(e);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
