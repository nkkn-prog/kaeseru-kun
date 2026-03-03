import { requireAuth } from "@/lib/auth";
import { getAnalysis } from "@/lib/api/analyses";
import { AnalysisPageClient } from "./analysis-page-client";

type AnalysisPageProps = {
  params: Promise<{ year_month: string }>;
};

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { year_month: yearMonth } = await params;
  const user = await requireAuth();
  const analysis = await getAnalysis(user.id, yearMonth);

  return <AnalysisPageClient yearMonth={yearMonth} analysis={analysis} />;
}
