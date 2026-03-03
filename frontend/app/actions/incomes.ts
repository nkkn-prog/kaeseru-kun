"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import {
  createIncome,
  updateIncome,
  deleteIncome,
} from "@/lib/api/incomes";
import type {
  IncomeInsert,
  IncomeUpdate,
  IncomeType,
} from "@/types/database";

/**
 * 収入を新規登録する Server Action
 */
export async function createIncomeAction(
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireAuth();

  const amount = Number(formData.get("amount"));
  const incomeType = (formData.get("income_type") as IncomeType) || "other";
  const incomeDate = formData.get("income_date") as string;
  const description = (formData.get("description") as string) || null;
  const screenshotId =
    (formData.get("screenshot_id") as string) || null;

  if (!amount || !incomeDate) {
    return { error: "金額と日付は必須です" };
  }

  const data: IncomeInsert = {
    user_id: user.id,
    screenshot_id: screenshotId,
    amount,
    income_type: incomeType,
    income_date: incomeDate,
    description,
  };

  try {
    await createIncome(data);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "収入の登録に失敗しました";
    return { error: message };
  }

  revalidatePath("/incomes");
  return {};
}

/**
 * 収入を更新する Server Action
 */
export async function updateIncomeAction(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireAuth();

  const data: IncomeUpdate = {};

  const amount = formData.get("amount");
  if (amount !== null) data.amount = Number(amount);

  const incomeType = formData.get("income_type");
  if (incomeType !== null) data.income_type = incomeType as IncomeType;

  const incomeDate = formData.get("income_date");
  if (incomeDate !== null) data.income_date = incomeDate as string;

  const description = formData.get("description");
  if (description !== null) data.description = description as string;

  const screenshotId = formData.get("screenshot_id");
  if (screenshotId !== null)
    data.screenshot_id = (screenshotId as string) || null;

  try {
    await updateIncome(user.id, id, data);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "収入の更新に失敗しました";
    return { error: message };
  }

  revalidatePath("/incomes");
  return {};
}

/**
 * 収入を削除する Server Action
 */
export async function deleteIncomeAction(
  id: string
): Promise<{ error?: string }> {
  const user = await requireAuth();

  try {
    await deleteIncome(user.id, id);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "収入の削除に失敗しました";
    return { error: message };
  }

  revalidatePath("/incomes");
  return {};
}
