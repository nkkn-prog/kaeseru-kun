"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { Debt, DebtType } from "@/types/database";

// --- 定数 ---

const DEBT_TYPE_LABELS: Record<DebtType, string> = {
  card_loan: "カードローン",
  mortgage: "住宅ローン",
  student_loan: "奨学金",
  credit_card: "クレジットカード",
  other: "その他",
};

// --- モックデータ ---
// TODO: lib/api/debts.ts の getDebts() を呼び出す

const mockDebts: Debt[] = [
  {
    id: "1",
    user_id: "user-1",
    name: "カードローンA",
    lender: "アコム",
    current_balance: 500000,
    interest_rate: 15,
    monthly_payment: 30000,
    due_day: 21,
    debt_type: "card_loan",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "2",
    user_id: "user-1",
    name: "奨学金",
    lender: "日本学生支援機構",
    current_balance: 750000,
    interest_rate: 0,
    monthly_payment: 15000,
    due_day: 27,
    debt_type: "student_loan",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

// --- ヘルパー ---

function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

/** 完済までの月数を概算で計算（利息考慮なし簡易版） */
function estimateMonthsToPayoff(balance: number, monthlyPayment: number | null): number | null {
  if (!monthlyPayment || monthlyPayment <= 0) return null;
  return Math.ceil(balance / monthlyPayment);
}

// --- Component ---

export default function DebtsPage() {
  const router = useRouter();
  const [debts, setDebts] = useState<Debt[]>(mockDebts);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const totalBalance = debts.reduce((sum, d) => sum + d.current_balance, 0);

  function handleDelete() {
    if (!deleteTargetId) return;

    // TODO: lib/api/debts.ts の deleteDebt() を呼び出す
    setDebts((prev) => prev.filter((d) => d.id !== deleteTargetId));
    setDeleteTargetId(null);
    close();
  }

  function openDeleteModal(id: string) {
    setDeleteTargetId(id);
    open();
  }

  return (
    <Stack gap="md">
      {/* ヘッダー */}
      <Group justify="space-between" align="center">
        <Title order={3}>借金一覧</Title>
        <Button size="compact-md" onClick={() => router.push("/debts/new")}>
          + 追加
        </Button>
      </Group>

      {/* 残高合計 */}
      <Text fw={600} size="lg">
        残高合計: {formatYen(totalBalance)}
      </Text>

      {/* 借金カード一覧 */}
      {debts.length === 0 ? (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text c="dimmed" ta="center">
            借金が登録されていません
          </Text>
        </Card>
      ) : (
        debts.map((debt) => {
          const months = estimateMonthsToPayoff(
            debt.current_balance,
            debt.monthly_payment
          );
          return (
            <Card key={debt.id} shadow="sm" padding="md" radius="md" withBorder>
              <Stack gap="xs">
                {/* 名称・種別 */}
                <Group justify="space-between" align="flex-start">
                  <Stack gap={2}>
                    <Text fw={700} size="md">
                      {debt.name}
                    </Text>
                    {debt.lender && (
                      <Text size="sm" c="dimmed">
                        {debt.lender}
                      </Text>
                    )}
                  </Stack>
                  <Badge variant="light" size="sm">
                    {DEBT_TYPE_LABELS[debt.debt_type]}
                  </Badge>
                </Group>

                {/* 残高・金利 */}
                <Group gap="lg">
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      残高
                    </Text>
                    <Text fw={600}>{formatYen(debt.current_balance)}</Text>
                  </Stack>
                  {debt.interest_rate !== null && (
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">
                        金利
                      </Text>
                      <Text fw={600}>{debt.interest_rate}%</Text>
                    </Stack>
                  )}
                </Group>

                {/* 月返済額・支払日 */}
                <Group gap="lg">
                  {debt.monthly_payment !== null && (
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">
                        月返済
                      </Text>
                      <Text fw={600}>{formatYen(debt.monthly_payment)}</Text>
                    </Stack>
                  )}
                  {debt.due_day !== null && (
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">
                        支払日
                      </Text>
                      <Text fw={600}>毎月{debt.due_day}日</Text>
                    </Stack>
                  )}
                </Group>

                {/* 完済予測 */}
                {months !== null && (
                  <Text size="sm" c="dimmed">
                    完済まで約 {months}ヶ月
                  </Text>
                )}

                {/* 操作ボタン */}
                <Group gap="xs" justify="flex-end">
                  <Button
                    variant="light"
                    size="compact-sm"
                    onClick={() => router.push(`/debts/${debt.id}/edit`)}
                  >
                    編集
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    size="compact-sm"
                    onClick={() => openDeleteModal(debt.id)}
                  >
                    削除
                  </Button>
                </Group>
              </Stack>
            </Card>
          );
        })
      )}

      {/* 削除確認モーダル */}
      <Modal opened={opened} onClose={close} title="借金を削除" centered>
        <Stack gap="md">
          <Text size="sm">この借金を削除してもよろしいですか？</Text>
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
