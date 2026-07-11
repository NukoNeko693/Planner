# セルマネ

学校向け予定表Webアプリです。Next.js App Router、TypeScript、PostgreSQL、Prismaで構築します。

## ローカル開発

初回は次の順番で実行します。

```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

- `cp .env.example .env`: 開発用の環境変数ファイルを作成します。必要に応じて接続情報や秘密鍵を変更してください。
- `npm install`: `package.json`に記載された依存パッケージをインストールします。初回や依存関係更新後に実行します。
- `docker compose up -d`: PostgreSQLをバックグラウンドで起動します。古いDocker Compose環境では`docker-compose up -d`を使用してください。
- `npm run db:migrate`: Prismaスキーマの変更から開発用migrationを作成し、DBへ適用します。スキーマを変更した開発時に使用します。
- `npm run db:seed`: Ryosuke、Teu、Somaの開発用ユーザーを投入します。upsert方式なので再実行できます。
- `npm run dev`: Next.js開発サーバーを起動します。起動後に http://localhost:3000 を開いてください。

PostgreSQLを停止する場合は次を実行します。DBデータはDocker volumeに残ります。

```bash
docker compose down
```

古いDocker Compose環境では`docker-compose down`を使用してください。

## npmコマンド

| コマンド               | 説明                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `npm run dev`          | ホットリロード付きの開発サーバーを起動します。                      |
| `npm run build`        | Webpackを使用して本番用アプリをビルドします。型検査も実行されます。 |
| `npm run start`        | `npm run build`で作成した本番用アプリを起動します。                 |
| `npm run lint`         | ESLintでコード上の問題を検査します。警告も失敗として扱います。      |
| `npm run typecheck`    | ファイルを生成せず、TypeScriptの型だけを検査します。                |
| `npm run format`       | Prettierで対応ファイルを自動整形します。                            |
| `npm run format:check` | ファイルを変更せず、Prettierの整形漏れを検査します。                |
| `npm run db:generate`  | Prismaスキーマから型安全なPrisma Clientを生成します。               |
| `npm run db:migrate`   | 開発用migrationを作成・適用し、Prisma Clientも更新します。          |
| `npm run db:deploy`    | 作成済みmigrationだけをDBへ適用します。本番・ステージング用です。   |
| `npm run db:seed`      | 開発用の初期ユーザーをDBへ投入します。本番では実行しません。        |

## 品質確認

変更を完了する前に、次のコマンドを順番に実行してください。

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

自動整形が必要な場合は、`npm run format`を実行してから再度確認します。

## 開発用ログイン

Auth.jsのJWTセッションを使用し、ユーザーと予定はPostgreSQLに保存します。

| ユーザー名 | パスワード |
| ---------- | ---------- |
| Ryosuke    | 0302       |
| Teu        | 0911       |
| Soma       | 0805       |

パスワードはscryptハッシュとして保存します。初期パスワードは開発用seed専用で、本番運用前に変更またはGoogleログインへ移行してください。

## 本番デプロイ

本番用の`DATABASE_URL`と十分に長い`AUTH_SECRET`を設定し、リリース時に`npm run db:deploy`を実行します。seedには開発用パスワードが含まれるため、本番環境では実行しません。PostgreSQL接続にはPrisma公式のdriver adapterを利用しています。

一般的な本番リリース順序は次のとおりです。

```bash
npm ci
npm run db:generate
npm run db:deploy
npm run build
npm run start
```

- `npm ci`: `package-lock.json`どおりに依存関係を再現可能な形でインストールします。
- `npm run db:generate`: デプロイ環境でPrisma Clientを生成します。
- `npm run db:deploy`: リポジトリに含まれるmigrationを本番DBへ適用します。開発用migrationの新規作成は行いません。
- `npm run build`: 本番用成果物を作成します。
- `npm run start`: 本番サーバーを起動します。実際の運用ではプロセスマネージャーやコンテナから実行してください。

Googleログインを利用する場合は、Google Cloud側のOAuthクライアントに
`http://localhost:3000/api/auth/callback/google`をリダイレクトURIとして登録し、
`.env`へ`AUTH_GOOGLE_ID`と`AUTH_GOOGLE_SECRET`を設定します。
