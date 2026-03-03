import { requireAuth } from "@/lib/auth";
import { getIncomes } from "@/lib/api/incomes";
import { IncomesPageClient } from "./IncomesPageClient";

type Props = {
  searchParams: Promise<{ yearMonth?: string }>;
};

export default async function IncomesPage({ searchParams }: Props) {
  const user = await requireAuth();
  const params = await searchParams;

  // デフォルトは当月
  const now = new Date();
  const defaultYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const yearMonth = params.yearMonth ?? defaultYearMonth;

  const incomes = await getIncomes(user.id, yearMonth);

  return <IncomesPageClient incomes={incomes} yearMonth={yearMonth} />;
}
