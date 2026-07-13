import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma, dbEnabled } from "@/lib/prisma";

const providers: NextAuthConfig["providers"] = [];
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET }));
}
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET }));
}

// Custom OTP Credentials Provider
providers.push(
  Credentials({
    name: "OTP",
    credentials: {
      email: { label: "Email", type: "email" },
      code: { label: "OTP Code", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.code) return null;

      const email = (credentials.email as string).toLowerCase().trim();
      const code = credentials.code as string;

      if (!dbEnabled) {
        // Fallback for demonstration when DATABASE_URL is not set
        return {
          id: "demo-user",
          name: email.split("@")[0],
          email: email,
        };
      }

      // 1. Verify OTP in database
      const log = await prisma.otpLog.findFirst({
        where: {
          email,
          code,
          expiresAt: { gt: new Date() },
          verified: false,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!log) return null;

      // Mark OTP as verified
      await prisma.otpLog.update({
        where: { id: log.id },
        data: { verified: true },
      });

      // 2. Fetch or auto-create User
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            emailVerified: new Date(),
            name: email.split("@")[0],
          },
        });
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  trustHost: true,
  pages: { signIn: "/analyze" },
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
