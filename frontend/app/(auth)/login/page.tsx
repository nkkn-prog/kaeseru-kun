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
import { loginAction } from "@/app/actions/auth";

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
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
      return;
    }

    setErrors({});
    setServerError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);

      const result = await loginAction(formData);

      if (result.error) {
        setServerError(result.error);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("ログイン中にエラーが発生しました");
      setLoading(false);
    }
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
          {serverError && (
            <Text size="sm" c="red" ta="center">
              {serverError}
            </Text>
          )}
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
