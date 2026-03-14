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

const parseYearValue = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 3000) {
    throw new Error(`academicYear must be a valid integer year. Received: ${value}`);
  }

  return parsed;
};

const parseAcademicYear = (args: string[]) => {
  const fromEnv = parseYearValue(process.env.ACADEMIC_YEAR);
  if (fromEnv) {
    return fromEnv;
  }

  const flag = args.find(arg => arg.startsWith("--academic-year="));
  const explicitValue =
    flag?.split("=")[1] ??
    (() => {
      const flagIndex = args.findIndex(arg => arg === "--academic-year");
      return flagIndex >= 0 ? args[flagIndex + 1] : undefined;
    })();

  return parseYearValue(explicitValue);
};

const main = async () => {
  const academicYear = parseAcademicYear(process.argv.slice(2));

  console.log("シードデータの投入を開始...");
  if (academicYear) {
    console.log(`対象年度: ${academicYear}`);
  }

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

  await seedTerms(prisma, academicYear);
  await seedFaculties(prisma);
  await seedTestUsers(prisma);
  await seedSchedules(prisma);
  await seedLectures(prisma, academicYear);

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
