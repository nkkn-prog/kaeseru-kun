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
import { deleteDebtAction } from "@/app/actions/debts";
import type { Debt, DebtType, InterestType } from "@/types/database";

// --- 定数 ---

const DEBT_TYPE_LABELS: Record<DebtType, string> = {
  card_loan: "カードローン",
  mortgage: "住宅ローン",
  student_loan: "奨学金",
  credit_card: "クレジットカード",
  other: "その他",
};

const INTEREST_TYPE_LABELS: Record<InterestType, string> = {
  compound: "複利",
  simple: "単利",
};

// --- ヘルパー ---

function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

/**
 * 完済までの月数を概算で計算する
 *
 * - 金利なし: 残高 ÷ 月返済額
 * - 単利: 元本に対してのみ利息が発生。P / (M - P * r / 12)
 * - 複利: 毎月の残高に利息が発生。-log(1 - P * r/12 / M) / log(1 + r/12)
 *
 * 月返済額が利息以下の場合は返済不能として null を返す。
 */
function estimateMonthsToPayoff(
  balance: number,
  monthlyPayment: number | null,
  interestRate: number | null,
  interestType: InterestType | null,
): number | null {
  if (!monthlyPayment || monthlyPayment <= 0) return null;
  if (balance <= 0) return 0;

  // 金利なし
  if (!interestRate || interestRate === 0) {
    return Math.ceil(balance / monthlyPayment);
  }

  const annualRate = interestRate / 100;
  const monthlyRate = annualRate / 12;

  if (interestType === "simple") {
    // 単利: 利息は元本にのみ発生
    // 総返済額 = P + P * r * n/12 = M * n
    // n = P / (M - P * r / 12)
    const denominator = monthlyPayment - balance * monthlyRate;
    if (denominator <= 0) return null; // 返済不能
    return Math.ceil(balance / denominator);
  }

  // 複利（デフォルト）: 残高に対して毎月利息が発生
  // n = -log(1 - P * monthlyRate / M) / log(1 + monthlyRate)
  const ratio = balance * monthlyRate / monthlyPayment;
  if (ratio >= 1) return null; // 返済不能（月返済額が利息以下）
  return Math.ceil(-Math.log(1 - ratio) / Math.log(1 + monthlyRate));
}

// --- Props ---

type DebtsPageClientProps = {
  debts: Debt[];
};

// --- Component ---

export function DebtsPageClient({ debts }: DebtsPageClientProps) {
  const router = useRouter();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const totalBalance = debts.reduce((sum, d) => sum + d.current_balance, 0);

  async function handleDelete() {
    if (!deleteTargetId) return;

    setDeleting(true);
    try {
      await deleteDebtAction(deleteTargetId);
      setDeleteTargetId(null);
      close();
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "削除に失敗しました";
      // TODO: Mantine の notifications で表示する
      alert(message);
    } finally {
      setDeleting(false);
    }
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
            debt.monthly_payment,
            debt.interest_rate,
            debt.interest_type,
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
                        金利{debt.interest_type ? `（${INTEREST_TYPE_LABELS[debt.interest_type]}）` : ""}
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
            <Button color="red" onClick={handleDelete} loading={deleting}>
              削除する
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
