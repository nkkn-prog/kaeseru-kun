# frontend（カエセルくん）

Next.js 16 / React 19 / TypeScript / Tailwind CSS v4 / Mantine UI で構築するフロントエンド。
DB アクセスは Prisma 経由で行い、AI 処理のみ FastAPI（backend）に委譲する。

## ディレクトリ構成（予定）

```
frontend/
  app/
    (auth)/
      login/          # ログイン画面
      register/       # 会員登録画面
    (app)/
      layout.tsx      # 認証済みユーザー向けレイアウト（ナビゲーション含む）
      dashboard/      # ダッシュボード
      debts/          # 借金一覧・管理
      upload/         # データアップロード（スクショ・CSV）
      transactions/   # 支出一覧
      incomes/        # 収入一覧
      analysis/       # 月次分析レポート
    layout.tsx        # ルートレイアウト
    page.tsx          # トップ（ログイン済みなら dashboard へリダイレクト）
  components/
    ui/               # 汎用UIコンポーネント（Button, Input, Card など）
    features/         # 機能単位のコンポーネント
  lib/
    supabase/         # Supabase Auth・Storage クライアント
    prisma/           # Prisma クライアント（DB アクセス）
    api/              # FastAPI クライアント（AI処理用）
    utils/            # 共通ユーティリティ
  prisma/
    schema.prisma     # スキーマ定義
  types/              # TypeScript 型定義
```

## 開発コマンド

```bash
pnpm dev        # 開発サーバー起動（http://localhost:3000）
pnpm build      # プロダクションビルド
pnpm lint       # ESLint 実行
```

## 技術スタック

| 項目 | 技術 | バージョン |
|------|------|-----------|
| フレームワーク | Next.js（App Router） | 16.1.6 |
| UIライブラリ | React | 19.2.3 |
| 言語 | TypeScript | ^5 |
| スタイリング | Tailwind CSS v4 | ^4 |
| UIコンポーネント | Mantine UI | ^7 |
| ORM | Prisma | ^5 |
| BaaS | Supabase（Auth・Storage） | - |
| パッケージマネージャー | pnpm（Voltaで管理） | - |

## Prisma（DB アクセス）

DB アクセスはすべて Prisma 経由で行う。Supabase の PostgreSQL に直接接続する。

### 接続 URL は2つ必要

Supabase は PgBouncer（接続プール）を使っているため、Prisma では URL を2つ設定する必要がある。

```env
# クエリ用（プール経由）※ pgbouncer=true と connection_limit=1 が必須
DATABASE_URL=postgresql://postgres:[pw]@aws-0-xxx.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# マイグレーション用（直接接続）
DIRECT_URL=postgresql://postgres:[pw]@db.xxx.supabase.co:5432/postgres
```

`schema.prisma` にも両方を記述すること：

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

`DATABASE_URL` のみで `prisma migrate` を実行するとエラーになる。必ず `DIRECT_URL` を設定してから実行すること。

### Prisma コマンド

```bash
pnpm prisma generate       # クライアント生成
pnpm prisma db push        # スキーマをDBに反映（開発時）
pnpm prisma migrate dev    # マイグレーション作成・適用（本番運用時）
pnpm prisma studio         # GUI でデータ確認
```

Prisma クライアントは `lib/prisma/client.ts` に集約する。
スキーマは `prisma/schema.prisma` で管理する。`docs/database-schema.md` の定義と必ず一致させること。

### RLS は Prisma 経由では自動適用されない

Prisma は `service_role_key` で接続するため RLS が**完全にバイパスされる**。
他ユーザーのデータを誤って返さないよう、クエリには必ず `where: { userId }` を明示すること。

```ts
// ❌ 危険：全ユーザーのデータが取得される
const debts = await prisma.debt.findMany()

// ✅ 正しい：ログインユーザーのデータのみ取得
const debts = await prisma.debt.findMany({ where: { userId } })
```

## Supabase 接続

Supabase は **Auth と Storage のみ**に使用する。DB アクセスは Prisma を使うこと。

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Supabase クライアントは `lib/supabase/client.ts` に集約する。

### Storage バケットは必ず private に設定する

スクリーンショットには金融情報が含まれるため、**public バケットは絶対に使わない**。
ファイルへのアクセスは署名付き URL（Signed URL）を発行して行う。

### Free tier はプロジェクトが1週間放置で一時停止する

開発中に DB に繋がらなくなった場合、Supabase ダッシュボードでプロジェクトが停止していないか確認すること。手動で再開できる。

## FastAPI（backend）との通信

AI 処理（スクショ解析・月次分析）のみ backend に委譲する。

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000  # 開発環境
```

## 実装の優先順位

1. 認証（ログイン・会員登録）
2. ダッシュボード（借金残高・返済見込みの表示）
3. 借金管理（CRUD）
4. データアップロード（CSV → 手入力確認画面）
5. データアップロード（スクショ → Gemini 解析 → 確認画面）
6. 支出・収入管理
7. 月次分析レポート（Claude Sonnet 4.6 による提案）

## UI 方針

- **モバイルファースト**。SP（〜768px）を基準に設計し、PC はサイドバーナビを追加
- SP: 下部ナビゲーションバー（ダッシュボード・借金・アップロード・分析）
- PC: 左サイドバーナビゲーション
- 詳細は `../docs/screen-design.md` を参照

## TypeScript ルール

- **`any` を使わない** — 型が不明な場合は `unknown` を使い、型ガードで絞り込む。やむを得ない場合は `// eslint-disable-next-line` にコメントで理由を明記する
- **Supabase の型は自動生成したものを使う** — `supabase gen types typescript` で生成した型を `types/database.ts` に配置し、手書きの型定義と二重管理しない
- **コンポーネントの Props には必ず型をつける** — `React.FC` よりも明示的な Props 型定義を優先する

## 注意事項

- API キー・シークレットは `.env.local` で管理。コードに直書きしない
- `NEXT_PUBLIC_` プレフィックスがある変数はブラウザに露出するため、秘匿情報を入れない
- Supabase の秘匿キー（`service_role_key`）はバックエンドのみで使用し、フロントには渡さない

## ライブラリインストールのルール

パッケージインストール時にバージョン互換エラーが発生した場合、**エラーを無視してインストールしてはいけない**。

禁止オプション：
- `--force`
- `--legacy-peer-deps`
- `--ignore-engines`

エラーが出たら必ずユーザーに報告し、以下を提示して判断を仰ぐ：
1. エラーの内容と原因
2. 互換性のある代替バージョン（存在する場合）
3. 代替ライブラリの候補（存在する場合）

強引なインストールは依存関係の破損や実行時エラーの原因になるため、絶対に行わない。
