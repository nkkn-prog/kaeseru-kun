import { requireAuth } from "@/lib/auth";
import { getDebts } from "@/lib/api/debts";
import { UploadPageClient } from "./upload-page-client";

export default async function UploadPage() {
  const user = await requireAuth();
  const debts = await getDebts(user.id);

  return <UploadPageClient debts={debts} />;
}
