"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { generateAnalysisAction } from "@/app/actions/analyses";
import type { MonthlyAnalysis, Recommendation, RecommendationPriority } from "@/types/database";

// --- カテゴリ別支出モック ---
// TODO: transactions から集計して算出する

type CategoryExpense = {
  category: string;
  amount: number;
  percentage: number;
};

const mockCategoryExpenses: CategoryExpense[] = [
  { category: "食費", amount: 60000, percentage: 29 },
  { category: "サブスク", amount: 40000, percentage: 19 },
  { category: "交際費", amount: 30000, percentage: 14 },
  { category: "交通費", amount: 20000, percentage: 10 },
  { category: "その他", amount: 60000, percentage: 28 },
];

// --- ヘルパー ---

function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

function parseYearMonth(ym: string): { year: number; month: number } | null {
  const match = ym.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}

function formatYearMonthLabel(ym: string): string {
  const parsed = parseYearMonth(ym);
  if (!parsed) return ym;
  return `${parsed.year}年${parsed.month}月`;
}

function getPrevMonth(ym: string): string {
  const parsed = parseYearMonth(ym);
  if (!parsed) return ym;
  const d = new Date(parsed.year, parsed.month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getNextMonth(ym: string): string {
  const parsed = parseYearMonth(ym);
  if (!parsed) return ym;
  const d = new Date(parsed.year, parsed.month, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getPriorityColor(priority: RecommendationPriority): string {
  switch (priority) {
    case "high":
      return "red";
    case "medium":
      return "yellow";
    case "low":
      return "blue";
  }
}

function getPriorityLabel(priority: RecommendationPriority): string {
  switch (priority) {
    case "high":
      return "高優先度";
    case "medium":
      return "中優先度";
    case "low":
      return "低優先度";
  }
}

// --- Props ---

type AnalysisPageClientProps = {
  yearMonth: string;
  analysis: MonthlyAnalysis | null;
};

// --- Component ---

export function AnalysisPageClient({ yearMonth, analysis }: AnalysisPageClientProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateAnalysisAction(yearMonth);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "分析の生成に失敗しました";
      // TODO: Mantine の notifications で表示する
      alert(message);
    } finally {
      setGenerating(false);
    }
  }

  // 未分析状態
  if (!analysis) {
    return (
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Button
            variant="subtle"
            size="compact-sm"
            onClick={() => router.push(`/analysis/${getPrevMonth(yearMonth)}`)}
          >
            前月
          </Button>
          <Title order={3}>{formatYearMonthLabel(yearMonth)}の分析</Title>
          <Button
            variant="subtle"
            size="compact-sm"
            onClick={() => router.push(`/analysis/${getNextMonth(yearMonth)}`)}
          >
            次月
          </Button>
        </Group>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md" align="center">
            <Text c="dimmed" ta="center">
              この月の分析はまだ生成されていません
            </Text>
            <Button onClick={handleGenerate} loading={generating}>
              分析を生成する
            </Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  const highRecs = (analysis.recommendations ?? []).filter(
    (r) => r.priority === "high"
  );
  const mediumRecs = (analysis.recommendations ?? []).filter(
    (r) => r.priority === "medium"
  );
  const lowRecs = (analysis.recommendations ?? []).filter(
    (r) => r.priority === "low"
  );

  const totalSavings = (analysis.recommendations ?? []).reduce(
    (sum, r) => sum + r.saving_amount,
    0
  );

  return (
    <Stack gap="md">
      {/* ヘッダー: タイトルとナビゲーション */}
      <Group justify="space-between" align="center">
        <Button
          variant="subtle"
          size="compact-sm"
          onClick={() => router.push(`/analysis/${getPrevMonth(yearMonth)}`)}
        >
          前月
        </Button>
        <Title order={3}>{formatYearMonthLabel(yearMonth)}の分析</Title>
        <Button
          variant="subtle"
          size="compact-sm"
          onClick={() => router.push(`/analysis/${getNextMonth(yearMonth)}`)}
        >
          次月
        </Button>
      </Group>

      {/* サマリーカード */}
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              収入
            </Text>
            <Text fw={600} c="teal">
              {formatYen(analysis.total_income ?? 0)}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              支出
            </Text>
            <Text fw={600} c="red">
              {formatYen(analysis.total_expenses ?? 0)}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              返済負担率
            </Text>
            <Text fw={600}>
              {analysis.debt_ratio ?? 0}%
            </Text>
          </Group>
        </Stack>
      </Card>

      {/* カテゴリ別支出 */}
      {/* TODO: transactions から集計して算出する */}
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Title order={5} mb="sm">
          カテゴリ別支出
        </Title>
        <Stack gap="xs">
          {mockCategoryExpenses.map((cat) => (
            <Group key={cat.category} justify="space-between" wrap="nowrap">
              <Text size="sm" className="w-16 shrink-0">
                {cat.category}
              </Text>
              <Box className="flex-1 mx-2">
                <Box
                  className="h-4 rounded bg-blue-500"
                  style={{ width: `${cat.percentage}%` }}
                />
              </Box>
              <Text size="sm" fw={500} className="shrink-0">
                {formatYen(cat.amount)}
              </Text>
            </Group>
          ))}
        </Stack>
      </Paper>

      {/* AI 削減提案: 高優先度 */}
      {highRecs.length > 0 && (
        <Stack gap="xs">
          <Title order={5} c="red">
            削減提案（高優先度）
          </Title>
          {highRecs.map((rec, index) => (
            <RecommendationCard key={`high-${index}`} rec={rec} />
          ))}
        </Stack>
      )}

      {/* AI 削減提案: 中優先度 */}
      {mediumRecs.length > 0 && (
        <Stack gap="xs">
          <Title order={5} c="yellow.7">
            削減提案（中優先度）
          </Title>
          {mediumRecs.map((rec, index) => (
            <RecommendationCard key={`medium-${index}`} rec={rec} />
          ))}
        </Stack>
      )}

      {/* AI 削減提案: 低優先度 */}
      {lowRecs.length > 0 && (
        <Stack gap="xs">
          <Title order={5} c="blue">
            削減提案（低優先度）
          </Title>
          {lowRecs.map((rec, index) => (
            <RecommendationCard key={`low-${index}`} rec={rec} />
          ))}
        </Stack>
      )}

      {/* 削減シミュレーション */}
      <Card shadow="sm" padding="md" radius="md" withBorder className="bg-gray-50">
        <Stack gap="xs">
          <Title order={5}>提案通り実行した場合</Title>
          <Group justify="space-between">
            <Text size="sm">合計削減額</Text>
            <Text fw={700} c="teal">
              {formatYen(totalSavings)}/月
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm">返済完了</Text>
            <Text fw={700} c="teal">
              {/* TODO: backend のシミュレーション API から正確な値を取得する */}
              約 2.5ヶ月 早まる
            </Text>
          </Group>
        </Stack>
      </Card>

      {/* 再生成ボタン */}
      <Button
        variant="light"
        fullWidth
        onClick={handleGenerate}
        loading={generating}
      >
        分析を再生成する
      </Button>
    </Stack>
  );
}

// --- 提案カード ---

type RecommendationCardProps = {
  rec: Recommendation;
};

function RecommendationCard({ rec }: RecommendationCardProps) {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack gap={4}>
        <Group gap="xs">
          <Badge color={getPriorityColor(rec.priority)} variant="filled" size="sm">
            {getPriorityLabel(rec.priority)}
          </Badge>
          <Text size="sm" fw={500}>
            {rec.description}
          </Text>
        </Group>
        <Text size="sm" c="teal">
          月 {formatYen(rec.saving_amount)} 削減
        </Text>
      </Stack>
    </Card>
  );
}
