# Deployment Plan

この文書は、`Real Chat` を「ローカル学習用」から「一度公開して触れる状態」へ進めるための最低限のデプロイ計画を整理するものです。

## 目的

- 初回デプロイの前提を明確にする
- 公開前に最低限確認すべき項目を揃える
- 公開後の確認ポイントを簡単に見返せるようにする

## 方針

第一段階では、複雑な運用や多環境展開ではなく、次の状態を目標にする。

- 1 つの本番 URL でアプリを公開できる
- 認証、ユーザー一覧、DM、スレッド、プロフィールが最低限動く
- README と docs から、起動方法と公開前提が分かる

## デプロイ前提

### 必須

- Firebase プロジェクトを用意する
- 本番用の Firebase Web App 設定値を揃える
- Hosting 側で SPA rewrite を有効にする
- Firebase Authentication の authorized domain を公開 URL に合わせる

### ローカルで先に揃えるもの

- `.env.local` に開発用 Firebase 設定が入っていること
- `npm run build` が通ること
- `npm run lint` が通ること
- 必要なら `npm run test:rules` が通ること

## デプロイ候補の考え方

現時点では Firebase を中心に構成しているため、初回公開は Firebase Hosting を第一候補として扱うのが自然です。

理由:

- Firebase Auth / Firestore / Storage との相性がよい
- SPA の静的配信と rewrite 設定を 1 箇所で扱いやすい
- 学習コストを増やしすぎずに初回公開まで持っていきやすい

ただし、この文書では料金や最新制限値は固定しません。公開直前に公式情報を再確認する前提とします。

## 公開前チェックリスト

### アプリ

- `npm run build` が成功する
- ローカルで白画面や致命的 Console error がない
- 未認証 / 認証済みの導線が破綻しない
- 主要画面で Firebase 初期化エラーが出ない

### 設定

- Firebase Web App の env が本番向けに設定されている
- `firebase.json` の Hosting 設定が SPA に合っている
- 必要な Firestore indexes と Rules が反映済みである
- authorized domains に公開 URL が入っている

### ドキュメント

- README から起動方法と関連 docs が分かる
- deploy 手順が最低限書かれている
- 公開後に確認する画面が整理されている

## 初回デプロイ時の確認観点

- `/`
  - 未認証時の初期表示
- `/login` `/register`
  - 認証導線
- `/users`
  - ログイン後のユーザー一覧表示
- `/chat/:userId`
  - DM の送受信
- `/timeline`
  - スレッド一覧と投稿
- `/timeline/:postId/thread`
  - コメント表示と投稿
- `/profile`
  - プロフィール表示と更新

## 初回デプロイ後の改善候補

- bundle size warning の解消
- 画像アセットの軽量化
- deploy 手順の自動化
- 受け入れ確認の半自動化
- 本番用の監視 / 運用メモ整備

## 次のアクション

1. 初回デプロイ用の GitHub Issue を作る
2. README と deploy 手順を連動させる
3. Firebase Hosting 前提で公開作業を進める
