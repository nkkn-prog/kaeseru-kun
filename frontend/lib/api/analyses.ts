import { prisma } from "@/lib/prisma/client";
import type { MonthlyAnalysis, Recommendation } from "@/types/database";
import type { Prisma } from "@prisma/client";

/**
 * Prisma の MonthlyAnalysis モデルを types/database.ts の MonthlyAnalysis 型に変換する
 */
function toMonthlyAnalysis(
  row: Prisma.MonthlyAnalysisGetPayload<object>
): MonthlyAnalysis {
  return {
    id: row.id,
    user_id: row.userId,
    year_month: row.yearMonth,
    total_income: row.totalIncome,
    total_expenses: row.totalExpenses,
    total_debt: row.totalDebt,
    debt_ratio: row.debtRatio ? Number(row.debtRatio) : null,
    unnecessary_total: row.unnecessaryTotal,
    potential_savings: row.potentialSavings,
    recommendations: row.recommendations as Recommendation[] | null,
    created_at: row.createdAt.toISOString(),
  };
}

/**
 * 指定月の分析結果を取得する
 * user_id と year_month で一意に取得
 * 未生成の場合は null を返す
 */
export async function getAnalysis(
  userId: string,
  yearMonth: string
): Promise<MonthlyAnalysis | null> {
  const row = await prisma.monthlyAnalysis.findUnique({
    where: {
      userId_yearMonth: {
        userId,
        yearMonth,
      },
    },
  });

  if (!row) {
    return null;
  }

  return toMonthlyAnalysis(row);
}

/**
 * 指定月の AI 分析を生成（または再生成）する
 *
 * TODO: FastAPI バックエンドの POST /analyses/{year_month}/generate を呼び出す
 * 現時点ではダミーデータを返す
 */
export async function generateAnalysis(
  userId: string,
  yearMonth: string
): Promise<MonthlyAnalysis> {
  // TODO: FastAPI バックエンドから分析結果を取得する
  // const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  // const response = await fetch(`${backendUrl}/analyses/${yearMonth}/generate`, { ... });

  // ダミーの分析データ
  const dummyRecommendations: Recommendation[] = [
    {
      category: "subscription",
      description:
        "使用頻度の低いサブスクリプションを見直すことで節約できる可能性があります",
      saving_amount: 3000,
      priority: "high",
    },
    {
      category: "food",
      description: "外食費を週1回減らすと月額の食費を抑えられます",
      saving_amount: 5000,
      priority: "medium",
    },
  ];

  // upsert で既存データがあれば更新、なければ作成
  const row = await prisma.monthlyAnalysis.upsert({
    where: {
      userId_yearMonth: {
        userId,
        yearMonth,
      },
    },
    update: {
      totalIncome: 250000,
      totalExpenses: 180000,
      totalDebt: 500000,
      debtRatio: 72.0,
      unnecessaryTotal: 25000,
      potentialSavings: 8000,
      recommendations: dummyRecommendations as unknown as Prisma.JsonArray,
    },
    create: {
      userId,
      yearMonth,
      totalIncome: 250000,
      totalExpenses: 180000,
      totalDebt: 500000,
      debtRatio: 72.0,
      unnecessaryTotal: 25000,
      potentialSavings: 8000,
      recommendations: dummyRecommendations as unknown as Prisma.JsonArray,
    },
  });

  return toMonthlyAnalysis(row);
}
