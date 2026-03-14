import { getAcademicYear } from "@/lib/academic-year";
import type { PrismaClient } from "@prisma/client";

export const seedTerms = async (
  prisma: PrismaClient,
  academicYear = getAcademicYear(),
) => {
  console.log("学期データを作成...");

  const terms = [
    {
      academicYear,
      name: `${academicYear}年度 第1ターム`,
      number: 1,
      startDate: new Date(academicYear, 3, 8), // 4月8日
      endDate: new Date(academicYear, 5, 30), // 6月30日
    },
    {
      academicYear,
      name: `${academicYear}年度 第2ターム`,
      number: 2,
      startDate: new Date(academicYear, 6, 7), // 7月7日
      endDate: new Date(academicYear, 8, 8), // 9月8日
    },
    {
      academicYear,
      name: `${academicYear}年度 第3ターム`,
      number: 3,
      startDate: new Date(academicYear, 9, 1), // 10月1日
      endDate: new Date(academicYear, 10, 27), // 11月27日
    },
    {
      academicYear,
      name: `${academicYear}年度 第4ターム`,
      number: 4,
      startDate: new Date(academicYear, 11, 1), // 12月1日
      endDate: new Date(academicYear + 1, 1, 5), // 2月5日
    },
  ];

  for (const termData of terms) {
    const term = await prisma.term.upsert({
      where: {
        academicYear_number: {
          academicYear: termData.academicYear,
          number: termData.number,
        },
      },
      update: {},
      create: termData,
    });
    console.log(`Term作成: ${term.name}`);
  }
};
