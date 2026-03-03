"use client";

import { useRef, useState } from "react";
import {
  Button,
  Card,
  Group,
  Paper,
  Progress,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import type { SourceType } from "@/types/database";

// --- 定数 ---

type FileType = "screenshot" | "csv";

const SOURCE_OPTIONS: { value: SourceType; label: string }[] = [
  { value: "bank", label: "銀行" },
  { value: "credit_card", label: "クレカ" },
  { value: "salary", label: "給与明細" },
  { value: "other", label: "その他" },
];

// --- モックの処理結果 ---

type UploadedFile = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "failed";
  detectedCount: number | null;
};

// --- Component ---

export default function UploadPage() {
  const [fileType, setFileType] = useState<FileType>("screenshot");
  const [sourceType, setSourceType] = useState<SourceType>("bank");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // TODO: Supabase Storage にファイルをアップロードし、backend の解析 API を呼び出す
    // 1. supabase.storage.from("screenshots").upload(path, file)
    // 2. POST /api/upload に storage_path, source_type, file_type を送信
    // 3. ポーリングまたは WebSocket で処理状況を取得

    // モックの処理結果を追加
    const mockFile: UploadedFile = {
      id: crypto.randomUUID(),
      name: file.name,
      progress: 100,
      status: "completed",
      detectedCount: 12,
    };

    setUploadedFiles((prev) => [...prev, mockFile]);

    // input をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleDropZoneClick() {
    fileInputRef.current?.click();
  }

  const acceptType =
    fileType === "screenshot" ? "image/jpeg,image/png" : ".csv";

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

      {/* ソース種別の選択 */}
      <Stack gap="xs">
        <Text size="sm" fw={500}>
          種別を選んでください
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          {SOURCE_OPTIONS.map((option) => (
            <UnstyledButton
              key={option.value}
              onClick={() => setSourceType(option.value)}
            >
              <Paper
                shadow="sm"
                p="md"
                radius="md"
                withBorder
                className={`text-center transition-colors ${
                  sourceType === option.value
                    ? "border-blue-500 bg-blue-50"
                    : ""
                }`}
              >
                <Text size="sm" fw={sourceType === option.value ? 700 : 400}>
                  {option.label}
                </Text>
              </Paper>
            </UnstyledButton>
          ))}
        </SimpleGrid>
      </Stack>

      {/* ファイルアップロードエリア */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptType}
        onChange={handleFileSelect}
        className="hidden"
      />

      <UnstyledButton onClick={handleDropZoneClick} className="w-full">
        <Paper
          shadow="sm"
          p="xl"
          radius="md"
          withBorder
          className="border-dashed border-2 text-center"
        >
          <Stack gap="xs" align="center">
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
