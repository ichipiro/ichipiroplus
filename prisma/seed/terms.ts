import type { PrismaClient } from "@prisma/client";

export const seedTerms = async (prisma: PrismaClient) => {
  console.log("学期データを作成...");

  const currentYear = new Date().getFullYear();

  const terms = [
    {
      name: "第1ターム",
      number: 1,
      startDate: new Date(currentYear, 4, 8), // 4月8日
      endDate: new Date(currentYear, 6, 6),
    },
    {
      name: "第2ターム",
      number: 2,
      startDate: new Date(currentYear, 6, 7), // 6月7日
      endDate: new Date(currentYear, 8, 8), // 8月8日
    },
    {
      name: "第3ターム",
      number: 3,
      startDate: new Date(currentYear, 10, 1), // 10月1日
      endDate: new Date(currentYear, 11, 27), // 11月27日
    },
    {
      name: "第4ターム",
      number: 4,
      startDate: new Date(currentYear, 11, 28), // 11月28日
      endDate: new Date(currentYear + 1, 2, 5), // 2月5日
    },
  ];

  for (const termData of terms) {
    const term = await prisma.term.upsert({
      where: {
        number: termData.number,
      },
      update: {},
      create: termData,
    });
    console.log(`Term作成: ${term.name}`);
  }
};
