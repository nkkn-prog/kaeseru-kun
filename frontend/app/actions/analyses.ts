"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { generateAnalysis } from "@/lib/api/analyses";

/**
 * 指定月の AI 分析を生成する Server Action
 */
export async function generateAnalysisAction(yearMonth: string) {
  const user = await requireAuth();

  const analysis = await generateAnalysis(user.id, yearMonth);

  revalidatePath(`/analysis/${yearMonth}`);

  return analysis;
}
