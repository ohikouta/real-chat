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

- [docs/project-assessment.md](./docs/project-assessment.md)
- [docs/project-retrospective.md](./docs/project-retrospective.md)
- [docs/deployment-plan.md](./docs/deployment-plan.md)
- [docs/roadmap.md](./docs/roadmap.md)
- [docs/routes.md](./docs/routes.md)
- [docs/db/firestore.md](./docs/db/firestore.md)
- [docs/emulator-acceptance.md](./docs/emulator-acceptance.md)

## 補足

- 画面上のアプリ名は `Real Chat` を使用する
- npm package 名と Docker image 名は `real-chat` 系の表記に揃える
- Firebase Emulator Suite を使った受け入れ確認は `docs/emulator-acceptance.md` を基準にする
- 初回公開前の前提整理は `docs/deployment-plan.md` と `docs/roadmap.md` を参照する
