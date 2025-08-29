import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * 管理者権限をチェックする関数
 * 管理者でない場合はホームページにリダイレクト
 */
export async function checkAdminAccess() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!userProfile?.isAdmin) {
    redirect("/");
  }

  return session.user;
}

/**
 * ユーザーが管理者かどうかを確認する関数
 * リダイレクトなし、boolean値を返す
 */
export async function isUserAdmin(userId?: string): Promise<boolean> {
  if (!userId) return false;

  const userProfile = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  return userProfile?.isAdmin || false;
}
