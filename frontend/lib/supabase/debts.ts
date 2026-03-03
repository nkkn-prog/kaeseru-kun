import type { Debt, DebtInsert, DebtUpdate } from "@/types/database";
import { createSupabaseClient } from "./client";

/**
 * 認証済みユーザーの user_id を取得する。
 * 未認証の場合はエラーをスローする。
 */
async function getAuthenticatedUserId(): Promise<string> {
  const supabase = createSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`認証情報の取得に失敗しました: ${error.message}`);
  }

  if (!user) {
    throw new Error(
      "ログインが必要です。ログインしてから再度お試しください。"
    );
  }

  return user.id;
}

/**
 * 借金一覧を取得する（ログインユーザーの is_active=true のみ）
 * created_at の降順でソートして返す。
 */
export async function getDebts(): Promise<Debt[]> {
  const userId = await getAuthenticatedUserId();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`借金一覧の取得に失敗しました: ${error.message}`);
  }

  return data as Debt[];
}

/**
 * 借金を1件取得する。
 * 該当データがない場合は null を返す。
 */
export async function getDebtById(id: string): Promise<Debt | null> {
  const userId = await getAuthenticatedUserId();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`借金の取得に失敗しました: ${error.message}`);
  }

  return data as Debt | null;
}

/**
 * 借金を新規登録する。
 * user_id は認証情報から自動設定される。
 */
export async function createDebt(data: DebtInsert): Promise<Debt> {
  const userId = await getAuthenticatedUserId();
  const supabase = createSupabaseClient();

  const { data: created, error } = await supabase
    .from("debts")
    .insert({ ...data, user_id: userId })
    .select()
    .single();

  if (error) {
    throw new Error(`借金の登録に失敗しました: ${error.message}`);
  }

  return created as Debt;
}

/**
 * 借金を更新する。
 * updated_at は DB トリガーで自動更新される想定。
 */
export async function updateDebt(id: string, data: DebtUpdate): Promise<Debt> {
  const userId = await getAuthenticatedUserId();
  const supabase = createSupabaseClient();

  const { data: updated, error } = await supabase
    .from("debts")
    .update(data)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`借金の更新に失敗しました: ${error.message}`);
  }

  return updated as Debt;
}

/**
 * 借金を削除する（論理削除: is_active を false に設定）。
 */
export async function deleteDebt(id: string): Promise<void> {
  const userId = await getAuthenticatedUserId();
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("debts")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`借金の削除に失敗しました: ${error.message}`);
  }
}

/**
 * アクティブな借金の残高合計を取得する。
 * 借金が0件の場合は 0 を返す。
 */
export async function getTotalDebtBalance(): Promise<number> {
  const userId = await getAuthenticatedUserId();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("debts")
    .select("current_balance")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error) {
    throw new Error(`借金残高合計の取得に失敗しました: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return 0;
  }

  return data.reduce(
    (sum: number, debt: { current_balance: number }) =>
      sum + debt.current_balance,
    0
  );
}
