# frontend（カエセルくん）

Next.js 16 / React 19 / TypeScript / Tailwind CSS v4 で構築するフロントエンド。
Supabase に直接アクセスして CRUD を行い、AI 処理のみ FastAPI（backend）に委譲する。

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
    supabase/         # Supabase クライアント・型定義
    api/              # FastAPI クライアント（AI処理用）
    utils/            # 共通ユーティリティ
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
| BaaS | Supabase（Auth・DB・Storage） | - |
| パッケージマネージャー | pnpm（Voltaで管理） | - |

## Supabase 接続

環境変数（`.env.local`）に以下を設定する：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Supabase クライアントは `lib/supabase/client.ts` に集約する。
RLS（Row Level Security）が全テーブルに設定されているため、`user_id = auth.uid()` 以外のデータは取得できない。

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
