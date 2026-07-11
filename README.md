# セルマネ

学校向け予定表Webアプリです。Next.js App Router、TypeScript、PostgreSQL、Prismaで構築します。

## ローカル開発

初回は次の順番で実行します。

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

- `cp .env.example .env`: 開発用の環境変数ファイルを作成します。必要に応じて接続情報や秘密鍵を変更してください。
- `npm install`: `package.json`に記載された依存パッケージをインストールします。初回や依存関係更新後に実行します。
- `npm run db:up`: Docker ComposeでPostgreSQLをバックグラウンド起動します。
- `npm run db:migrate`: Prismaスキーマの変更から開発用migrationを作成し、DBへ適用します。スキーマを変更した開発時に使用します。
- `npm run db:seed`: Ryosuke、Teu、Somaの開発用ユーザーを投入します。upsert方式なので再実行できます。
- `npm run dev`: Next.js開発サーバーを起動します。起動後に http://localhost:3000 を開いてください。

### 2回目以降の起動

初回セットアップが完了していれば、通常は次の2コマンドだけで起動できます。

```bash
npm run db:up
npm run dev
```

PostgreSQLのデータはDocker volumeに保存されているため、`db:migrate`や`db:seed`を起動のたびに実行する必要はありません。

リポジトリを更新した後など、新しいmigrationや依存関係が追加されている場合は次を実行します。

```bash
npm install
npm run db:up
npm run db:deploy
npm run db:generate
npm run dev
```

- `npm install`: 新しく追加・更新された依存パッケージを反映します。
- `npm run db:deploy`: リポジトリに追加されたmigrationを既存のローカルDBへ適用します。保存済みデータは維持されます。
- `npm run db:generate`: 更新されたPrismaスキーマに対応するPrisma Clientを生成します。

`npm run db:seed`は、初期ユーザーが存在しない場合や初期データを意図的に更新したい場合だけ再実行してください。

PostgreSQLを停止する場合は次を実行します。DBデータはDocker volumeに残ります。

```bash
npm run db:down
```

PostgreSQLが正常に起動しているか確認する場合は`npm run db:status`を実行してください。

> このプロジェクトの実行環境ではDocker Compose v1を使用するため、内部的には`docker-compose`コマンドを呼び出します。`docker compose up -d`で`unknown shorthand flag: 'd'`と表示される場合も、`npm run db:up`を使用してください。

### Docker・DB接続エラー

- `unknown shorthand flag: 'd' in -d`: `docker compose`が利用できない環境です。`npm run db:up`を実行してください。
- `Error while fetching server API version`またはDocker socketの`FileNotFoundError`: Docker daemonが起動していません。Docker Desktopを起動するか、Linuxでは`sudo systemctl start docker`でDockerサービスを起動してから`npm run db:up`を再実行してください。
- Prismaの`P1001`または`Can't reach database server at 127.0.0.1:5432`: PostgreSQLコンテナが起動していません。`npm run db:up`の後に`npm run db:status`で状態を確認してください。

DBがまだ初期化されていない場合は、PostgreSQL起動後に次を1回実行します。

```bash
npm run db:migrate
npm run db:seed
```

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
| `npm run db:up`        | Docker ComposeでPostgreSQLをバックグラウンド起動します。            |
| `npm run db:down`      | PostgreSQLコンテナを停止します。DBのvolumeは削除しません。          |
| `npm run db:status`    | PostgreSQLコンテナの起動状態を表示します。                          |
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
