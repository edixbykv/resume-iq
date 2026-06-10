import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton. Only meaningfully used when DATABASE_URL is configured.
 * `dbEnabled` lets callers cheaply skip persistence in the zero-config setup.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const dbEnabled = Boolean(process.env.DATABASE_URL);
