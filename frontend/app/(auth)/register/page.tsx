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
import { registerAction } from "@/app/actions/auth";

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
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
    setServerError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);

      const result = await registerAction(formData);

      if (result.error) {
        setServerError(result.error);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("アカウント登録中にエラーが発生しました");
      setLoading(false);
    }
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
