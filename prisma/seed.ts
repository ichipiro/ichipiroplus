import { PrismaClient } from "@prisma/client";
import { seedFaculties } from "./seed/faculties";
import { seedLectures } from "./seed/lectures";
import { seedSchedules } from "./seed/schedules";
import { seedTerms } from "./seed/terms";

const prisma = new PrismaClient();

const main = async () => {
  console.log("シードデータの投入を開始...");

  await seedTerms(prisma);
  await seedFaculties(prisma);
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
