import type { PrismaClient } from "@prisma/client";

export const seedSchedules = async (prisma: PrismaClient) => {
  const days = ["月", "火", "水", "木", "金"];
  const periods = ["1限", "2限", "3限", "4限", "5限"];

  let scheduleId = 1;
  for (let day = 1; day <= 5; day++) {
    for (let time = 1; time <= 5; time++) {
      await prisma.schedule.upsert({
        where: { id: scheduleId },
        update: {},
        create: {
          id: scheduleId,
          day,
          time,
        },
      });
      console.log(`スケジュール作成: ${days[day - 1]}曜${periods[time - 1]}`);
      scheduleId++;
    }
  }
};
