"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createDebt, updateDebt, deleteDebt } from "@/lib/api/debts";
import type { DebtType, InterestType } from "@/types/database";

/**
 * FormData から借金データを登録する Server Action
 */
export async function createDebtAction(formData: FormData) {
  const user = await requireAuth();

  const name = formData.get("name") as string;
  const lender = formData.get("lender") as string;
  const currentBalance = Number(formData.get("current_balance"));
  const interestRateRaw = formData.get("interest_rate") as string;
  const interestTypeRaw = formData.get("interest_type") as string | null;
  const monthlyPaymentRaw = formData.get("monthly_payment") as string;
  const dueDayRaw = formData.get("due_day") as string;
  const debtType = formData.get("debt_type") as DebtType;

  const debt = await createDebt({
    user_id: user.id,
    name,
    lender: lender || null,
    current_balance: currentBalance,
    interest_rate: interestRateRaw ? Number(interestRateRaw) : null,
    interest_type: (interestTypeRaw as InterestType) || null,
    monthly_payment: monthlyPaymentRaw ? Number(monthlyPaymentRaw) : null,
    due_day: dueDayRaw ? Number(dueDayRaw) : null,
    debt_type: debtType,
    is_active: true,
  });

  revalidatePath("/debts");

  return debt;
}

/**
 * FormData から借金データを更新する Server Action
 */
export async function updateDebtAction(id: string, formData: FormData) {
  const user = await requireAuth();

  const name = formData.get("name") as string;
  const lender = formData.get("lender") as string;
  const currentBalance = Number(formData.get("current_balance"));
  const interestRateRaw = formData.get("interest_rate") as string;
  const interestTypeRaw = formData.get("interest_type") as string | null;
  const monthlyPaymentRaw = formData.get("monthly_payment") as string;
  const dueDayRaw = formData.get("due_day") as string;
  const debtType = formData.get("debt_type") as DebtType;

  const debt = await updateDebt(user.id, id, {
    name,
    lender: lender || null,
    current_balance: currentBalance,
    interest_rate: interestRateRaw ? Number(interestRateRaw) : null,
    interest_type: (interestTypeRaw as InterestType) || null,
    monthly_payment: monthlyPaymentRaw ? Number(monthlyPaymentRaw) : null,
    due_day: dueDayRaw ? Number(dueDayRaw) : null,
    debt_type: debtType,
  });

  revalidatePath("/debts");

  return debt;
}

/**
 * 借金を削除（論理削除）する Server Action
 */
export async function deleteDebtAction(id: string) {
  const user = await requireAuth();

  await deleteDebt(user.id, id);

  revalidatePath("/debts");
}
