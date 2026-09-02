# プランナー

学校向け予定表Webアプリです。Next.js App Router、TypeScript、PostgreSQL、Prismaで構築します。

## 開発環境

このプロジェクトは、Next.js 16、TypeScript、Prisma 7、PostgreSQL 17を使用します。PostgreSQLはDockerコンテナで起動するため、PCへ直接インストールする必要はありません。

### 必要なソフトウェア

開発を始める前に、次のソフトウェアをインストールしてください。

| ソフトウェア | 推奨・確認事項                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------- |
| Git          | GitHubからソースコードを取得するために使用します。WindowsではGit Bashも一緒にインストールされます。 |
| Node.js      | Node.js 20.9以上（LTS推奨）。npmはNode.jsに同梱されています。                                       |
| Docker       | PostgreSQL 17の起動に使用します。Docker Compose v2を利用できる環境が必要です。                      |
| エディター   | 任意のエディターを利用できます。Visual Studio Codeなどが便利です。                                  |

インストール後、ターミナルで次のコマンドを実行し、バージョン番号が表示されることを確認します。

```bash
git --version
node --version
npm --version
docker --version
docker compose version
```

`node --version`が`v20.9.0`以上であることを確認してください。コマンドが見つからない場合は、インストール後にターミナルを開き直してください。

WindowsではDocker Desktop、macOSではDocker Desktopまたは互換環境、LinuxではDocker EngineとDocker Composeプラグインを利用できます。WindowsでDocker Desktopを使用する場合は、WSL 2や仮想化機能の有効化を求められることがあります。

### 初回セットアップ

作業ファイルを保存したいディレクトリへ移動し、GitHubからリポジトリをcloneします。

```bash
git clone https://github.com/NukoNeko693/Planner.git
cd Planner
```

次に、開発用の環境変数ファイルを作成します。

```bash
cp .env.example .env
```

PowerShellを使用する場合、上の`cp`の代わりに次を実行します。

```powershell
Copy-Item .env.example .env
```

`.env`にはローカルDBの接続先と認証用の秘密情報が入ります。このファイルはGitの管理対象外です。通常のローカル開発では`.env.example`のDB設定をそのまま利用できますが、`AUTH_SECRET`は推測されにくい32文字以上の値へ変更してください。`.env`を公開したり、Gitへcommitしたりしないでください。

続いて、依存パッケージをlockファイルどおりにインストールします。

```bash
npm ci
```

Dockerを起動し、Docker Engineが利用できる状態になってからPostgreSQLを起動します。

```bash
npm run db:up
npm run db:status
```

`db:status`の結果で`postgres`が`running`または`healthy`になったら、既存のmigrationをDBへ適用し、開発用データを登録します。

```bash
npm run db:deploy
npm run db:seed
```

最後に開発サーバーを起動します。

```bash
npm run dev
```

ターミナルに起動完了が表示されたら、ブラウザーで <http://localhost:3000> を開きます。開発サーバーの実行中はそのターミナルを閉じないでください。停止するときはターミナルで`Ctrl+C`を押します。

### 2回目以降の開始と終了

PCを再起動した後など、通常はプロジェクトのフォルダーで次のコマンドだけ実行すれば開発を再開できます。

```bash
cd Planner
npm run db:up
npm run dev
```

作業を終えるときは、`Ctrl+C`で開発サーバーを止めた後、次のコマンドでPostgreSQLを停止します。

```bash
npm run db:down
```

DBデータはDocker volumeに保存されるため、`db:down`を実行しても次回起動時に引き継がれます。

リモートリポジトリの変更を取り込む場合は、未commitの変更がないことを`git status`で確認してから実行します。

```bash
git pull
npm ci
npm run db:up
npm run db:deploy
npm run dev
```

`package-lock.json`に変更がなければ`npm ci`は省略できます。新しいmigrationがなければ`npm run db:deploy`もすぐに完了します。

### DBスキーマを変更するとき

既存のmigrationを適用するだけなら`npm run db:deploy`を使用します。`prisma/schema.prisma`を自分で変更し、新しいmigrationを作成するときだけ、内容を表す名前を付けて次を実行します。

```bash
npm run db:migrate -- --name add_example_field
```

作成された`prisma/migrations`内のファイルと`prisma/schema.prisma`を一緒にcommitしてください。

### 開発用DBを完全に作り直す場合

通常、この操作は不要です。DBの内容をすべて消して初期状態へ戻す必要がある場合は、停止後にDocker volumeを削除し、作り直します。ローカルの予定やユーザーなどもすべて削除されます。

```bash
docker compose down -v
npm run db:up
npm run db:deploy
npm run db:seed
```

### よくある問題

- `docker compose`が見つからない: Docker Compose v2がインストールされているか確認し、ターミナルを開き直してください。古い環境では`docker-compose`コマンドの場合があります。
- Dockerへ接続できない: Docker DesktopまたはDocker Engineを起動し、準備が完了するまで待ってください。WindowsではWSL 2や仮想化機能の設定が必要な場合があります。
- ポート`5432`が使用中: PC上の別のPostgreSQLまたはコンテナを停止してください。停止できない場合は、`docker-compose.yml`と`.env`のポート設定を同じ値へ変更します。
- ポート`3000`が使用中: Next.jsが別のポートを提案した場合は、ターミナルに表示されたURLを開いてください。前回の開発サーバーが残っていないかも確認します。
- `npm ci`が通信エラーになる: ネットワーク接続を確認してください。プロキシ環境では、利用しているネットワークの案内に従ってGitやnpmのプロキシを設定する必要があります。
- PrismaがDBへ接続できない: `npm run db:status`でPostgreSQLの状態を確認し、`.env`の`DATABASE_URL`が`.env.example`と同じ形式か確認してください。
- 画面や型が古いように見える: 開発サーバーを停止して`npm ci`と`npm run db:generate`を実行し、再起動してください。

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

教師アカウントは末尾`T`、管理者アカウントは末尾`O`です。パスワードは元アカウントと同じです。

| 権限   | Ryosuke系 | Teu系 | Soma系 |
| ------ | --------- | ----- | ------ |
| 学生   | Ryosuke   | Teu   | Soma   |
| 教師   | RyosukeT  | TeuT  | SomaT  |
| 管理者 | RyosukeO  | TeuO  | SomaO  |

所属クラスは、Ryosuke系とTeu系が`1年A組`、Soma系が`1年B組`です。クラス予定は同じ所属クラスのアカウントにだけ表示されます。

学生は個人予定と所属クラス予定を作成できます。クラス予定の削除は同じクラスの教師だけが実行できます。クラスへのメンバー追加は教師または管理者だけが実行できます。これらの制限は画面だけでなくServer Actionでも検証します。

学校全体予定はすべてのログインユーザーが閲覧できますが、作成・編集・削除は管理者だけが実行できます。

管理者はホームルームクラスを作成し、学生と教師を別のホームルームクラスへ移動できます。管理者アカウント自身は移動処理の対象外です。

管理者画面では、ホームルームクラスと選択授業を別セクションで表示します。学生の所属変更先に指定できるのはホームルームクラスだけで、選択授業への参加は専用のメンバーシップとして管理します。

管理者画面のURLは`/users/{ユーザー名}/admin/classes`です。旧URLの`/admin/classes`へアクセスした場合は、ログイン中のユーザー名を含むURLへ自動転送します。

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
