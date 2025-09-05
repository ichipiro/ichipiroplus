import type { PrismaClient } from "@prisma/client";

export const getDepartmentsByFaculty = (facultyName: string): string[] => {
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
};

export const seedFaculties = async (prisma: PrismaClient) => {
  const faculties = [
    { name: "国際学部" },
    { name: "情報科学部" },
    { name: "芸術学部" },
  ];

  for (const facultyData of faculties) {
    let faculty = await prisma.faculty.findFirst({
      where: { name: facultyData.name },
    });

    if (!faculty) {
      faculty = await prisma.faculty.create({
        data: facultyData,
      });
    }

    console.log(`学部作成: ${faculty.name}`);

    const departments = getDepartmentsByFaculty(faculty.name);

    for (const deptName of departments) {
      let department = await prisma.department.findFirst({
        where: {
          name: deptName,
          facultyId: faculty.id,
        },
      });

      if (!department) {
        department = await prisma.department.create({
          data: {
            name: deptName,
            facultyId: faculty.id,
          },
        });
      }

      console.log(`学科作成: ${department.name}`);
    }
  }
};
