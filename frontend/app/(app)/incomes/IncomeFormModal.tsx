"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import "dayjs/locale/ja";
import {
  createIncomeAction,
  updateIncomeAction,
} from "@/app/actions/incomes";
import type { Income, IncomeType } from "@/types/database";

// --- 定数 ---

const INCOME_TYPE_OPTIONS: { value: IncomeType; label: string }[] = [
  { value: "salary", label: "給与" },
  { value: "side_job", label: "副業" },
  { value: "other", label: "その他" },
];

// --- Props ---

type IncomeFormModalProps = {
  opened: boolean;
  onClose: () => void;
  income?: Income;
};

// --- Component ---

export function IncomeFormModal({
  opened,
  onClose,
  income,
}: IncomeFormModalProps) {
  const router = useRouter();
  const isEdit = !!income;

  const [amount, setAmount] = useState<number | string>(
    income?.amount ?? ""
  );
  const [incomeType, setIncomeType] = useState<string>(
    income?.income_type ?? "salary"
  );
  const [incomeDate, setIncomeDate] = useState<string | null>(
    income ? income.income_date : new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState(
    income?.description ?? ""
  );
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setAmount("");
    setIncomeType("salary");
    setIncomeDate(new Date().toISOString().split("T")[0]);
    setDescription("");
  }

  function handleClose() {
    if (!isEdit) {
      resetForm();
    }
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      notifications.show({
        title: "入力エラー",
        message: "金額を入力してください",
        color: "red",
      });
      return;
    }

    if (!incomeDate) {
      notifications.show({
        title: "入力エラー",
        message: "収入日を入力してください",
        color: "red",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("amount", String(amount));
      formData.set("income_type", incomeType);
      formData.set("income_date", incomeDate);
      if (description.trim()) {
        formData.set("description", description.trim());
      }

      const result = isEdit
        ? await updateIncomeAction(income.id, formData)
        : await createIncomeAction(formData);

      if (result.error) {
        notifications.show({
          title: isEdit ? "更新エラー" : "登録エラー",
          message: result.error,
          color: "red",
        });
        return;
      }

      if (!isEdit) {
        resetForm();
      }
      onClose();
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isEdit
            ? "更新に失敗しました"
            : "登録に失敗しました";
      notifications.show({
        title: "エラー",
        message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isEdit ? "収入を編集" : "収入を登録"}
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <NumberInput
            label="金額（円）"
            placeholder="例: 250000"
            value={amount}
            onChange={setAmount}
            min={1}
            thousandSeparator=","
            required
          />

          <Select
            label="収入種別"
            data={INCOME_TYPE_OPTIONS}
            value={incomeType}
            onChange={(val) => setIncomeType(val ?? "salary")}
            allowDeselect={false}
          />

          <DateInput
            label="収入日"
            placeholder="日付を選択"
            value={incomeDate}
            onChange={setIncomeDate}
            locale="ja"
            valueFormat="YYYY/MM/DD"
            required
          />

          <TextInput
            label="説明"
            placeholder="例: 3月分給与"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit" loading={loading}>
              {isEdit ? "更新する" : "登録する"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
