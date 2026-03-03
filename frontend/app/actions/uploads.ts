"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createScreenshot } from "@/lib/api/screenshots";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * FormData からスクリーンショットをアップロードし、DB に登録する Server Action
 */
export async function uploadScreenshotAction(formData: FormData) {
  const user = await requireAuth();

  const file = formData.get("file") as File;
  const debtIdRaw = formData.get("debt_id") as string | null;
  const debtId = debtIdRaw || null;

  if (!file || file.size === 0) {
    throw new Error("ファイルが選択されていません");
  }

  // Supabase Storage にアップロード
  const supabase = await createSupabaseServerClient();
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${user.id}/${timestamp}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("screenshots")
    .upload(path, file);

  if (uploadError) {
    throw new Error(`アップロードに失敗しました: ${uploadError.message}`);
  }

  // DB にスクリーンショット情報を登録
  const screenshot = await createScreenshot({
    user_id: user.id,
    debt_id: debtId,
    storage_path: path,
    status: "pending",
  });

  revalidatePath("/upload");

  return screenshot;
}
