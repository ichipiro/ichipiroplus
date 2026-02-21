import type { PrismaClient } from "@prisma/client";
import {
  getDevTestAccounts,
  toBaseUsername,
} from "./test-users-data";

const createUniqueUsername = async (prisma: PrismaClient, base: string) => {
  for (let i = 0; i < 1000; i += 1) {
    const username = i === 0 ? base : `${base}_${i}`;
    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!existing) {
      return username;
    }
  }

  return `dev_user_${Date.now()}`;
};

export const seedTestUsers = async (prisma: PrismaClient) => {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const items = getDevTestAccounts();

  console.log(`テストアカウントを作成... (${items.length}件)`);

  for (const item of items) {
    const email = item.email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: item.name ?? email,
          displayName: item.name ?? email,
          isProfileComplete: true,
        },
      });
      console.log(`テストアカウント更新: ${email}`);
      continue;
    }

    const baseUsername = item.username ?? toBaseUsername(email);
    const username = await createUniqueUsername(prisma, baseUsername);

    await prisma.user.create({
      data: {
        email,
        name: item.name ?? email,
        username,
        displayName: item.name ?? email,
        isProfileComplete: true,
      },
    });
    console.log(`テストアカウント作成: ${email}`);
  }
};
