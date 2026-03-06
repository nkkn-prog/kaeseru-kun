import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { updateIncome, deleteIncome } from "@/lib/api/incomes";
import type { IncomeUpdate, IncomeType } from "@/types/database";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * PUT /api/incomes/:id
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const user = await requireAuth();
  const { id } = await context.params;

  const body = await request.json();
  const data: IncomeUpdate = {};

  if (body.amount !== undefined) data.amount = Number(body.amount);
  if (body.income_type !== undefined)
    data.income_type = body.income_type as IncomeType;
  if (body.income_date !== undefined) data.income_date = body.income_date;
  if (body.description !== undefined) data.description = body.description;

  try {
    const income = await updateIncome(user.id, id, data);
    return NextResponse.json(income);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "収入の更新に失敗しました";
    const status = message.includes("見つかりません") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * DELETE /api/incomes/:id
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const user = await requireAuth();
  const { id } = await context.params;

  try {
    await deleteIncome(user.id, id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "収入の削除に失敗しました";
    const status = message.includes("見つかりません") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
