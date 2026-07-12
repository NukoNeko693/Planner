import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  prismaSchemaVersion?: string;
};
// Fast Refreshが保持する古いClientを、フィールド追加時にも確実に破棄する。
const prismaSchemaVersion = "20260711190000";
const cachedPrisma = globalForPrisma.prisma;
export const prisma =
  cachedPrisma && globalForPrisma.prismaSchemaVersion === prismaSchemaVersion
    ? cachedPrisma
    : new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaVersion = prismaSchemaVersion;
}
