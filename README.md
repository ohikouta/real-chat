# Real Chat

`Real Chat` は、Vue 3 と Firebase を使ったリアルタイムチャット / 相談アプリです。
現在は認証、ユーザー一覧、ダイレクトチャットを中心に実装されており、今後 `threads` ベースの相談投稿とコメント機能を追加していく前提です。

## 現在の主な機能

- Firebase Authentication を使った登録 / ログイン
- Firestore 上の `users` コレクションを使ったユーザー一覧表示
- 1対1 のダイレクトチャット
- プロフィール画面の基本表示

## 技術スタック

- Vue 3
- Vue Router
- Firebase Authentication
- Cloud Firestore
- Docker

## セットアップ

```bash
npm install
```

## 開発コマンド

### 開発サーバー

```bash
npm run serve
```

### 本番ビルド

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Firestore Rules 検証

```bash
npm run test:rules
```

## Docker で起動する場合

```bash
docker compose up --build
```

## 関連ドキュメント

- [設計・仕様ドキュメント](./docs/README.md)
- [開発・デプロイ手順](./docs/README.md#開発と運用)

### 共通 UI 部品

共通部品は shadcn-vue を使用し、`src/components/ui/` に配置します。生成設定は `components.json`、テーマは `src/styles/ui.css`、CSS のビルド設定は `postcss.config.js` で管理します。

部品を追加する場合は npm / npx を使用します。

```bash
npx shadcn-vue@2.8.2 add <部品名>
```

生成直後の部品をコミットしてから、プロジェクト向けの調整と画面への組み込みを別コミットにします。追加後は `npm run lint`、`npm run build` と、使用画面での入力・操作・表示を確認します。

既存画面への影響を抑えるため Tailwind CSS の Preflight は読み込まず、入力・ボタンの基本スタイルは `.shadcn-ui` 内に適用します。共通 CSS のユーティリティとテーマ変数はアプリ全体で読み込まれます。
