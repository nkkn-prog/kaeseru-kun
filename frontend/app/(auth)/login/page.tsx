"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

// --- バリデーション ---

function validateEmail(email: string): string | null {
  if (!email.trim()) return "メールアドレスを入力してください";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "正しいメールアドレスを入力してください";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "パスワードを入力してください";
  return null;
}

// --- Component ---

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
      return;
    }

    setErrors({});
    setLoading(true);

    // TODO: Supabase Auth のログイン処理を実装する
    // const { error } = await supabase.auth.signInWithPassword({ email, password });
    // ログイン成功時: router.push("/dashboard");
    // ログイン失敗時: エラーメッセージを表示

    // 仮の遷移（Supabase Auth 実装後に削除）
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1000);
  }

  return (
    <Paper shadow="md" p="xl" radius="md" withBorder>
      <Stack gap="md" align="center">
        <Title order={2}>カエセルくん</Title>
        <Text size="sm" c="dimmed">
          ログインしてはじめる
        </Text>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Stack gap="md" mt="lg">
          <TextInput
            label="メールアドレス"
            placeholder="mail@example.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            error={errors.email}
            required
          />
          <PasswordInput
            label="パスワード"
            placeholder="パスワードを入力"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            error={errors.password}
            required
          />
          <Button type="submit" fullWidth loading={loading}>
            ログイン
          </Button>
        </Stack>
      </form>

      <Stack gap="xs" mt="md" align="center">
        <Anchor href="#" size="sm" c="dimmed">
          {/* TODO: パスワードリセット画面を実装する */}
          パスワードを忘れた方はこちら
        </Anchor>
        <Anchor href="/register" size="sm">
          アカウント登録はこちら
        </Anchor>
      </Stack>
    </Paper>
  );
}
