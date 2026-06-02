import { PrismaClient } from "../generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (typeof window === "undefined") {
  if (process.env.NODE_ENV === "production") {
    const dbPath = path.join(process.cwd(), "dev.db");
    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    prismaInstance = new PrismaClient({ adapter });
  } else {
    if (!globalForPrisma.prisma) {
      const dbPath = path.join(process.cwd(), "dev.db");
      const adapter = new PrismaBetterSqlite3({ url: dbPath });
      globalForPrisma.prisma = new PrismaClient({ adapter });
    }
    prismaInstance = globalForPrisma.prisma;
  }
} else {
  prismaInstance = null as any;
}

export const prisma = prismaInstance;
export default prisma;
