import { readJson } from "@/lib/read-json";
import type { PrismaClient } from "@prisma/client";

type FacultySeedData = {
  name: string;
  departments: string[];
};

export const seedFaculties = async (prisma: PrismaClient) => {
  const faculties = await readJson<FacultySeedData[]>(
    "data/faculties.json",
    import.meta.url,
  );

  for (const facultyData of faculties) {
    let faculty = await prisma.faculty.findFirst({
      where: { name: facultyData.name },
    });

    if (!faculty) {
      faculty = await prisma.faculty.create({
        data: {
          name: facultyData.name,
        },
      });
    }

    console.log(`学部作成: ${faculty.name}`);

    for (const deptName of facultyData.departments) {
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
