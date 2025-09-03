import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 シードデータの投入を開始...");

  // Termデータ（現在の学期）
  console.log("📅 Term（学期）データを作成...");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // 現在の学期を判定
  let currentTermNumber = 1;
  if (currentMonth >= 10 || currentMonth <= 3) {
    currentTermNumber = 3; // 後期
  } else if (currentMonth >= 4 && currentMonth <= 7) {
    currentTermNumber = 1; // 前期
  } else {
    currentTermNumber = 2; // 夏期
  }

  // 今年度の学期を作成
  const terms = [
    {
      name: `${currentYear}年度 第1ターム`,
      year: currentYear,
      number: 1,
      startDate: new Date(currentYear, 3, 1), // 4月1日
      endDate: new Date(currentYear, 6, 31), // 7月31日
    },
    {
      name: `${currentYear}年度 第2ターム`,
      year: currentYear,
      number: 2,
      startDate: new Date(currentYear, 7, 1), // 8月1日
      endDate: new Date(currentYear, 8, 30), // 9月30日
    },
    {
      name: `${currentYear}年度 第3ターム`,
      year: currentYear,
      number: 3,
      startDate: new Date(currentYear, 9, 1), // 10月1日
      endDate: new Date(currentYear + 1, 2, 31), // 3月31日
    },
  ];

  for (const termData of terms) {
    const term = await prisma.term.upsert({
      where: {
        year_number: {
          year: termData.year,
          number: termData.number,
        },
      },
      update: {},
      create: termData,
    });
    console.log(`✅ Term作成: ${term.name}`);
  }

  // 学部データ
  const faculties = [
    { name: "国際学部" },
    { name: "情報科学部" },
    { name: "芸術学部" },
  ];

  // 学部を作成
  for (const facultyData of faculties) {
    // まず既存の学部を検索
    let faculty = await prisma.faculty.findFirst({
      where: { name: facultyData.name },
    });

    // 存在しない場合は作成
    if (!faculty) {
      faculty = await prisma.faculty.create({
        data: facultyData,
      });
    }

    console.log(`✅ 学部作成: ${faculty.name}`);

    // 各学部の学科を作成
    const departments = getDepartmentsByFaculty(faculty.name);

    for (const deptName of departments) {
      // まず既存の学科を検索
      let department = await prisma.department.findFirst({
        where: {
          name: deptName,
          facultyId: faculty.id,
        },
      });

      // 存在しない場合は作成
      if (!department) {
        department = await prisma.department.create({
          data: {
            name: deptName,
            facultyId: faculty.id,
          },
        });
      }

      console.log(`  ✅ 学科作成: ${department.name}`);
    }
  }

  // スケジュール（曜日×時限）
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
      console.log(
        `✅ スケジュール作成: ${days[day - 1]}曜${periods[time - 1]}`
      );
      scheduleId++;
    }
  }

  console.log("🎉 シードデータの投入が完了しました！");
}

// 学部ごとの学科データ
function getDepartmentsByFaculty(facultyName: string): string[] {
  switch (facultyName) {
    case "国際学部":
      return ["国際学科", "国際学研究科"];
    case "情報科学部":
      return [
        "未配属",
        "情報工学科",
        "知能工学科",
        "システム工学科",
        "医用情報科学科",
        "情報科学研究科",
      ];
    case "芸術学部":
      return ["美術学科", "芸術学研究科", "デザイン工芸学科"];
    default:
      return [];
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ エラー:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
