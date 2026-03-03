import { prisma } from "@/lib/prisma/client";
import type { Income, IncomeInsert, IncomeUpdate } from "@/types/database";
import type { Prisma } from "@prisma/client";

/**
 * Prisma の Income モデルを types/database.ts の Income 型に変換する
 */
function toIncome(row: Prisma.IncomeGetPayload<object>): Income {
  return {
    id: row.id,
    user_id: row.userId,
    screenshot_id: row.screenshotId,
    amount: row.amount,
    income_type: row.incomeType as Income["income_type"],
    income_date: row.incomeDate.toISOString().split("T")[0],
    description: row.description,
    created_at: row.createdAt.toISOString(),
  };
}

/**
 * yearMonth 文字列（例: "2026-03"）から月の開始日と終了日を計算する
 */
function getMonthDateRange(yearMonth: string): { start: Date; end: Date } {
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const start = new Date(year, month - 1, 1);
  // 翌月の1日を設定（月末の翌日）
  const end = new Date(year, month, 1);

  return { start, end };
}

/**
 * 収入一覧を取得する
 * yearMonth が指定された場合、その月のデータのみ取得
 * income_date の降順でソート
 */
export async function getIncomes(
  userId: string,
  yearMonth?: string
): Promise<Income[]> {
  const where: Prisma.IncomeWhereInput = { userId };

  // yearMonth フィルタ
  if (yearMonth) {
    const { start, end } = getMonthDateRange(yearMonth);
    where.incomeDate = {
      gte: start,
      lt: end,
    };
  }

  const rows = await prisma.income.findMany({
    where,
    orderBy: {
      incomeDate: "desc",
    },
  });

  return rows.map(toIncome);
}

/**
 * 収入を新規登録する
 */
export async function createIncome(data: IncomeInsert): Promise<Income> {
  const row = await prisma.income.create({
    data: {
      userId: data.user_id,
      screenshotId: data.screenshot_id,
      amount: data.amount,
      incomeType: data.income_type,
      incomeDate: new Date(data.income_date),
      description: data.description,
    },
  });

  return toIncome(row);
}

/**
 * 収入を更新する
 * userId で所有権を検証してから更新する
 */
export async function updateIncome(
  userId: string,
  id: string,
  data: IncomeUpdate
): Promise<Income> {
  // 所有権の検証
  const existing = await prisma.income.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("指定された収入が見つかりません");
  }

  const row = await prisma.income.update({
    where: { id },
    data: {
      ...(data.screenshot_id !== undefined && {
        screenshotId: data.screenshot_id,
      }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.income_type !== undefined && { incomeType: data.income_type }),
      ...(data.income_date !== undefined && {
        incomeDate: new Date(data.income_date),
      }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });

  return toIncome(row);
}

/**
 * 収入を物理削除する
 * userId で所有権を検証してから削除する
 */
export async function deleteIncome(
  userId: string,
  id: string
): Promise<void> {
  // 所有権の検証
  const existing = await prisma.income.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("指定された収入が見つかりません");
  }

  await prisma.income.delete({
    where: { id },
  });
}
