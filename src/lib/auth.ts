import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import {
  type DevTestAccount,
  getDevTestAccounts,
} from "../../prisma/seed/test-users-data";

const isDev = process.env.NODE_ENV !== "production";

const parseDevAccounts = (): DevTestAccount[] => {
  if (!isDev) return [];
  return getDevTestAccounts();
};

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    MicrosoftEntraID({
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    ...(isDev
      ? [
          Credentials({
            name: "dev-credentials",
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" },
            },
            authorize: async credentials => {
              const email = String(credentials?.email ?? "").toLowerCase();
              const password = String(credentials?.password ?? "");

              if (!email || !password) return null;

              const devAccounts = parseDevAccounts();
              const matched = devAccounts.find(
                account =>
                  account.email.toLowerCase() === email &&
                  account.password === password,
              );

              if (!matched) return null;

              const existingUser = await prisma.user.findUnique({
                where: { email },
              });
              if (!existingUser) {
                if (isDev) {
                  console.warn(
                    `[dev-auth] テストユーザーがDBに存在しません: ${email}. 先に npm run db:seed を実行してください。`,
                  );
                }
                return null;
              }

              return {
                id: existingUser.id,
                email: existingUser.email,
                name: existingUser.name,
                image: existingUser.image,
              };
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "microsoft-entra-id") {
        const email = user.email || "";
        // 大学のメールアドレスのみ許可
        if (!email.endsWith("hiroshima-cu.ac.jp")) {
          return false; // サインインを拒否
        }

        return true;
      }

      if (account?.provider === "credentials" && isDev) {
        return true;
      }

      return false;
    },
    async jwt({ token, user, trigger, session }) {
      // 初回ログイン時
      if (user) {
        token.id = user.id;
        token.email = user.email;

        // データベースからisProfileCompleteを取得
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isProfileComplete: true },
        });

        token.isProfileComplete = dbUser?.isProfileComplete || false;
      }

      // unstable_updateで更新された場合
      if (
        trigger === "update" &&
        session?.user?.isProfileComplete !== undefined
      ) {
        token.isProfileComplete = session.user.isProfileComplete;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.isProfileComplete = token.isProfileComplete as boolean;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (process.env.NODE_ENV !== "production") {
        await prisma.user.update({
          where: { id: user.id },
          data: { isAdmin: true },
        });
      }
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      isProfileComplete: boolean;
    };
  }
}
