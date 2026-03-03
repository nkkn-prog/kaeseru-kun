import { requireAuth } from "@/lib/auth";
import { getDebts } from "@/lib/api/debts";
import { DebtsPageClient } from "./debts-page-client";

export default async function DebtsPage() {
  const user = await requireAuth();
  const debts = await getDebts(user.id);

  return <DebtsPageClient debts={debts} />;
}
