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
import { updateDebtAction } from "@/app/actions/debts";
import type { Debt, DebtType } from "@/types/database";

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

// --- Props ---

type DebtEditFormClientProps = {
  debt: Debt;
};

// --- Component ---

export function DebtEditFormClient({ debt }: DebtEditFormClientProps) {
  const router = useRouter();
  const [name, setName] = useState(debt.name);
  const [lender, setLender] = useState(debt.lender ?? "");
  const [currentBalance, setCurrentBalance] = useState<number | string>(
    debt.current_balance
  );
  const [interestRate, setInterestRate] = useState<number | string>(
    debt.interest_rate ?? ""
  );
  const [monthlyPayment, setMonthlyPayment] = useState<number | string>(
    debt.monthly_payment ?? ""
  );
  const [dueDay, setDueDay] = useState<number | string>(debt.due_day ?? "");
  const [debtType, setDebtType] = useState<string>(debt.debt_type);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formErrors = validateForm(name, currentBalance);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("lender", lender);
      formData.set("current_balance", String(currentBalance));
      if (interestRate !== "") formData.set("interest_rate", String(interestRate));
      if (monthlyPayment !== "") formData.set("monthly_payment", String(monthlyPayment));
      if (dueDay !== "") formData.set("due_day", String(dueDay));
      formData.set("debt_type", debtType);

      await updateDebtAction(debt.id, formData);
      router.push("/debts");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "更新に失敗しました";
      // TODO: Mantine の notifications で表示する
      alert(message);
    } finally {
      setLoading(false);
    }
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
