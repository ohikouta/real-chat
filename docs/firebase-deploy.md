# Firebase Hosting デプロイ手順

## 前提

- Firebase プロジェクト: `vue-chat-c4179` を `default` alias で利用
- Spark プラン（無料枠）で運用
- `dev` / `prd` 分離は M0 時点では行わない。必要になり次第 M1 以降で追加する
- 公開 URL: `https://vue-chat-c4179.web.app`

## 初回セットアップ

### 1. Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

`firebase projects:list` で `vue-chat-c4179` が表示されれば OK。

### 2. 環境変数

`.env.sample` をコピーして `.env.local` を作成し、Firebase Console の「プロジェクト設定 → マイアプリ → 設定」から値を取得して埋める。

```bash
cp .env.sample .env.local
# エディタで各値を入力
```

### 3. authorized domains 確認

Firebase Console → Authentication → Settings → Authorized domains に以下が含まれていることを確認する（未登録なら追加）:

- `vue-chat-c4179.web.app`
- `vue-chat-c4179.firebaseapp.com`
- 開発用 `localhost`

## デプロイ

### Hosting

```bash
npm install       # 初回のみ
npm run deploy    # build + firebase deploy --only hosting --project default
```

`npm run deploy` は内部で `npm run build` と `firebase deploy --only hosting --project default` を順に実行する。`--project default` で `.firebaserc` の `default` alias を強制し、別 project への誤デプロイを防ぐ。

完了後、`https://vue-chat-c4179.web.app` でアクセス確認。

### Firestore Rules

```bash
firebase deploy --only firestore:rules --project default
```

## 動作確認チェックリスト

- [ ] 公開 URL にアクセスできる
- [ ] Google / GitHub ログインが通る
- [ ] スレッドの投稿・閲覧ができる
- [ ] DM の送受信ができる
- [ ] プロフィールの表示・編集ができる
- [ ] 2 アカウント間で Rules が正しく働く（他人の DM を読めない等）

## ロールバック

Firebase Console → Hosting → リリース履歴 から該当バージョンを選択して「ロールバック」。

## 環境変数一覧

`.env.sample` 参照。全て `VUE_APP_FIREBASE_*` 接頭辞。

| キー | 用途 |
|---|---|
| `VUE_APP_FIREBASE_API_KEY` | Web API キー |
| `VUE_APP_FIREBASE_AUTH_DOMAIN` | 認証ドメイン |
| `VUE_APP_FIREBASE_PROJECT_ID` | プロジェクト ID (`vue-chat-c4179`) |
| `VUE_APP_FIREBASE_STORAGE_BUCKET` | Storage バケット |
| `VUE_APP_FIREBASE_MESSAGING_SENDER_ID` | FCM 送信者 ID |
| `VUE_APP_FIREBASE_APP_ID` | アプリ ID |
| `VUE_APP_FIREBASE_MEASUREMENT_ID` | Analytics ID |

## トラブルシュート

- **`auth/unauthorized-domain`**: authorized domains に公開ドメインを追加していない
- **実行時 Firebase 初期化エラー**: `.env.local` の値が空。build は通るが起動時に落ちるため公開前に必ず値を埋める
