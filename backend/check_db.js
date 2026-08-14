const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const merchants = await prisma.merchantProfile.count();
  const students = await prisma.studentProfile.count();
  const locations = await prisma.storeLocation.count();
  
  console.log(`Users: ${users}`);
  console.log(`Merchants: ${merchants}`);
  console.log(`Students: ${students}`);
  console.log(`Store Locations: ${locations}`);
}

main().finally(() => prisma.$disconnect());
