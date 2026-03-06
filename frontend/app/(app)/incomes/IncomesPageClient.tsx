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
import { notifications } from "@mantine/notifications";
import { IncomeFormModal } from "./IncomeFormModal";
import type { Income, IncomeType } from "@/types/database";

// --- 定数 ---

const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  salary: "給与",
  side_job: "副業",
  other: "その他",
};

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

type IncomesPageClientProps = {
  incomes: Income[];
  yearMonth: string;
};

// --- Component ---

export function IncomesPageClient({
  incomes,
  yearMonth,
}: IncomesPageClientProps) {
  const router = useRouter();
  const monthOptions = generateMonthOptions();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);
  const [editTarget, setEditTarget] = useState<Income | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  function handleMonthChange(value: string | null) {
    const newMonth = value ?? monthOptions[0].value;
    router.push(`/incomes?yearMonth=${newMonth}`);
  }

  function handleDelete() {
    if (!deleteTargetId) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/incomes/${deleteTargetId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const result = await res.json();
          notifications.show({
            title: "削除エラー",
            message: result.error ?? "削除に失敗しました",
            color: "red",
          });
          return;
        }
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "削除に失敗しました";
        notifications.show({
          title: "削除エラー",
          message,
          color: "red",
        });
        return;
      }
      setDeleteTargetId(null);
      closeDelete();
      router.refresh();
    });
  }

  function openDeleteModal(id: string) {
    setDeleteTargetId(id);
    openDelete();
  }

  function handleOpenNew() {
    setEditTarget(undefined);
    openForm();
  }

  function handleOpenEdit(income: Income) {
    setEditTarget(income);
    openForm();
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={3}>収入一覧</Title>
        <Button size="compact-md" onClick={handleOpenNew}>
          + 手入力
        </Button>
      </Group>

      {/* 月選択 */}
      <Select
        value={yearMonth}
        onChange={handleMonthChange}
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
                    <Button
                      variant="subtle"
                      size="compact-xs"
                      c="dimmed"
                      onClick={() => handleOpenEdit(income)}
                    >
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

      {/* 収入登録・編集モーダル */}
      <IncomeFormModal
        opened={formOpened}
        onClose={closeForm}
        income={editTarget}
      />

      {/* 削除確認モーダル */}
      <Modal opened={deleteOpened} onClose={closeDelete} title="収入を削除" centered>
        <Stack gap="md">
          <Text size="sm">この収入を削除してもよろしいですか？</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={closeDelete}>
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
