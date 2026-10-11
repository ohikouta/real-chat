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
