"use client";

import { useState } from "react";
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
import type { Income, IncomeType } from "@/types/database";

// --- 定数 ---

const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  salary: "給与",
  side_job: "副業",
  other: "その他",
};

// --- モックデータ ---
// TODO: lib/api/incomes.ts の getIncomes() を呼び出す

const mockIncomes: Income[] = [
  {
    id: "1",
    user_id: "user-1",
    screenshot_id: null,
    amount: 250000,
    income_type: "salary",
    income_date: "2026-03-25",
    description: "3月分給与",
    created_at: "2026-03-25T00:00:00Z",
  },
  {
    id: "2",
    user_id: "user-1",
    screenshot_id: null,
    amount: 30000,
    income_type: "side_job",
    income_date: "2026-03-15",
    description: "副業収入（ライティング）",
    created_at: "2026-03-15T00:00:00Z",
  },
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

// --- Component ---

export default function IncomesPage() {
  const router = useRouter();
  const monthOptions = generateMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [incomes, setIncomes] = useState<Income[]>(mockIncomes);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  function handleDelete() {
    if (!deleteTargetId) return;
    // TODO: lib/api/incomes.ts の deleteIncome() を呼び出す
    setIncomes((prev) => prev.filter((i) => i.id !== deleteTargetId));
    setDeleteTargetId(null);
    close();
  }

  function openDeleteModal(id: string) {
    setDeleteTargetId(id);
    open();
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={3}>収入一覧</Title>
        {/* TODO: 手入力画面への遷移を実装する */}
        <Button size="compact-md" onClick={() => router.push("/upload")}>
          + 手入力
        </Button>
      </Group>

      {/* 月選択 */}
      <Select
        value={selectedMonth}
        onChange={(val) => setSelectedMonth(val ?? monthOptions[0].value)}
        data={monthOptions}
        size="sm"
        allowDeselect={false}
      />

      {/* 合計表示 */}
      <Text fw={600} size="lg">
        合計: {formatYen(totalIncome)}
      </Text>

      {/* 収入リスト */}
      {incomes.length === 0 ? (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text c="dimmed" ta="center">
            収入データがありません
          </Text>
        </Card>
      ) : (
        <Stack gap="xs">
          {incomes.map((income) => (
            <Card
              key={income.id}
              shadow="sm"
              padding="sm"
              radius="md"
              withBorder
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2} className="flex-1 min-w-0">
                  <Group gap="xs" wrap="nowrap">
                    <Text size="xs" c="dimmed" className="shrink-0">
                      {formatDate(income.income_date)}
                    </Text>
                    <Text size="sm" fw={500} truncate="end">
                      {income.description ?? "（説明なし）"}
                    </Text>
                  </Group>
                  <Badge variant="light" size="xs">
                    {INCOME_TYPE_LABELS[income.income_type]}
                  </Badge>
                </Stack>
                <Stack gap={2} align="flex-end" className="shrink-0">
                  <Text fw={700} size="sm" c="teal">
                    {formatYen(income.amount)}
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
                      onClick={() => openDeleteModal(income.id)}
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
      <Modal opened={opened} onClose={close} title="収入を削除" centered>
        <Stack gap="md">
          <Text size="sm">この収入を削除してもよろしいですか？</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={close}>
              キャンセル
            </Button>
            <Button color="red" onClick={handleDelete}>
              削除する
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
