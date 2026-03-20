# Firestore 権限方針

`#29 コレクションごとの read/write 権限方針を整理する` のドラフト。
この文書は Firestore Security Rules を実装する前提として、`users` / `threads` / `threads/{threadId}/comments` / `directMessages` の read/write 方針を整理する。

## 目的

- コレクションごとの read / write 権限の基準を明文化する
- Rules 実装時に迷わない状態を作る
- `#26` `#27` の未確定事項と切り分ける

## 前提

- 認証は Firebase Auth を使う
- 現行ルーターでは `/users` `/profile` `/chat/:userId` は認証必須
- `users` にはプロフィール、表示名、オンライン状態を保持する
- `threads` / `threads/{threadId}/comments` / `directMessages` は今後の正式保存先とする

## 基本原則

- 認証必須のデータは、原則として未認証ユーザーに公開しない
- 他人のデータ更新は、明示的な理由がない限り許可しない
- 書き込み権限は「自分が作成者か」「DM の当事者か」で絞る
- UI の制御だけでなく Firestore Rules 側でも最終的に制約する

## 権限マトリクス

| コレクション | read | create | update | delete |
|---|---|---|---|---|
| `users/{userId}` | 認証ユーザーのみ | 本人のみ | 本人のみ | 当面は許可しない |
| `threads/{threadId}` | 認証ユーザーのみ | 認証ユーザー本人 | 原則作成者本人のみ | 原則作成者本人のみ |
| `threads/{threadId}/comments/{commentId}` | 認証ユーザーのみ | 認証ユーザー本人 | 原則作成者本人のみ | 原則作成者本人のみ |
| `directMessages/{messageId}` | 当事者のみ | 送信者本人のみ | 当面は許可しない | 当面は許可しない |

## コレクション別方針

### `users/{userId}`

#### read

- 認証済みユーザーのみ許可する
- 理由:
  - ユーザー一覧、DM 相手表示、プロフィール表示はログイン後の機能として使っている
  - 現時点で未認証ユーザーへプロフィールを公開する要件はない

#### create

- Auth の `uid` と一致する本人だけ許可する
- 新規登録時に `users/{user.uid}` を作る前提と整合する

#### update

- 本人だけ許可する
- 想定する更新対象:
  - `username`
  - `profileImageUrl`
  - `updatedAt`
- 他人のプロフィールを書き換えられないようにする
- `isOnline` はユーザーが任意に切り替える前提ではなく、ログイン状態や接続状態に応じてシステム管理するフィールドとして扱う
- オンライン状態の表示可否をユーザー設定として持たせたい場合は、`isOnline` とは別の設定フィールドとして分離する

#### delete

- 現時点では許可しない前提にする
- 退会要件は未整理のため、後続 Issue が必要

### `threads/{threadId}`

#### read

- 認証済みユーザーのみ許可する
- 理由:
  - 現時点ではアプリ全体が認証後の利用を前提にしている
  - 相談一覧や詳細を一般公開する要件はまだない

#### create

- 認証済みユーザー本人のみ許可する
- `authorId` は Auth の `uid` と一致している必要がある

#### update

- 原則、作成者本人のみ許可する
- 想定する更新:
  - 本文編集
  - タグ編集
  - `updatedAt`
- `commentCount` / `lastCommentAt` のような派生フィールドは、この Issue では必須前提にしない
- コメント件数や最終コメント時刻は、必要に応じて `threads/{threadId}/comments` から取得する前提を基本とする
- もし一覧表示の都合で派生フィールドを持たせる場合は、更新責務を別途明確にしてから Rules に落とす

#### delete

- 原則、作成者本人のみ許可する
- 管理者権限は現時点では未定義

### `threads/{threadId}/comments/{commentId}`

#### read

- 認証済みユーザーのみ許可する
- 親スレッド詳細の一部として閲覧する前提

#### create

- 認証済みユーザー本人のみ許可する
- `authorId` は Auth の `uid` と一致している必要がある

#### update

- 原則、コメント作成者本人のみ許可する
- `body` と `updatedAt` の更新を想定する

#### delete

- 原則、コメント作成者本人のみ許可する
- スレッド作成者にコメント削除権限を持たせるかは未定で、必要なら後続 Issue で扱う

### `directMessages/{messageId}`

#### read

- `senderId` または `receiverId` の当事者だけ許可する
- 第三者が DM を読めないことを最優先にする

#### create

- 認証済みユーザー本人のみ許可する
- `senderId` は Auth の `uid` と一致している必要がある
- `receiverId` は自分以外の認証済みユーザーを想定する
- `chatId` は `senderId` / `receiverId` から共有ユーティリティで生成した値を使う前提にする

#### update

- 現時点では許可しない前提にする
- DM 本文の編集要件は未整理で、MVP では不要

#### delete

- 現時点では許可しない前提にする
- 送信取り消しや論理削除をやるなら、別途要件整理が必要

## Rules 実装時の注意点

- `request.auth != null` の確認を全 protected collection で徹底する
- `authorId` / `senderId` と `request.auth.uid` の一致を必ず見る
- 更新時に変更可能なフィールドを絞る
- `threads` に派生フィールドを持たせる場合は、コメント追加時の更新手段を決めてから Rules に落とす

## 未確定事項

### `#26` 依存

- 既存 `messages` をどう扱うか
- `users/{userId}/messages/latest` を残すか再設計するか
- 移行期間中に `messages` の read / write をどう制限するか

### `#27` 反映事項 / 残課題

- `chatId` は長さプレフィックス方式 `dm:v1:<lenA>:<uidA>|<lenB>:<uidB>` を前提にする
- `senderId` / `receiverId` を正本の参加者情報とし、`chatId` は共有ユーティリティで生成する派生値として扱う
- `chatId` の妥当性を Rules で完全再計算するか、最低限の整合性確認にとどめるかは実装時に判断する

## いま決めたこと / まだ決めないこと

### この Issue で決めること

- 各コレクションの read / create / update / delete の原則
- 誰がどのデータにアクセスできるかの整理
- Rules 実装時に見るべき観点

### この Issue でまだ決めないこと

- `messages` の移行手順や併用方針
- 実際の `firestore.rules` コード
- 管理者権限や通報 / モデレーション要件

## 完了条件に対する自己点検

- [x] コレクションごとの read/write 権限方針を整理した
- [x] スレッド、コメント、DM それぞれの権限制御を整理した
- [x] Rules 実装時の前提と未確定事項を明記した
