"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/api/transactions";
import type {
  TransactionInsert,
  TransactionUpdate,
  TransactionCategory,
} from "@/types/database";

/**
 * 支出を新規登録する Server Action
 */
export async function createTransactionAction(
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireAuth();

  const amount = Number(formData.get("amount"));
  const description = (formData.get("description") as string) || null;
  const category =
    (formData.get("category") as TransactionCategory) || null;
  const transactionDate = formData.get("transaction_date") as string;
  const isEssential = formData.get("is_essential") === "true";
  const screenshotId =
    (formData.get("screenshot_id") as string) || null;

  if (!amount || !transactionDate) {
    return { error: "金額と日付は必須です" };
  }

  const data: TransactionInsert = {
    user_id: user.id,
    screenshot_id: screenshotId,
    amount,
    description,
    category,
    transaction_date: transactionDate,
    is_essential: isEssential,
  };

  try {
    await createTransaction(data);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "支出の登録に失敗しました";
    return { error: message };
  }

  revalidatePath("/transactions");
  return {};
}

/**
 * 支出を更新する Server Action
 */
export async function updateTransactionAction(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireAuth();

  const data: TransactionUpdate = {};

  const amount = formData.get("amount");
  if (amount !== null) data.amount = Number(amount);

  const description = formData.get("description");
  if (description !== null) data.description = description as string;

  const category = formData.get("category");
  if (category !== null)
    data.category = category as TransactionCategory;

  const transactionDate = formData.get("transaction_date");
  if (transactionDate !== null)
    data.transaction_date = transactionDate as string;

  const isEssential = formData.get("is_essential");
  if (isEssential !== null)
    data.is_essential = isEssential === "true";

  const screenshotId = formData.get("screenshot_id");
  if (screenshotId !== null)
    data.screenshot_id = (screenshotId as string) || null;

  try {
    await updateTransaction(user.id, id, data);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "支出の更新に失敗しました";
    return { error: message };
  }

  revalidatePath("/transactions");
  return {};
}

/**
 * 支出を削除する Server Action
 */
export async function deleteTransactionAction(
  id: string
): Promise<{ error?: string }> {
  const user = await requireAuth();

  try {
    await deleteTransaction(user.id, id);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "支出の削除に失敗しました";
    return { error: message };
  }

  revalidatePath("/transactions");
  return {};
}
