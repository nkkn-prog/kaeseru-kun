import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

/**
 * Supabase Auth からログイン中のユーザーを取得する
 *
 * 未ログインの場合は null を返す。
 * Server Component / Server Action から呼ぶこと。
 */
export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * ログイン済みユーザーを取得し、未ログインなら /login にリダイレクトする
 *
 * Server Component / Server Action でユーザーを必須とする場面で使う。
 * 戻り値の user は必ず存在する（null の場合はリダイレクトされる）。
 */
export async function requireAuth() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * ユーザー登録時に profiles テーブルにレコードを作成する
 *
 * Supabase Auth で signup 後に呼び出す。
 * profiles.id は auth.users.id と同一にする。
 */
export async function createProfile(userId: string, name?: string) {
  const profile = await prisma.profile.create({
    data: {
      id: userId,
      name: name ?? null,
    },
  });

  return profile;
}
