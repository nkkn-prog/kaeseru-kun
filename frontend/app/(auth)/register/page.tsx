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
  if (password.length < 6) return "パスワードは6文字以上で入力してください";
  return null;
}

function validatePasswordConfirm(
  password: string,
  confirm: string
): string | null {
  if (!confirm) return "パスワード（確認）を入力してください";
  if (password !== confirm) return "パスワードが一致しません";
  return null;
}

// --- Component ---

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    passwordConfirm?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const passwordConfirmError = validatePasswordConfirm(
      password,
      passwordConfirm
    );

    if (emailError || passwordError || passwordConfirmError) {
      setErrors({
        email: emailError ?? undefined,
        password: passwordError ?? undefined,
        passwordConfirm: passwordConfirmError ?? undefined,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    // TODO: Supabase Auth の新規登録処理を実装する
    // const { error } = await supabase.auth.signUp({ email, password });
    // 登録成功時: router.push("/dashboard");
    // 登録失敗時: エラーメッセージを表示

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
          アカウントを作成する
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
            placeholder="6文字以上で入力"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            error={errors.password}
            required
          />
          <PasswordInput
            label="パスワード（確認）"
            placeholder="もう一度入力"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.currentTarget.value)}
            error={errors.passwordConfirm}
            required
          />
          <Button type="submit" fullWidth loading={loading}>
            アカウント登録
          </Button>
        </Stack>
      </form>

      <Stack gap="xs" mt="md" align="center">
        <Anchor href="/login" size="sm">
          ログインはこちら
        </Anchor>
      </Stack>
    </Paper>
  );
}
