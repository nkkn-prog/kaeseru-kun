import { prisma } from "@/lib/prisma/client";

// TODO: テスト完了後に Supabase Auth ベースの認証に戻す
// import { redirect } from "next/navigation";
// import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * テスト用の固定ユーザーID
 * Supabase Auth 導入後に削除する
 */
const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Supabase Auth からログイン中のユーザーを取得する
 *
 * TODO: テスト完了後に Supabase Auth ベースの実装に戻す
 */
export async function getUser() {
  return { id: TEST_USER_ID };
}

/**
 * ログイン済みユーザーを取得する
 *
 * TODO: テスト完了後に Supabase Auth ベースの実装に戻す
 * 本来は未ログインなら /login にリダイレクトする
 */
export async function requireAuth() {
  // テスト用: profiles テーブルにレコードがなければ自動作成する
  await prisma.profile.upsert({
    where: { id: TEST_USER_ID },
    update: {},
    create: { id: TEST_USER_ID, name: "テストユーザー" },
  });

  return { id: TEST_USER_ID };
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
