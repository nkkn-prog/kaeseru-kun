import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getDebtById } from "@/lib/api/debts";
import { DebtEditFormClient } from "./debt-edit-form-client";

type DebtEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DebtEditPage({ params }: DebtEditPageProps) {
  const { id } = await params;
  const user = await requireAuth();
  const debt = await getDebtById(user.id, id);

  if (!debt) {
    notFound();
  }

  return <DebtEditFormClient debt={debt} />;
}
