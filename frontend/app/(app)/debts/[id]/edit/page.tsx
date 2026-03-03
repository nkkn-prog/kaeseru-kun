"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import type { DebtType } from "@/types/database";

// --- 定数 ---

const DEBT_TYPE_OPTIONS: { value: DebtType; label: string }[] = [
  { value: "card_loan", label: "カードローン" },
  { value: "mortgage", label: "住宅ローン" },
  { value: "student_loan", label: "奨学金" },
  { value: "credit_card", label: "クレジットカード" },
  { value: "other", label: "その他" },
];

// --- バリデーション ---

type FormErrors = {
  name?: string;
  current_balance?: string;
};

function validateForm(name: string, currentBalance: number | string): FormErrors {
  const errors: FormErrors = {};
  if (!name.trim()) errors.name = "名称を入力してください";
  if (currentBalance === "" || Number(currentBalance) <= 0)
    errors.current_balance = "残高を入力してください";
  return errors;
}

// --- モックデータ（既存データの取得を模擬） ---
// TODO: lib/api/debts.ts の getDebtById() を呼び出す

const mockDebt = {
  id: "1",
  name: "カードローンA",
  lender: "アコム",
  current_balance: 500000,
  interest_rate: 15,
  monthly_payment: 30000,
  due_day: 21,
  debt_type: "card_loan" as DebtType,
};

// --- Component ---

export default function DebtEditPage() {
  const router = useRouter();
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- API 実装時に getDebtById(debtId) で使用する
  const debtId = params.id as string;
  const [name, setName] = useState(mockDebt.name);
  const [lender, setLender] = useState(mockDebt.lender);
  const [currentBalance, setCurrentBalance] = useState<number | string>(
    mockDebt.current_balance
  );
  const [interestRate, setInterestRate] = useState<number | string>(
    mockDebt.interest_rate
  );
  const [monthlyPayment, setMonthlyPayment] = useState<number | string>(
    mockDebt.monthly_payment
  );
  const [dueDay, setDueDay] = useState<number | string>(mockDebt.due_day);
  const [debtType, setDebtType] = useState<string>(mockDebt.debt_type);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formErrors = validateForm(name, currentBalance);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    // TODO: lib/api/debts.ts の updateDebt() を呼び出す
    // const updated = await updateDebt(debtId, {
    //   name,
    //   lender: lender || null,
    //   current_balance: Number(currentBalance),
    //   interest_rate: interestRate !== "" ? Number(interestRate) : null,
    //   monthly_payment: monthlyPayment !== "" ? Number(monthlyPayment) : null,
    //   due_day: dueDay !== "" ? Number(dueDay) : null,
    //   debt_type: debtType as DebtType,
    // });

    // 仮の遷移（API 実装後に差し替え）
    setTimeout(() => {
      setLoading(false);
      router.push("/debts");
    }, 500);
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={3}>借金を編集</Title>
      </Group>

      <Paper shadow="sm" p="md" radius="md" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="名称"
              placeholder="例: カードローンA"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              error={errors.name}
              required
            />

            <TextInput
              label="借入先"
              placeholder="例: アコム"
              value={lender}
              onChange={(e) => setLender(e.currentTarget.value)}
            />

            <NumberInput
              label="残高（円）"
              placeholder="例: 500000"
              value={currentBalance}
              onChange={setCurrentBalance}
              error={errors.current_balance}
              min={0}
              thousandSeparator=","
              required
            />

            <NumberInput
              label="金利（%）"
              placeholder="例: 15"
              value={interestRate}
              onChange={setInterestRate}
              min={0}
              max={100}
              decimalScale={2}
            />

            <NumberInput
              label="月々の返済額（円）"
              placeholder="例: 30000"
              value={monthlyPayment}
              onChange={setMonthlyPayment}
              min={0}
              thousandSeparator=","
            />

            <NumberInput
              label="支払日（日）"
              placeholder="例: 21"
              value={dueDay}
              onChange={setDueDay}
              min={1}
              max={31}
            />

            <Select
              label="種別"
              data={DEBT_TYPE_OPTIONS}
              value={debtType}
              onChange={(val) => setDebtType(val ?? "card_loan")}
              allowDeselect={false}
            />

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => router.back()}>
                キャンセル
              </Button>
              <Button type="submit" loading={loading}>
                更新する
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
