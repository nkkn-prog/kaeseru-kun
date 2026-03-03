import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

/**
 * ブラウザ用 Supabase クライアントを取得する（シングルトン）
 *
 * 環境変数 NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY が
 * 設定されていない場合はエラーをスローする。
 */
export function createSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

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

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  return supabaseClient;
}
