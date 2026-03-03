# カエセルくん

借金の現状を把握し、AIが支出の削減提案を行う返済管理Webアプリ。
スマホのスクリーンショットやCSVから支出・収入・借金情報を読み取り、毎月の分析レポートを生成する。

## リポジトリ構成

```
kaeseru-kun/
  CLAUDE.md          # このファイル
  docs/              # 設計ドキュメント（要件定義・DB設計・API設計など）
  frontend/          # Next.js アプリ（Vercel にデプロイ）
  backend/           # FastAPI アプリ（Railway にデプロイ）
```

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 16 / React 19 / TypeScript / Tailwind CSS v4 |
| バックエンド | Python / FastAPI |
| BaaS | Supabase（Auth・PostgreSQL・Storage） |
| AI | Gemini Vision API（画像解析）/ Claude Sonnet 4.6（分析・提案） |
| インフラ | Vercel（frontend）/ Railway（backend） |
| パッケージマネージャー | pnpm（Voltaで管理） |

## 開発コマンド

```bash
# フロントエンド
cd frontend
pnpm dev        # 開発サーバー起動（http://localhost:3000）
pnpm build      # プロダクションビルド
pnpm lint       # ESLint 実行

# バックエンド（作成後）
cd backend
python -m uvicorn main:app --reload  # 開発サーバー起動（http://localhost:8000）
```

## ライブラリインストールのルール

パッケージインストール時にバージョン互換エラーが発生した場合、**エラーを無視してインストールしてはいけない**。

禁止オプション：`--force` / `--legacy-peer-deps` / `--ignore-engines`

エラーが出たら作業を止め、以下を提示してユーザーの判断を仰ぐ：
1. エラーの内容と原因
2. 互換性のある代替バージョン（存在する場合）
3. 代替ライブラリの候補（存在する場合）

## コード品質ルール

- **エラーを握りつぶさない** — `catch` 節で握りつぶして無視しない。必ずログ出力またはユーザーへの通知を行う
- **`console.log` を残さない** — デバッグ用の `console.log` はコミット前に必ず削除する
- **未完成箇所は `TODO:` コメントを残す** — 空実装・仮実装のまま黙って進めない。`// TODO: ○○を実装する` を必ず残す

## Claudeの作業ルール

- **既存ファイルを大幅に書き換える前に確認する** — 30行以上の変更・構造の変更を伴う場合は、着手前にユーザーに変更内容を説明して承認を得る
- **指示されていない機能を勝手に追加しない** — スコープ外の機能追加・リファクタリングは行わない。提案はしてよいが、実装するかはユーザーが決める
- **作業単位は小さく保つ** — 一度に複数の機能を実装しない。1タスク1PRを意識する

## Gitルール

- **`main` への直プッシュ禁止** — 必ずブランチを切って PR 経由でマージする
- **`.env.local` / `.env` をコミットしない** — 秘匿情報を含むファイルは `.gitignore` に必ず追加する

### ブランチ命名規則

```
feature/実装した機能の内容   # 新機能追加
fix/修正した内容             # 機能改善・バグ修正
refactor/変更した内容        # ロジック変更なしの書き方変更
config/変更した内容          # 設定変更
```

例：
- `feature/login-page`
- `fix/debt-validation-error`
- `refactor/dashboard-component`
- `config/eslint-rules`

### コミットメッセージ規則

```
feat: 実装した機能     # 新機能追加
fix: 修正した内容      # 機能改善・バグ修正
refactor: 変更内容     # ロジック変更なしの書き方変更
config: 変更内容       # 設定変更
```

例：
- `feat: ログイン画面を実装`
- `fix: 借金登録のバリデーションエラーを修正`
- `refactor: ダッシュボードコンポーネントを分割`
- `config: ESLintルールを追加`

## 実装の進め方

1. **frontend** を先に完成させる。CRUDはSupabaseに直接アクセスする。
2. **backend** はGemini APIが絡む処理のみ担当する（画像解析・月次分析生成・返済シミュレーション）。
3. backendが完成したら、frontendのモック値をAPI呼び出しに差し替える。

## 設計ドキュメント

詳細は `docs/` を参照。

- `docs/design-philosophy.md` - 設計思想・ペルソナ・UX哲学・機能追加の判断基準
- `docs/tech-stack.md` - 技術スタック詳細・データフロー・スケールパス
- `docs/database-schema.md` - テーブル定義・ER図
- `docs/functional-requirements.md` - 機能要件・ユーザーストーリー・ゲーミフィケーション構想
- `docs/non-functional-requirements.md` - パフォーマンス・セキュリティ・コスト
- `docs/screen-design.md` - 画面設計・ワイヤーフレーム（SP・PC）
- `docs/api-endpoints.md` - APIエンドポイント定義
