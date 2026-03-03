"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createProfile } from "@/lib/auth";

/**
 * ログイン処理
 *
 * Supabase Auth の signInWithPassword を使用してログインする。
 * 成功時は error なしのオブジェクトを返す。
 * 失敗時は error メッセージを含むオブジェクトを返す。
 */
export async function loginAction(
  formData: FormData
): Promise<{ error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  return {};
}

/**
 * 新規登録処理
 *
 * Supabase Auth の signUp でユーザーを作成し、
 * profiles テーブルにレコードを作成する。
 */
export async function registerAction(
  formData: FormData
): Promise<{ error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: "アカウント登録に失敗しました。もう一度お試しください" };
  }

  // profiles テーブルにレコードを作成する
  if (data.user) {
    try {
      await createProfile(data.user.id);
    } catch {
      return { error: "プロフィールの作成に失敗しました" };
    }
  }

  return {};
}

/**
 * ログアウト処理
 *
 * Supabase Auth の signOut を呼び出し、/login にリダイレクトする。
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
