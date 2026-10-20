import "dotenv/config";
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV !== "production") {
  console.warn(
    "[prisma] DATABASE_URL is not defined in environment variables. Database operations may fail."
  );
}

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: process.env.NODE_ENV === "production" ? 3 : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: process.env.NODE_ENV === "production" ? 10000 : 4000,
  });

pool.on("error", (err: Error) => {
  console.error("[pg-pool] Unexpected error on idle database client:", err.message);
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

// Cache both prisma and pool on globalThis for development HMR and warm serverless container reuse
globalForPrisma.prisma = prisma;
globalForPrisma.pool = pool;

// Re-export common Prisma model types and Prisma namespace
export type {
  Prisma,
  PrismaClient,
  MagazineIssue,
  Article,
  Category,
  WriterProfile,
  ArticleRevision,
  EditorialActivity,
  AuditLog,
  User,
} from "@prisma/client";

