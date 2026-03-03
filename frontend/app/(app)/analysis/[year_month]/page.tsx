"use client";

import { useParams, useRouter } from "next/navigation";
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
import type { MonthlyAnalysis, Recommendation, RecommendationPriority } from "@/types/database";

// --- モックデータ ---
// TODO: lib/api/analyses.ts の getAnalysis() を呼び出す

const mockAnalysis: MonthlyAnalysis = {
  id: "analysis-1",
  user_id: "user-1",
  year_month: "2026-03",
  total_income: 280000,
  total_expenses: 210000,
  total_debt: 1250000,
  debt_ratio: 16,
  unnecessary_total: 7200,
  potential_savings: 7200,
  recommendations: [
    {
      category: "サブスク",
      description: "サブスク3件を解約",
      saving_amount: 3200,
      priority: "high",
    },
    {
      category: "食費",
      description: "外食を週1回削減",
      saving_amount: 4000,
      priority: "medium",
    },
  ],
  created_at: "2026-03-01T00:00:00Z",
};

// --- カテゴリ別支出モック ---

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

// --- Component ---

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const yearMonth = params.year_month as string;

  // TODO: lib/api/analyses.ts の getAnalysis(yearMonth) を呼び出す
  const analysis = mockAnalysis;

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
