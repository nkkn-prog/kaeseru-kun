import {
  Anchor,
  Card,
  Text,
  Title,
  Group,
  Stack,
  SimpleGrid,
  Badge,
  Button,
  Paper,
  Progress,
} from "@mantine/core";
import type { Recommendation } from "@/types/database";
import { requireAuth } from "@/lib/auth";
import { getTotalDebtBalance } from "@/lib/api/debts";
import { getTransactions } from "@/lib/api/transactions";
import { getIncomes } from "@/lib/api/incomes";
import { getAnalysis } from "@/lib/api/analyses";

// --- Helper ---

function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

function getDebtRatioColor(ratio: number): string {
  if (ratio >= 30) return "orange";
  if (ratio >= 20) return "yellow";
  return "teal";
}

function getDebtRatioLabel(ratio: number): string {
  if (ratio >= 30) return "高め";
  if (ratio >= 20) return "やや高め";
  return "良好";
}

function getPriorityColor(priority: Recommendation["priority"]): string {
  switch (priority) {
    case "high":
      return "red";
    case "medium":
      return "yellow";
    case "low":
      return "blue";
  }
}

/**
 * 現在の年月を "YYYY-MM" 形式で取得する
 */
function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * 現在の年月を表示用ラベルに変換する（例: "2026年3月"）
 */
function formatYearMonthLabel(yearMonth: string): string {
  const [yearStr, monthStr] = yearMonth.split("-");
  return `${yearStr}年${Number(monthStr)}月`;
}

// --- Component ---

export default async function DashboardPage() {
  const user = await requireAuth();
  const currentYearMonth = getCurrentYearMonth();

  const [totalDebt, transactions, incomes, analysis] = await Promise.all([
    getTotalDebtBalance(user.id),
    getTransactions(user.id, currentYearMonth),
    getIncomes(user.id, currentYearMonth),
    getAnalysis(user.id, currentYearMonth),
  ]);

  const monthlyExpense = transactions.reduce((sum, t) => sum + t.amount, 0);
  const monthlyIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const debtRatio = monthlyIncome > 0
    ? Math.round((monthlyExpense / monthlyIncome) * 100)
    : 0;
  const recommendations = analysis?.recommendations ?? null;
  const yearMonthLabel = formatYearMonthLabel(currentYearMonth);

  return (
    <Stack gap="md">
      {/* Month display */}
      <Title order={3}>{yearMonthLabel}</Title>

      {/* Debt total card */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="sm" c="dimmed">
          借金残高合計
        </Text>
        <Title order={2} className="mt-1">
          {formatYen(totalDebt)}
        </Title>
      </Card>

      {/* Income / Expense cards */}
      <SimpleGrid cols={{ base: 2 }}>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Text size="sm" c="dimmed">
            今月の収入
          </Text>
          <Text fw={700} size="xl" c="teal" className="mt-1">
            {formatYen(monthlyIncome)}
          </Text>
        </Card>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Text size="sm" c="dimmed">
            今月の支出
          </Text>
          <Text fw={700} size="xl" c="red" className="mt-1">
            {formatYen(monthlyExpense)}
          </Text>
        </Card>
      </SimpleGrid>

      {/* Debt ratio bar */}
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500}>
            返済負担率
          </Text>
          <Group gap="xs">
            <Text fw={700} size="lg">
              {debtRatio}%
            </Text>
            <Badge color={getDebtRatioColor(debtRatio)} variant="light">
              {getDebtRatioLabel(debtRatio)}
            </Badge>
          </Group>
        </Group>
        <Progress
          value={debtRatio}
          color={getDebtRatioColor(debtRatio)}
          size="lg"
          radius="md"
        />
      </Paper>

      {/* AI recommendations */}
      <Stack gap="xs">
        <Title order={5}>AI からの提案</Title>
        {(recommendations ?? []).length === 0 ? (
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Text size="sm" c="dimmed" ta="center">
              まだ提案がありません。月次分析を実行してください。
            </Text>
          </Card>
        ) : (
          (recommendations ?? []).map((rec) => (
            <Card key={rec.category} shadow="sm" padding="md" radius="md" withBorder>
              <Group justify="space-between" align="flex-start">
                <Stack gap={4} className="flex-1">
                  <Group gap="xs">
                    <Badge
                      color={getPriorityColor(rec.priority)}
                      variant="filled"
                      size="sm"
                    >
                      {rec.priority === "high"
                        ? "高"
                        : rec.priority === "medium"
                          ? "中"
                          : "低"}
                    </Badge>
                    <Text size="sm" fw={500}>
                      {rec.description}
                    </Text>
                  </Group>
                </Stack>
                {/* TODO: 提案詳細ページへの遷移を実装する */}
                <Button variant="subtle" size="compact-sm">
                  詳細
                </Button>
              </Group>
            </Card>
          ))
        )}
      </Stack>

      {/* Link to monthly analysis */}
      <Anchor href={`/analysis/${currentYearMonth}`} underline="never">
        <Button variant="light" fullWidth size="md">
          月次分析レポートを見る
        </Button>
      </Anchor>
    </Stack>
  );
}
