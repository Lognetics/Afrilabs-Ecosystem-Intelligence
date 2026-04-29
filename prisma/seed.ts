import { PrismaClient } from "@prisma/client";
import { runSeed } from "../src/lib/seed";

const prisma = new PrismaClient();

runSeed(prisma)
  .then((stats) => {
    console.log("✓ Seeded:", stats);
    console.log("  Login: admin@afrilabs.test / admin1234");
  })
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
