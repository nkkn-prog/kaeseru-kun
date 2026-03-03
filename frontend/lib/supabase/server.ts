import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Component / Server Action 用の Supabase クライアントを生成する
 *
 * リクエストごとに Cookie を読み書きして認証セッションを維持する。
 * この関数は必ず Server Component / Server Action / Route Handler 内で呼ぶこと。
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "環境変数 NEXT_PUBLIC_SUPABASE_URL が設定されていません。.env.local に設定してください。"
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "環境変数 NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません。.env.local に設定してください。"
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component から呼ばれた場合は Cookie の書き込みが不可。
          // 読み取り専用の操作（getUser 等）では問題ないため無視する。
        }
      },
    },
  });
}
