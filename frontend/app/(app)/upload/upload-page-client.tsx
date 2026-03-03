"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Group,
  Paper,
  Progress,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { uploadScreenshotAction } from "@/app/actions/uploads";
import type { Debt } from "@/types/database";

// --- 定数 ---

type FileType = "screenshot" | "csv";

// --- 型 ---

type UploadedFile = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "failed";
  detectedCount: number | null;
};

// --- Props ---

type UploadPageClientProps = {
  debts: Debt[];
};

// --- Component ---

export function UploadPageClient({ debts }: UploadPageClientProps) {
  const router = useRouter();
  const [fileType, setFileType] = useState<FileType>("screenshot");
  const [selectedDebtId, setSelectedDebtId] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (selectedDebtId) {
        formData.append("debt_id", selectedDebtId);
      }

      const result = await uploadScreenshotAction(formData);

      const uploaded: UploadedFile = {
        id: result.id,
        name: file.name,
        progress: 100,
        status: "completed",
        detectedCount: null,
      };

      setUploadedFiles((prev) => [...prev, uploaded]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "アップロードに失敗しました";

      const failed: UploadedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        progress: 100,
        status: "failed",
        detectedCount: null,
      };

      setUploadedFiles((prev) => [...prev, failed]);
      alert(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleDropZoneClick() {
    if (uploading) return;
    fileInputRef.current?.click();
  }

  const acceptType =
    fileType === "screenshot" ? "image/jpeg,image/png" : ".csv";

  const debtSelectData = [
    { value: "", label: "収入スクショ（給与明細など）" },
    ...debts.map((debt) => ({
      value: debt.id,
      label: debt.name + (debt.lender ? ` (${debt.lender})` : ""),
    })),
  ];

  return (
    <Stack gap="md">
      <Title order={3}>データを取り込む</Title>

      {/* タブ切替: スクショ / CSV */}
      <SegmentedControl
        value={fileType}
        onChange={(val) => setFileType(val as FileType)}
        data={[
          { value: "screenshot", label: "スクショ" },
          { value: "csv", label: "CSV" },
        ]}
        fullWidth
      />

      {/* 借入先の選択 */}
      {debts.length === 0 ? (
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Stack gap="sm" align="center">
            <Text size="sm" c="dimmed" ta="center">
              借入が登録されていません。先に借入を登録してください
            </Text>
            <Button
              variant="light"
              size="compact-md"
              onClick={() => router.push("/debts/new")}
            >
              借入を登録する
            </Button>
          </Stack>
        </Card>
      ) : (
        <Select
          label="借入先を選択"
          placeholder="選択してください"
          data={debtSelectData}
          value={selectedDebtId}
          onChange={(val) => setSelectedDebtId(val ?? "")}
          allowDeselect={false}
        />
      )}

      {/* ファイルアップロードエリア */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptType}
        onChange={handleFileSelect}
        className="hidden"
      />

      <UnstyledButton
        onClick={handleDropZoneClick}
        className="w-full"
        disabled={uploading}
      >
        <Paper
          shadow="sm"
          p="xl"
          radius="md"
          withBorder
          className="border-dashed border-2 text-center"
        >
          <Stack gap="xs" align="center">
            {uploading ? (
              <>
                <Text size="xl">⏳</Text>
                <Text size="sm" c="dimmed">
                  アップロード中...
                </Text>
              </>
            ) : (
              <>
                <Text size="xl">
                  {fileType === "screenshot" ? "📷" : "📂"}
                </Text>
                <Text size="sm" c="dimmed">
                  タップして
                  {fileType === "screenshot" ? "画像" : "CSV"}を選択
                </Text>
                <Text size="xs" c="dimmed">
                  対応形式:{" "}
                  {fileType === "screenshot" ? "JPG / PNG" : "CSV"}
                </Text>
              </>
            )}
          </Stack>
        </Paper>
      </UnstyledButton>

      {/* アップロード済みファイルの処理状況 */}
      {uploadedFiles.length > 0 && (
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            処理状況
          </Text>
          {uploadedFiles.map((file) => (
            <Card key={file.id} shadow="sm" padding="md" radius="md" withBorder>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    {file.name}
                  </Text>
                  <Text size="sm" c={file.status === "completed" ? "teal" : "dimmed"}>
                    {file.status === "uploading" && "アップロード中..."}
                    {file.status === "processing" && "解析中..."}
                    {file.status === "completed" && "完了"}
                    {file.status === "failed" && "失敗"}
                  </Text>
                </Group>

                <Progress
                  value={file.progress}
                  color={
                    file.status === "completed"
                      ? "teal"
                      : file.status === "failed"
                        ? "red"
                        : "blue"
                  }
                  size="sm"
                />

                {file.status === "completed" && file.detectedCount !== null && (
                  <Group justify="space-between" align="center">
                    <Text size="sm" c="dimmed">
                      {file.detectedCount}件の支出を検出
                    </Text>
                    {/* TODO: 確認・修正画面への遷移を実装する */}
                    <Button variant="light" size="compact-sm">
                      確認・修正する
                    </Button>
                  </Group>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
