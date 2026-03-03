import { PrismaClient } from "@prisma/client";

/**
 * Prisma クライアントのシングルトンインスタンス
 *
 * 開発環境では Hot Reload のたびに新しい PrismaClient が生成され、
 * 接続プールが枯渇する問題を防ぐため、globalThis にキャッシュする。
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
