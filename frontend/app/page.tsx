import { redirect } from "next/navigation";

/**
 * ルートページ
 * TODO: Supabase Auth で認証状態をチェックし、
 * - ログイン済み → /dashboard へリダイレクト
 * - 未ログイン → /login へリダイレクト
 * 現時点では常に /login へリダイレクトする
 */
export default function RootPage() {
  // TODO: 認証チェックを追加する
  // const supabase = createServerClient();
  // const { data: { session } } = await supabase.auth.getSession();
  // if (session) redirect("/dashboard");

  redirect("/login");
}
