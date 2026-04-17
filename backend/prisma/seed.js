// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const admins = [
    {
      email: "admin1@guidify.com",
      name: "Admin One",
      password: "Admin@123"
    },
    {
      email: "admin2@guidify.com",
      name: "Admin Two",
      password: "Admin@123"
    }
  ];
const superAdmin = {
  email: "superadmin@guidify.com",
  name: "Super Admin",
  password: "Admin@123"
}
  for (let admin of admins) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        name: admin.name,
        password: hashedPassword,
        role: "ADMIN"
      }
    });
    console.log(`✅ Admin ${admin.name} created or already exists.`);
  }
    const hashedPassword = await bcrypt.hash(superAdmin.password, 10);

    await prisma.user.upsert({
      where: { email: superAdmin.email },
      update: {},
      create: {
        email: superAdmin.email,
        name: superAdmin.name,
        password: hashedPassword,
        role: "SUPER_ADMIN"
      }
    });
    console.log(`✅ Super Admin ${superAdmin.name} created or already exists.`);
  console.log("✅ Multi Admins Created Successfully!  🚀 this admin",);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());