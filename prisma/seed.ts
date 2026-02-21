import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { seedFaculties } from "./seed/faculties";
import { seedLectures } from "./seed/lectures";
import { seedSchedules } from "./seed/schedules";
import { seedTestUsers } from "./seed/test-users";
import { seedTerms } from "./seed/terms";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const main = async () => {
  console.log("シードデータの投入を開始...");

  await prisma.user.upsert({
    where: { id: "system" },
    update: {
      username: "__system__",
      displayName: "System",
      isProfileComplete: true,
      isAdmin: true,
    },
    create: {
      id: "system",
      username: "__system__",
      displayName: "System",
      isProfileComplete: true,
      isAdmin: true,
    },
  });

  await seedTerms(prisma);
  await seedFaculties(prisma);
  await seedTestUsers(prisma);
  await seedSchedules(prisma);
  await seedLectures(prisma);

  console.log("シードデータの投入が完了しました");
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error("エラー:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
