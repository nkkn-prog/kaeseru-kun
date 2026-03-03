import { redirect } from "next/navigation";

/**
 * /analysis にアクセスしたら今月の分析ページにリダイレクトする
 */
export default function AnalysisIndexPage() {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  redirect(`/analysis/${yearMonth}`);
}
