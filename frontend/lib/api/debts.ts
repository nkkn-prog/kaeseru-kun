import { prisma } from "@/lib/prisma/client";
import type { Debt, DebtInsert, DebtUpdate } from "@/types/database";
import type { Prisma } from "@prisma/client";

/**
 * Prisma の Debt モデルを types/database.ts の Debt 型に変換する
 */
function toDebt(row: Prisma.DebtGetPayload<object>): Debt {
  return {
    id: row.id,
    user_id: row.userId,
    name: row.name,
    lender: row.lender,
    current_balance: row.currentBalance,
    interest_rate: row.interestRate ? Number(row.interestRate) : null,
    monthly_payment: row.monthlyPayment,
    due_day: row.dueDay,
    debt_type: row.debtType as Debt["debt_type"],
    is_active: row.isActive,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

/**
 * アクティブな借金一覧を取得する
 * created_at の降順でソートして返す
 */
export async function getDebts(userId: string): Promise<Debt[]> {
  const rows = await prisma.debt.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return rows.map(toDebt);
}

/**
 * 借金を1件取得する
 * 該当データがない場合は null を返す
 */
export async function getDebtById(
  userId: string,
  id: string
): Promise<Debt | null> {
  const row = await prisma.debt.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!row) {
    return null;
  }

  return toDebt(row);
}

/**
 * 借金を新規登録する
 */
export async function createDebt(data: DebtInsert): Promise<Debt> {
  const row = await prisma.debt.create({
    data: {
      userId: data.user_id,
      name: data.name,
      lender: data.lender,
      currentBalance: data.current_balance,
      interestRate: data.interest_rate,
      monthlyPayment: data.monthly_payment,
      dueDay: data.due_day,
      debtType: data.debt_type,
      isActive: data.is_active,
    },
  });

  return toDebt(row);
}

/**
 * 借金を更新する
 * userId で所有権を検証してから更新する
 */
export async function updateDebt(
  userId: string,
  id: string,
  data: DebtUpdate
): Promise<Debt> {
  // 所有権の検証
  const existing = await prisma.debt.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("指定された借金が見つかりません");
  }

  const row = await prisma.debt.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.lender !== undefined && { lender: data.lender }),
      ...(data.current_balance !== undefined && {
        currentBalance: data.current_balance,
      }),
      ...(data.interest_rate !== undefined && {
        interestRate: data.interest_rate,
      }),
      ...(data.monthly_payment !== undefined && {
        monthlyPayment: data.monthly_payment,
      }),
      ...(data.due_day !== undefined && { dueDay: data.due_day }),
      ...(data.debt_type !== undefined && { debtType: data.debt_type }),
      ...(data.is_active !== undefined && { isActive: data.is_active }),
      updatedAt: new Date(),
    },
  });

  return toDebt(row);
}

/**
 * 借金を論理削除する（is_active を false に設定）
 * userId で所有権を検証してから削除する
 */
export async function deleteDebt(userId: string, id: string): Promise<void> {
  // 所有権の検証
  const existing = await prisma.debt.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("指定された借金が見つかりません");
  }

  await prisma.debt.update({
    where: { id },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });
}

/**
 * アクティブな借金の残高合計を取得する
 * 借金が0件の場合は 0 を返す
 */
export async function getTotalDebtBalance(userId: string): Promise<number> {
  const result = await prisma.debt.aggregate({
    where: {
      userId,
      isActive: true,
    },
    _sum: {
      currentBalance: true,
    },
  });

  return result._sum.currentBalance ?? 0;
}
