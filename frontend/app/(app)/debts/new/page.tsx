"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

// --- Component ---

export default function DebtNewPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [lender, setLender] = useState("");
  const [currentBalance, setCurrentBalance] = useState<number | string>("");
  const [interestRate, setInterestRate] = useState<number | string>("");
  const [monthlyPayment, setMonthlyPayment] = useState<number | string>("");
  const [dueDay, setDueDay] = useState<number | string>("");
  const [debtType, setDebtType] = useState<string>("card_loan");
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

    // TODO: lib/api/debts.ts の createDebt() を呼び出す
    // const newDebt = await createDebt({
    //   user_id: userId,
    //   name,
    //   lender: lender || null,
    //   current_balance: Number(currentBalance),
    //   interest_rate: interestRate !== "" ? Number(interestRate) : null,
    //   monthly_payment: monthlyPayment !== "" ? Number(monthlyPayment) : null,
    //   due_day: dueDay !== "" ? Number(dueDay) : null,
    //   debt_type: debtType as DebtType,
    //   is_active: true,
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
        <Title order={3}>借金を登録</Title>
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
                登録する
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
