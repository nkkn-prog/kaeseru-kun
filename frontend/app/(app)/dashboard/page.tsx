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
import type { DashboardData } from "@/types/api";
import type { Recommendation } from "@/types/database";

// --- Mock data ---
// TODO: Server Component で Prisma から直接データを取得する

const mockData: DashboardData = {
  yearMonth: "2026年3月",
  totalDebt: 1250000,
  monthlyIncome: 280000,
  monthlyExpense: 210000,
  debtRatio: 32,
  recommendations: [
    {
      category: "subscription",
      description: "サブスク3件を解約すると月¥3,200節約可能",
      saving_amount: 3200,
      priority: "high",
    },
    {
      category: "food",
      description: "外食を週1回減らすと月¥4,000節約可能",
      saving_amount: 4000,
      priority: "medium",
    },
  ],
};

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

// --- Component ---

export default function DashboardPage() {
  // TODO: API呼び出しに差し替える
  const data = mockData;

  return (
    <Stack gap="md">
      {/* Month display */}
      <Title order={3}>{data.yearMonth}</Title>

      {/* Debt total card */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="sm" c="dimmed">
          借金残高合計
        </Text>
        <Title order={2} className="mt-1">
          {formatYen(data.totalDebt)}
        </Title>
      </Card>

      {/* Income / Expense cards */}
      <SimpleGrid cols={{ base: 2 }}>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Text size="sm" c="dimmed">
            今月の収入
          </Text>
          <Text fw={700} size="xl" c="teal" className="mt-1">
            {formatYen(data.monthlyIncome)}
          </Text>
        </Card>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Text size="sm" c="dimmed">
            今月の支出
          </Text>
          <Text fw={700} size="xl" c="red" className="mt-1">
            {formatYen(data.monthlyExpense)}
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
              {data.debtRatio}%
            </Text>
            <Badge color={getDebtRatioColor(data.debtRatio)} variant="light">
              {getDebtRatioLabel(data.debtRatio)}
            </Badge>
          </Group>
        </Group>
        <Progress
          value={data.debtRatio}
          color={getDebtRatioColor(data.debtRatio)}
          size="lg"
          radius="md"
        />
      </Paper>

      {/* AI recommendations */}
      <Stack gap="xs">
        <Title order={5}>AI からの提案</Title>
        {(data.recommendations ?? []).map((rec) => (
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
        ))}
      </Stack>

      {/* Link to monthly analysis */}
      <Anchor href="/analysis/current" underline="never">
        <Button variant="light" fullWidth size="md">
          月次分析レポートを見る
        </Button>
      </Anchor>
    </Stack>
  );
}
