import { prisma } from "@/lib/prisma/client";
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
} from "@/types/database";
import type { Prisma } from "@prisma/client";

/**
 * Prisma の Transaction モデルを types/database.ts の Transaction 型に変換する
 */
function toTransaction(
  row: Prisma.TransactionGetPayload<object>
): Transaction {
  return {
    id: row.id,
    user_id: row.userId,
    screenshot_id: row.screenshotId,
    amount: row.amount,
    description: row.description,
    category: row.category as Transaction["category"],
    transaction_date: row.transactionDate.toISOString().split("T")[0],
    is_essential: row.isEssential,
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
 * 支出一覧を取得する
 * yearMonth が指定された場合、その月のデータのみ取得
 * category が指定された場合、そのカテゴリのみフィルタ
 * transaction_date の降順でソート
 */
export async function getTransactions(
  userId: string,
  yearMonth?: string,
  category?: string
): Promise<Transaction[]> {
  const where: Prisma.TransactionWhereInput = { userId };

  // yearMonth フィルタ
  if (yearMonth) {
    const { start, end } = getMonthDateRange(yearMonth);
    where.transactionDate = {
      gte: start,
      lt: end,
    };
  }

  // category フィルタ
  if (category) {
    where.category = category;
  }

  const rows = await prisma.transaction.findMany({
    where,
    orderBy: {
      transactionDate: "desc",
    },
  });

  return rows.map(toTransaction);
}

/**
 * 支出を新規登録する
 */
export async function createTransaction(
  data: TransactionInsert
): Promise<Transaction> {
  const row = await prisma.transaction.create({
    data: {
      userId: data.user_id,
      screenshotId: data.screenshot_id,
      amount: data.amount,
      description: data.description,
      category: data.category,
      transactionDate: new Date(data.transaction_date),
      isEssential: data.is_essential,
    },
  });

  return toTransaction(row);
}

/**
 * 支出を更新する
 * userId で所有権を検証してから更新する
 */
export async function updateTransaction(
  userId: string,
  id: string,
  data: TransactionUpdate
): Promise<Transaction> {
  // 所有権の検証
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("指定された支出が見つかりません");
  }

  const row = await prisma.transaction.update({
    where: { id },
    data: {
      ...(data.screenshot_id !== undefined && {
        screenshotId: data.screenshot_id,
      }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.transaction_date !== undefined && {
        transactionDate: new Date(data.transaction_date),
      }),
      ...(data.is_essential !== undefined && { isEssential: data.is_essential }),
    },
  });

  return toTransaction(row);
}

/**
 * 支出を物理削除する
 * userId で所有権を検証してから削除する
 */
export async function deleteTransaction(
  userId: string,
  id: string
): Promise<void> {
  // 所有権の検証
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("指定された支出が見つかりません");
  }

  await prisma.transaction.delete({
    where: { id },
  });
}
