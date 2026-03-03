# API エンドポイント設計

## 概要

- ベース URL: `https://api.kaeseru-kun.app`（本番）/ `http://localhost:8000`（開発）
- 認証: Supabase JWT を `Authorization: Bearer <token>` ヘッダーで送信
- レスポンス形式: JSON
- 認証が必要なエンドポイントはすべて 🔒 マークを付与

---

## 認証（Supabase Auth が担当）

| 操作 | SDK メソッド |
|------|------------|
| 新規登録 | `supabase.auth.signUp()` |
| ログイン | `supabase.auth.signInWithPassword()` |
| ログアウト | `supabase.auth.signOut()` |
| パスワードリセット | `supabase.auth.resetPasswordForEmail()` |

---

## 借金 `/debts`

### GET /debts 🔒
借金一覧を取得する。

**レスポンス**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "カードローンA",
      "lender": "アコム",
      "current_balance": 500000,
      "interest_rate": 15.0,
      "monthly_payment": 30000,
      "due_day": 21,
      "debt_type": "card_loan",
      "is_active": true,
      "months_to_payoff": 20,
      "total_interest": 78000
    }
  ]
}
```

### POST /debts 🔒
借金を新規登録する。

**リクエスト**
```json
{
  "name": "カードローンA",
  "lender": "アコム",
  "current_balance": 500000,
  "interest_rate": 15.0,
  "monthly_payment": 30000,
  "due_day": 21,
  "debt_type": "card_loan"
}
```

### PUT /debts/{id} 🔒
借金情報を更新する（部分更新）。

### DELETE /debts/{id} 🔒
借金を削除する。

### GET /debts/simulation 🔒
全借金の返済シミュレーションを返す。

**クエリパラメータ**
- `extra_payment`（任意）: 追加返済額（円）

**レスポンス**
```json
{
  "current": {
    "total_months": 50,
    "total_interest": 120000,
    "payoff_date": "2030-05"
  },
  "with_extra_payment": {
    "extra_payment": 7200,
    "total_months": 47,
    "total_interest": 108000,
    "payoff_date": "2030-02",
    "months_saved": 3
  }
}
```

---

## データ取り込み `/uploads`

### POST /uploads 🔒
スクショまたは CSV をアップロードして解析を開始する。

**リクエスト**: `multipart/form-data`

| フィールド | 型 | 説明 |
|-----------|-----|------|
| file | File | 画像（jpg/png）または CSV |
| source_type | string | bank / credit_card / salary / other |
| file_type | string | screenshot / csv |

**レスポンス**（202）
```json
{
  "id": "uuid",
  "status": "pending",
  "file_type": "csv",
  "source_type": "credit_card"
}
```

### GET /uploads/{id} 🔒
処理状態を確認する（ポーリング用）。

### GET /uploads/{id}/result 🔒
解析結果を取得する。

**レスポンス**
```json
{
  "upload_id": "uuid",
  "file_type": "csv",
  "source_type": "credit_card",
  "column_mapping_required": true,
  "detected_columns": ["取引日", "摘要", "出金金額(円)", "入金金額(円)", "残高(円)"],
  "extracted_items": [
    {
      "amount": 980,
      "description": "Netflix",
      "category": "subscription",
      "date": "2026-03-01",
      "is_essential": false
    }
  ]
}
```

### POST /uploads/{id}/column-mapping 🔒
CSV のカラムマッピングを送信する。

**リクエスト**
```json
{
  "mapping": {
    "取引日": "transaction_date",
    "摘要": "description",
    "出金金額(円)": "expense_amount",
    "入金金額(円)": "income_amount",
    "残高(円)": "ignore"
  }
}
```

### POST /uploads/{id}/confirm 🔒
確認・修正済みのデータを確定して保存する。

**リクエスト**
```json
{
  "items": [
    {
      "amount": 980,
      "description": "Netflix",
      "category": "subscription",
      "transaction_date": "2026-03-01",
      "is_essential": false,
      "type": "transaction"
    }
  ]
}
```

---

## 支出 `/transactions`

### GET /transactions 🔒
**クエリパラメータ**: `year_month`, `category`

### POST /transactions 🔒
手入力で支出を登録する。

### PUT /transactions/{id} 🔒
### DELETE /transactions/{id} 🔒

---

## 収入 `/incomes`

### GET /incomes 🔒
**クエリパラメータ**: `year_month`

### POST /incomes 🔒
### PUT /incomes/{id} 🔒
### DELETE /incomes/{id} 🔒

---

## 月次分析 `/analyses`

### GET /analyses/{year_month} 🔒
指定月の AI 分析結果を取得する。未生成の場合は 404。

### POST /analyses/{year_month}/generate 🔒
指定月の AI 分析を生成（または再生成）する。

---

## エラーレスポンス形式

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です"
  }
}
```

| HTTP ステータス | コード | 説明 |
|----------------|--------|------|
| 400 | BAD_REQUEST | リクエストの形式が不正 |
| 401 | UNAUTHORIZED | 認証トークンが無効 |
| 403 | FORBIDDEN | 他ユーザーのリソースへのアクセス |
| 404 | NOT_FOUND | リソースが存在しない |
| 422 | VALIDATION_ERROR | バリデーションエラー |
| 500 | INTERNAL_ERROR | サーバー内部エラー |
