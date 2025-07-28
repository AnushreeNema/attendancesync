import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import { Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";
// import GitHubProvider from "next-auth/providers/github";
// import ResendProvider from "next-auth/providers/resend";
import prisma from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,

  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    Google,
    // GitHubProvider(),
    // ResendProvider({
    //   from: "anushreenema624@gmail.com",
    // }),
  ],

  callbacks: {
    async session({ session, user }) {
      session.user.role = user.role;
      return session;
    },

    async signIn({ user }) {
      // Ensure user.id is defined
      if (!user.id) {
        console.error("user.id is undefined during sign-in");
        return false;
      }

      const today = new Date();
      const dateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      try {
        await prisma.login.upsert({
          where: {
            userId_date: {
              userId: user.id,
              date: dateOnly,
            },
          },
          update: {},
          create: {
            userId: user.id,
            date: dateOnly,
          },
        });
      } catch (error) {
        console.error("Failed to record login:", error);
        // Still allow sign-in to succeed
      }

      return true;
    },
  },
});
