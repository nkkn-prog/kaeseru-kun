# 技術スタック

## 概要

カエセルくんの技術構成。
スマホのスクリーンショットから支出・収入・借金情報を読み取り、AIが削減提案を行うWebアプリ。

---

## リポジトリ構成（モノレポ）

```
kaeseru-kun/
  docs/        ← 設計ドキュメント
  frontend/    ← Next.js（Vercel にデプロイ）
  backend/     ← FastAPI（Railway にデプロイ）
```

GitHub リポジトリは1つ。Vercel・Railway それぞれにルートディレクトリを指定してデプロイする。

---

## フロントエンド

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js 15（App Router） |
| 言語 | TypeScript |
| ホスティング | Vercel |

---

## バックエンド

| 項目 | 技術 |
|------|------|
| フレームワーク | FastAPI |
| 言語 | Python |
| ホスティング | Railway |

---

## BaaS（Supabase）

| 機能 | 用途 |
|------|------|
| Auth | メール+パスワード認証 |
| PostgreSQL | 借金・支出・収入データの永続化 |
| Storage | アップロードされたスクリーンショットの保存 |

---

## AI

| 項目 | 技術 |
|------|------|
| 画像解析 | Gemini Vision API（スクショ→支出データ抽出） |
| テキスト分析・提案 | Claude Sonnet 4.6（支出分析・削減提案・返済シミュレーションの生成） |

---

## データフロー

```
1. ユーザーがスクリーンショットをアップロード
         ↓
2. Supabase Storage に保存
         ↓
3. FastAPI が Gemini Vision API に画像を渡す
         ↓
4. 金額・カテゴリを構造化データとして抽出
         ↓
5. Supabase PostgreSQL に保存
         ↓
6. Claude Sonnet 4.6 で支出分析・削減提案を生成
         ↓
7. Next.js ダッシュボードに表示
```

---

## 将来的なスケールパス

MVP 段階では Supabase + Railway で運用し、ユーザー数・データ量が増えた段階で以下に移行を検討する。

- Railway → AWS ECS（Fargate）
- Supabase PostgreSQL → AWS RDS
- Supabase Storage → AWS S3
- Vercel → 継続利用 or AWS CloudFront + S3

AWS の各種資格・実務経験があるため、移行コストは低い。
