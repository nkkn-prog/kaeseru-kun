# backend（カエセルくん）

Python / FastAPI で構築するバックエンド。
AI処理（スクショ解析・月次分析・返済シミュレーション）のみを担当する。
CRUDはフロントエンドから Supabase に直接アクセスするため、backend は扱わない。

## ディレクトリ構成（予定）

```
backend/
  main.py                  # FastAPI エントリーポイント
  routers/
    uploads.py             # スクショ・CSV アップロード → Gemini Vision 解析
    analyses.py            # 月次分析・削減提案生成（Claude Sonnet 4.6）
  services/
    gemini.py              # Gemini Vision API クライアント
    claude.py              # Claude Sonnet 4.6 API クライアント
    supabase.py            # Supabase クライアント（service_role_key を使用）
  models/
    request.py             # リクエスト型定義（Pydantic）
    response.py            # レスポンス型定義（Pydantic）
  .env                     # 環境変数（コミット禁止）
  requirements.txt         # 依存パッケージ
  Dockerfile               # Railway デプロイ用
```

## 開発コマンド

```bash
# 仮想環境のセットアップ
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 依存パッケージのインストール
pip install -r requirements.txt

# 開発サーバー起動（http://localhost:8000）
uvicorn main:app --reload

# API ドキュメント確認
open http://localhost:8000/docs   # Swagger UI
```

## Docker 方針

**ローカル開発では Docker を使わない。** venv + `uvicorn --reload` で十分。

**本番（Railway）デプロイのみ `Dockerfile` を使う。**
Railway は `Dockerfile` が存在する場合、それを使ってビルド・起動する。

```dockerfile
# Dockerfile（例）
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

docker-compose は作成しない。frontend は Vercel にデプロイするため、backend との docker-compose 連携は不要。

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | FastAPI |
| 言語 | Python 3.12 |
| バリデーション | Pydantic v2 |
| AI（画像解析） | Gemini Vision API（google-generativeai） |
| AI（分析・提案） | Claude Sonnet 4.6（anthropic SDK） |
| BaaS | Supabase（supabase-py・service_role_key を使用） |
| ホスティング | Railway |

## 環境変数

`.env` に以下を設定する（`.gitignore` に必ず追加）：

```env
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # 秘匿キー。フロントには渡さない
```

## API エンドポイント

backend が担当するエンドポイントのみ記載。詳細は `../docs/api-endpoints.md` を参照。

| メソッド | パス | 処理 |
|---------|------|------|
| POST | `/uploads/screenshot` | スクショを Gemini Vision で解析し、構造化データを返す |
| POST | `/uploads/csv` | CSV をパースし、列マッピング候補を返す |
| POST | `/analyses/generate` | 月次データを Claude Sonnet 4.6 で分析し、提案を返す |
| GET | `/analyses/{year}/{month}` | 保存済みの月次分析を取得する |

## 認証

- フロントエンドから送られる Supabase JWT を `Authorization: Bearer <token>` で受け取り検証する
- `supabase-py` の `auth.get_user(token)` でユーザーを特定する
- 認証に失敗した場合は 401 を返す

## コード品質ルール

- **型ヒントを必ずつける** — 関数の引数・戻り値すべてに型ヒントを明記する
- **Pydantic モデルを使う** — リクエスト・レスポンスの型定義は必ず Pydantic で行う。`dict` を生で返さない
- **エラーを握りつぶさない** — `except` で握りつぶして無視しない。必ず `HTTPException` またはログ出力を行う
- **未完成箇所は `TODO:` コメントを残す** — 空実装・仮実装のまま黙って進めない
- **`print()` を残さない** — デバッグ用の `print()` はコミット前に削除する。ログは `logging` モジュールを使う

## ライブラリインストールのルール

パッケージインストール時にバージョン互換エラーが発生した場合、**エラーを無視してインストールしてはいけない**。

禁止オプション：`--ignore-requires-python` / `--force-reinstall`（互換性を無視した形での使用）

エラーが出たら作業を止め、以下を提示してユーザーの判断を仰ぐ：
1. エラーの内容と原因
2. 互換性のある代替バージョン（存在する場合）
3. 代替ライブラリの候補（存在する場合）
