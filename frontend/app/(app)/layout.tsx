"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  AppShell,
  NavLink,
  Text,
  Stack,
  Divider,
  Box,
  UnstyledButton,
  Group,
} from "@mantine/core";
import { logoutAction } from "@/app/actions/auth";

// --- Navigation item types ---

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

// SP: Bottom navigation items
const spNavItems: NavItem[] = [
  { label: "ホーム", href: "/dashboard", icon: "🏠" },
  { label: "借金", href: "/debts", icon: "💳" },
  { label: "登録", href: "/upload", icon: "📤" },
  { label: "分析", href: "/analysis/current", icon: "📊" },
];

// PC: Sidebar navigation items
const pcNavItems: NavItem[] = [
  { label: "ホーム", href: "/dashboard", icon: "🏠" },
  { label: "借金管理", href: "/debts", icon: "💳" },
  { label: "データ取込", href: "/upload", icon: "📤" },
  { label: "支出", href: "/transactions", icon: "💸" },
  { label: "収入", href: "/incomes", icon: "💴" },
  { label: "月次分析", href: "/analysis/current", icon: "📊" },
];

// --- Helper ---

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }
  return pathname.startsWith(href);
}

// --- Component ---

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {/* PC layout (>=768px): Sidebar + Main */}
      <AppShell
        navbar={{ width: 240, breakpoint: "sm" }}
        padding="md"
        visibleFrom="sm"
      >
        <AppShell.Navbar p="md">
          <Stack gap="xs" className="h-full">
            <Text fw={700} size="lg" className="mb-2">
              🐸 カエセルくん
            </Text>

            <Stack gap={4} className="flex-1">
              {pcNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  label={item.label}
                  leftSection={<span>{item.icon}</span>}
                  active={isActiveRoute(pathname, item.href)}
                  onClick={() => router.push(item.href)}
                  variant="light"
                />
              ))}
            </Stack>

            <Divider />

            <NavLink
              label="ログアウト"
              leftSection={<span>🚪</span>}
              onClick={() => {
                logoutAction();
              }}
              variant="subtle"
              color="gray"
            />
          </Stack>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>

      {/* SP layout (<768px): Content + Bottom nav */}
      <Box hiddenFrom="sm" className="min-h-screen pb-16">
        <Box p="md">{children}</Box>

        {/* Bottom navigation bar */}
        <Box
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white"
        >
          <Group gap={0} className="h-16" justify="space-around">
            {spNavItems.map((item) => {
              const active = isActiveRoute(pathname, item.href);
              return (
                <UnstyledButton
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="flex flex-1 flex-col items-center justify-center py-2"
                >
                  <Text size="xl" className={active ? "opacity-100" : "opacity-50"}>
                    {item.icon}
                  </Text>
                  <Text
                    size="xs"
                    fw={active ? 700 : 400}
                    c={active ? "blue" : "dimmed"}
                  >
                    {item.label}
                  </Text>
                </UnstyledButton>
              );
            })}
          </Group>
        </Box>
      </Box>
    </>
  );
}
