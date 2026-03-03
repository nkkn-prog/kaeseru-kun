import { prisma } from "@/lib/prisma/client";
import type { Screenshot, ScreenshotInsert } from "@/types/database";
import type { Prisma } from "@prisma/client";

/**
 * Prisma の Screenshot モデルを types/database.ts の Screenshot 型に変換する
 */
function toScreenshot(
  row: Prisma.ScreenshotGetPayload<object>
): Screenshot {
  return {
    id: row.id,
    user_id: row.userId,
    debt_id: row.debtId,
    storage_path: row.storagePath,
    status: row.status as Screenshot["status"],
    processed_at: row.processedAt ? row.processedAt.toISOString() : null,
    created_at: row.createdAt.toISOString(),
  };
}

/**
 * スクリーンショットを新規登録する
 */
export async function createScreenshot(
  data: ScreenshotInsert
): Promise<Screenshot> {
  const row = await prisma.screenshot.create({
    data: {
      userId: data.user_id,
      debtId: data.debt_id,
      storagePath: data.storage_path,
      status: data.status,
    },
  });

  return toScreenshot(row);
}

/**
 * ユーザーのスクリーンショット一覧を取得する
 * created_at の降順でソートして返す
 */
export async function getScreenshots(
  userId: string
): Promise<Screenshot[]> {
  const rows = await prisma.screenshot.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toScreenshot);
}

/**
 * スクリーンショットのステータスを更新する
 */
export async function updateScreenshotStatus(
  id: string,
  status: string
): Promise<Screenshot> {
  const row = await prisma.screenshot.update({
    where: { id },
    data: {
      status,
      ...(status === "completed" && { processedAt: new Date() }),
    },
  });

  return toScreenshot(row);
}
