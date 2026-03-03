"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { deleteTransactionAction } from "@/app/actions/transactions";
import type { Transaction, TransactionCategory } from "@/types/database";

// --- 定数 ---

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  food: "食費",
  subscription: "サブスク",
  entertainment: "交際費",
  transport: "交通費",
  utility: "光熱費",
  other: "その他",
};

const CATEGORY_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "food", label: "食費" },
  { value: "subscription", label: "サブスク" },
  { value: "entertainment", label: "交際費" },
  { value: "transport", label: "交通費" },
  { value: "utility", label: "光熱費" },
  { value: "other", label: "その他" },
];

// --- ヘルパー ---

function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/** 年月の選択肢を生成（直近6ヶ月） */
function generateMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${d.getFullYear()}年${d.getMonth() + 1}月`;
    options.push({ value, label });
  }
  return options;
}

// --- Props ---

type TransactionsPageClientProps = {
  transactions: Transaction[];
  yearMonth: string;
};

// --- Component ---

export function TransactionsPageClient({
  transactions,
  yearMonth,
}: TransactionsPageClientProps) {
  const router = useRouter();
  const monthOptions = generateMonthOptions();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [isPending, startTransition] = useTransition();

  // カテゴリフィルタリング（クライアントサイド）
  const filteredTransactions = transactions.filter((t) => {
    if (selectedCategory === "all") return true;
    return t.category === selectedCategory;
  });

  function handleMonthChange(value: string | null) {
    const newMonth = value ?? monthOptions[0].value;
    router.push(`/transactions?yearMonth=${newMonth}`);
  }

  function handleDelete() {
    if (!deleteTargetId) return;
    startTransition(async () => {
      const result = await deleteTransactionAction(deleteTargetId);
      if (result.error) {
        // TODO: エラー通知UIを実装する
        throw new Error(result.error);
      }
      setDeleteTargetId(null);
      close();
      router.refresh();
    });
  }

  function openDeleteModal(id: string) {
    setDeleteTargetId(id);
    open();
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={3}>支出一覧</Title>
        {/* TODO: 手入力画面への遷移を実装する */}
        <Button size="compact-md" onClick={() => router.push("/upload")}>
          + 手入力
        </Button>
      </Group>

      {/* 月選択・カテゴリフィルター */}
      <Group gap="sm">
        <Select
          value={yearMonth}
          onChange={handleMonthChange}
          data={monthOptions}
          size="sm"
          className="flex-1"
          allowDeselect={false}
        />
        <Select
          value={selectedCategory}
          onChange={(val) => setSelectedCategory(val ?? "all")}
          data={CATEGORY_OPTIONS}
          size="sm"
          className="flex-1"
          allowDeselect={false}
        />
      </Group>

      {/* 支出リスト */}
      {filteredTransactions.length === 0 ? (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text c="dimmed" ta="center">
            支出データがありません
          </Text>
        </Card>
      ) : (
        <Stack gap="xs">
          {filteredTransactions.map((transaction) => (
            <Card
              key={transaction.id}
              shadow="sm"
              padding="sm"
              radius="md"
              withBorder
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2} className="flex-1 min-w-0">
                  <Group gap="xs" wrap="nowrap">
                    <Text size="xs" c="dimmed" className="shrink-0">
                      {formatDate(transaction.transaction_date)}
                    </Text>
                    <Text size="sm" fw={500} truncate="end">
                      {transaction.description ?? "（説明なし）"}
                    </Text>
                  </Group>
                  <Group gap="xs">
                    {transaction.category && (
                      <Badge variant="light" size="xs">
                        {CATEGORY_LABELS[transaction.category]}
                      </Badge>
                    )}
                    {transaction.is_essential !== null && (
                      <Badge
                        variant="light"
                        size="xs"
                        color={transaction.is_essential ? "teal" : "red"}
                      >
                        {transaction.is_essential ? "必要" : "不要"}
                      </Badge>
                    )}
                  </Group>
                </Stack>
                <Stack gap={2} align="flex-end" className="shrink-0">
                  <Text fw={700} size="sm">
                    {formatYen(transaction.amount)}
                  </Text>
                  <Group gap={4}>
                    {/* TODO: 編集画面への遷移を実装する */}
                    <Button variant="subtle" size="compact-xs" c="dimmed">
                      編集
                    </Button>
                    <Button
                      variant="subtle"
                      size="compact-xs"
                      c="red"
                      onClick={() => openDeleteModal(transaction.id)}
                    >
                      削除
                    </Button>
                  </Group>
                </Stack>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      {/* 削除確認モーダル */}
      <Modal opened={opened} onClose={close} title="支出を削除" centered>
        <Stack gap="md">
          <Text size="sm">この支出を削除してもよろしいですか？</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={close}>
              キャンセル
            </Button>
            <Button color="red" onClick={handleDelete} loading={isPending}>
              削除する
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
