# Webアプリ開発ガイド

## プロジェクト概要
- Vue 3 + Vue Router + Firebase（Auth / Firestore / Storage / Analytics）構成のチャットアプリ。
- Docker を前提としたローカル実行を想定。標準の Vue CLI コマンドで開発・ビルド・Lint が可能。

## ディレクトリ構成と意図
- `src/` : Vue コンポーネント、ビュー、ルーター、Firebase 設定などアプリ本体。
  - `views/` : 画面単位のコンポーネント（例: `ChatView.vue`, `PrivateChatView.vue`）。
  - `components/` : 再利用可能な UI/ロジックコンポーネント（例: `UserList.vue`）。
  - `router/` : ルーティング定義。
  - `firebaseConfig.js` : Firebase 初期化とエクスポート。
- `public/` : 静的ファイル。
- `scripts/` : シードや運用補助スクリプト。`seed.js` などを配置。
- `dist/` : ビルド成果物（自動生成）。

## ビルド・実行・テスト
- 依存インストール: `npm install`
- 開発サーバー: `npm run serve`
- 本番ビルド: `npm run build`
- Lint: `npm run lint`
- Firebase CLI を使う場合は `npm install -g firebase-tools` → `firebase login` → `firebase init`（必要に応じて）→ `firebase emulators:start` / `firebase deploy` などのフローを利用。
- 開発メモや作業ログは `note/` ディレクトリ（例: `note/20251122.md`）にまとめ、この場所を標準的なノート置き場とする。
- この支援環境ではユーザーの指示なくファイルを編集・変更しないこと。提案や手順を共有し、合意を得てから実装に入る。
- 本プロジェクトの開発者は Vue.js / Firebase の初学者であるため、アドバイス時は両技術の仕様に沿ったベストプラクティスを推奨すること。提案をそのまま鵜呑みにせず、批判的に検討し、適切な手法を指南する。理解や提案に筋が通っていれば積極的にフィードバック・称賛する。

## コード規約・実装方針
- Vue コンポーネントは Composition API / Options API いずれも可だが、同一ファイル内ではスタイルを統一。
- ファイル名は PascalCase（Vue コンポーネント）、kebab-case（その他 JS ファイル）を基本とする。
- Firebase 呼び出しは `src/firebaseConfig.js` からエクスポートした `db` `auth` `storage` を利用し、重複初期化を避ける。
- Firestore クエリは async/await または購読（`onSnapshot`）を使い、エラー処理とログを入れる。
- CSS は既存スタイルに合わせて Scoped を基本とする。

## テスト・検証
- 現状ユニットテストは未整備。必要に応じて Vue Test Utils + Jest などで導入。
- Firebase エミュレーターを併用するとブラウザ依存を減らし CLI での確認が容易になる。

## ナレッジ共有
- 新規スクリプトやビルド手順を追加する際は本ファイルを更新し、他の開発者が迷わないようにする。
