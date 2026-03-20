# Emulator Acceptance

`#30 エミュレータ前提の最低限の受け入れシナリオを定義する` のドラフト。
この文書は、Firebase Emulator Suite を使って最低限確認したい受け入れ観点を整理し、実装後の手戻りを減らすための基準とする。

## 目的

- 実装後に最低限どこを確認すべきかを明確にする
- 認証、Firestore、画面遷移、DM の基本動作をエミュレータ上で再現できるようにする
- 今後追加する `threads` / `comments` / `directMessages` 実装の検証観点も先に揃える

## 前提

- Firebase Authentication Emulator を使用する
- Firestore Emulator を使用する
- 必要に応じて Storage Emulator を使うが、この文書の最低ラインには含めない
- テスト用ユーザーは少なくとも 2 名用意する
- 現状実装では DM は `messages` を使っているが、今後の正式保存先は `directMessages` を想定する

## 最低限の受け入れシナリオ

### 1. 未認証ユーザーの画面導線

- `/` に未認証でアクセスすると、Home が表示される
- `/users` に未認証でアクセスすると `/login` にリダイレクトされる
- `/profile` に未認証でアクセスすると `/login` にリダイレクトされる
- `/chat/:userId` に未認証でアクセスすると `/login` にリダイレクトされる

確認観点:
- ルーターガードが意図どおり動く
- 認証必須画面が未認証で見えない

### 2. 新規登録

- 未登録メールアドレスで登録できる
- 登録後に `users/{userId}` が作成される
- `users/{userId}` に `username`, `email`, `createdAt` が保存される
- 登録後にホームへ遷移できる

確認観点:
- Auth と Firestore の両方が更新される
- Firestore 側にプロフィール初期データが欠けずに保存される

### 3. ログイン / ログアウト相当の状態変化

- 登録済みユーザーでログインできる
- ログイン後に `users/{userId}.isOnline` が `true` になる
- ログアウト操作後に `users/{userId}.isOnline` が `false` になる
- ログイン済みで `/login` または `/register` にアクセスすると `/` に戻る

確認観点:
- Auth 状態と Firestore の `isOnline` 表示が矛盾しない
- 認証済みユーザーの導線が破綻しない

### 4. ユーザー一覧

- ログイン後に `/users` でユーザー一覧を取得できる
- 各ユーザーの `username`, `email`, `profileImageUrl`, `isOnline` が表示できる
- 一覧から他ユーザーの DM 画面へ遷移できる

確認観点:
- `users` コレクションの取得が画面表示に十分か
- ルート遷移パラメータ `userId` が正しく渡るか

### 5. 1対1 DM の送受信

- 2 人のテストユーザー間で DM を送信できる
- 送信したメッセージがリアルタイムで表示される
- 送信データに `senderId`, `receiverId`, `senderName`, `chatId`, `timestamp` 相当の情報が保存される
- 同一 `chatId` の会話だけが時系列で取得される

確認観点:
- Firestore 書き込みと購読が正常に動く
- 会話が他ユーザーの DM と混ざらない
- 表示上で自分 / 相手のメッセージが判別できる

### 6. プロフィール画面

- ログイン済みで `/profile` にアクセスできる
- ログイン中ユーザーの基本情報が表示される
- 未認証では `/profile` へ入れない

確認観点:
- ルーターガードと表示状態が矛盾しない

## 今後の実装を見据えた受け入れシナリオ

### 7. スレッド投稿 (`threads`)

- 認証済みユーザーが `threads` に投稿を作成できる
- `title`, `body`, `authorId`, `authorName`, `createdAt`, `updatedAt` が保存される
- 一覧画面で新しい順にスレッドを表示できる

確認観点:
- スレッド投稿に必要な必須フィールドが欠けない
- 一覧取得で並び順が破綻しない

### 8. スレッドコメント (`threads/{threadId}/comments`)

- 認証済みユーザーがスレッドへコメントできる
- `body`, `authorId`, `authorName`, `createdAt`, `updatedAt` が保存される
- コメントが対象スレッド配下で時系列表示される
- コメント追加時に `threads.commentCount` と `threads.lastCommentAt` が意図どおり更新される

確認観点:
- サブコレクションの配置方針どおりに保存される
- 集計フィールドと実データが大きくずれない

### 9. 新しい DM 保存先 (`directMessages`)

- 実装切り替え後、DM が `directMessages` に保存される
- `chatId`, `senderId`, `senderName`, `receiverId`, `text`, `createdAt` が保存される
- `messages` からの移行方針とロールバック条件どおりに動く

確認観点:
- `#26` の移行方針と実装結果が一致する
- `#27` の `chatId` 仕様どおりに会話識別できる

## 実装後に確認すべきチェックリスト

- 認証ガードが未認証 / 認証済みの両方で意図どおり動く
- 登録 / ログイン / ログアウトが Firestore 側のユーザー状態と一致する
- DM の保存先、表示順、相手識別が破綻しない
- 今後の `threads` / `comments` / `directMessages` 実装が `docs/db/firestore.md` と一致する
- エラー時に画面が無限読込やクラッシュ状態にならない

## この文書だけでは未確定のこと

- Firestore Security Rules の最終仕様
- 必要な複合インデックスの確定版
- Emulator Suite の seed データ投入手順
