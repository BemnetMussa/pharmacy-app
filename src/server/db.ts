import pg from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { AppError } from "@/shared/utils/errors";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function isLocalDatabaseUrl(connectionString: string) {
  return (
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1")
  );
}

/** Prefer Pool ssl options over URL sslmode (pg maps require → verify-full). */
function connectionStringWithoutSslMode(connectionString: string) {
  const cleaned = connectionString
    .replace(/([?&])sslmode=[^&]*/g, "$1")
    .replace(/[?&]$/, "")
    .replace(/\?&/, "?")
    .replace(/&&/g, "&");
  return cleaned;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new AppError(
      "DATABASE_URL environment variable is not set",
      500,
      "MISSING_ENV",
    );
  }

  const isLocalDb = isLocalDatabaseUrl(connectionString);
  const pool = new pg.Pool({
    connectionString: connectionStringWithoutSslMode(connectionString),
    ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
