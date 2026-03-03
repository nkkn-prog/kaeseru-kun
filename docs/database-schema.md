# データベース設計

## 概要

Supabase（PostgreSQL）を使用。`auth.users` は Supabase Auth が管理し、`profiles` テーブルでユーザー情報を拡張する。

---

## テーブル一覧

| テーブル名 | 概要 |
|-----------|------|
| profiles | ユーザー情報（Supabase Auth の拡張） |
| debts | 借金情報 |
| screenshots | アップロードされたスクリーンショット |
| transactions | 支出記録 |
| incomes | 収入記録 |
| monthly_analyses | 月次AI分析結果 |

---

## テーブル定義

### profiles

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### debts

```sql
CREATE TABLE debts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  lender          TEXT,
  current_balance INTEGER NOT NULL,
  interest_rate   DECIMAL(5, 2),
  interest_type   TEXT,              -- compound（複利）/ simple（単利）
  monthly_payment INTEGER,
  due_day         INTEGER,
  debt_type       TEXT NOT NULL DEFAULT 'other',  -- card_loan / mortgage / student_loan / credit_card / other
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### screenshots

```sql
CREATE TABLE screenshots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  source_type  TEXT NOT NULL DEFAULT 'other',  -- bank / credit_card / salary / other
  status       TEXT NOT NULL DEFAULT 'pending', -- pending / processing / completed / failed
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### transactions

```sql
CREATE TABLE transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  screenshot_id    UUID REFERENCES screenshots(id) ON DELETE SET NULL,
  amount           INTEGER NOT NULL,
  description      TEXT,
  category         TEXT,  -- food / subscription / entertainment / transport / utility / other
  transaction_date DATE NOT NULL,
  is_essential     BOOLEAN,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### incomes

```sql
CREATE TABLE incomes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  screenshot_id   UUID REFERENCES screenshots(id) ON DELETE SET NULL,
  amount          INTEGER NOT NULL,
  income_type     TEXT NOT NULL DEFAULT 'other',  -- salary / side_job / other
  income_date     DATE NOT NULL,
  description     TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### monthly_analyses

```sql
CREATE TABLE monthly_analyses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year_month        TEXT NOT NULL,
  total_income      INTEGER,
  total_expenses    INTEGER,
  total_debt        INTEGER,
  debt_ratio        DECIMAL(5, 2),
  unnecessary_total INTEGER,
  potential_savings INTEGER,
  recommendations   JSONB,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, year_month)
);
```

**recommendations の JSONB 構造（例）**

```json
[
  {
    "category": "subscription",
    "description": "使用頻度の低いサブスク3件を解約すると月額3,200円削減できます",
    "saving_amount": 3200,
    "priority": "high"
  }
]
```

---

## ER 図（概略）

```
auth.users
    │
    └── profiles ──┬── debts
                   ├── screenshots ──┬── transactions
                   │                 └── incomes
                   ├── transactions
                   ├── incomes
                   └── monthly_analyses
```

---

## 補足

- すべてのテーブルに Supabase の Row Level Security（RLS）を設定し、`user_id = auth.uid()` のデータのみアクセス可能にする。
- `monthly_analyses.recommendations` は JSONB で柔軟に持たせ、AI の出力フォーマット変更に対応しやすくする。
