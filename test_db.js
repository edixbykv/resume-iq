const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Fetching recent OTP logs...");
    const logs = await prisma.otpLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log("Recent logs:", JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
