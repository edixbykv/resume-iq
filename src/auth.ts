import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, dbEnabled } from "@/lib/prisma";

/**
 * NextAuth v5 configuration. Providers are enabled only when their credentials
 * exist, and the Prisma adapter is attached only when DATABASE_URL is set — so
 * the app runs with zero auth config and progressively enables sign-in.
 */
const providers: NextAuthConfig["providers"] = [];
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET }));
}
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  trustHost: true,
  pages: { signIn: "/analyze" },
  ...(dbEnabled
    ? { adapter: PrismaAdapter(prisma), session: { strategy: "database" as const } }
    : { session: { strategy: "jwt" as const } }),
});
