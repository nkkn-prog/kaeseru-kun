import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createIncome, getIncomes } from "@/lib/api/incomes";
import type { IncomeInsert, IncomeType } from "@/types/database";

/**
 * GET /api/incomes?yearMonth=2026-03
 */
export async function GET(request: NextRequest) {
  const user = await requireAuth();
  const yearMonth =
    request.nextUrl.searchParams.get("yearMonth") ?? undefined;

  try {
    const incomes = await getIncomes(user.id, yearMonth);
    return NextResponse.json(incomes);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "収入の取得に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/incomes
 */
export async function POST(request: NextRequest) {
  const user = await requireAuth();

  const body = await request.json();
  const { amount, income_type, income_date, description } = body;

  if (!amount || !income_date) {
    return NextResponse.json(
      { error: "金額と日付は必須です" },
      { status: 400 }
    );
  }

  const data: IncomeInsert = {
    user_id: user.id,
    screenshot_id: null,
    amount: Number(amount),
    income_type: (income_type as IncomeType) || "other",
    income_date,
    description: description || null,
  };

  try {
    const income = await createIncome(data);
    return NextResponse.json(income, { status: 201 });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "収入の登録に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
