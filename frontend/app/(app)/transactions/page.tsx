import { requireAuth } from "@/lib/auth";
import { getTransactions } from "@/lib/api/transactions";
import { TransactionsPageClient } from "./TransactionsPageClient";

type Props = {
  searchParams: Promise<{ yearMonth?: string }>;
};

export default async function TransactionsPage({ searchParams }: Props) {
  const user = await requireAuth();
  const params = await searchParams;

  // デフォルトは当月
  const now = new Date();
  const defaultYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const yearMonth = params.yearMonth ?? defaultYearMonth;

  const transactions = await getTransactions(user.id, yearMonth);

  return (
    <TransactionsPageClient
      transactions={transactions}
      yearMonth={yearMonth}
    />
  );
}
