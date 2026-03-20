# Firestore クエリ / インデックス設計

`#28 画面ごとの Firestore クエリと必要インデックスを定義する` の成果物。
この文書は、ページごとに必要な Firestore クエリとインデックスを整理し、実装前に詰まりやすい箇所を見える化することを目的とする。

## 前提

- 画面構成は [routes.md](../routes.md) を基準にする
- 画面導線とワイヤーの俯瞰は [view-wireframes.drawio](../view-wireframes.drawio) を補助資料として参照する
- データ構造は [firestore.md](./firestore.md) を基準にする
- `chatId` は `#27` で確定した長さプレフィックス方式で生成する
- 既存 `messages` の段階移行方針は `#26` で確定済み
- `users/{userId}/messages/latest` は正式保存先ではなく、必要なら後続で再設計する派生データとして扱う

## 対象ページ一覧

### 現状実装

| ページ | パス | 役割 | Firestore クエリ設計の主対象か |
|---|---|---|---|
| `Home` | `/` | 未ログイン時はランディング、ログイン時は `UserList` への入口 | いいえ |
| `Login` | `/login` | ログイン導線 | いいえ |
| `Register` | `/register` | 登録導線 | いいえ |
| `Users` | `/users` | ユーザー一覧 | はい |
| `PrivateChat` | `/chat/:userId` | 1対1チャット | はい |
| `Profile` | `/profile` | 自分のプロフィール表示 / 更新 | はい |

### 今後実装するページ

| ページ | パス | 役割 | Firestore クエリ設計の主対象か |
|---|---|---|---|
| `Timeline` | `/timeline` | スレッド一覧 | はい |
| `ThreadDetail` | `/timeline/:postId/thread` | スレッド詳細 / コメント一覧 | はい |

## ページ別サマリー

| 画面 | 主クエリ | 想定保存先 | インデックス要否 |
|---|---|---|---|
| `Home` | なし | - | 不要 |
| `Users` | `users` 一覧、必要なら最新メッセージ補助取得 | `users`, `users/{userId}/messages/latest` または後続設計 | 基本不要 |
| PrivateChat | 会話単位のメッセージ一覧、相手ユーザー取得 | `directMessages`, `users` | DM 一覧は複合インデックス候補 |
| Profile | 自分のユーザー情報取得 / 更新 | `users` | 不要 |
| Timeline | スレッド一覧 | `threads` | 単一フィールド index で足りる想定 |
| ThreadDetail | スレッド本体、コメント一覧 | `threads`, `threads/{threadId}/comments` | 基本不要 |

## クエリ設計対象ページ

この文書では、Firestore から一覧・詳細データを取得するページを主対象にする。
ログイン / 登録 / ランディングのような導線ページは対象ページ一覧には含めるが、詳細なクエリ設計の主対象からは外す。
ここでは `Users` `PrivateChat` `Profile` `Timeline` `ThreadDetail` を対象にする。

### Users

#### 目的

- ユーザー一覧を表示する
- 必要なら最新メッセージやオンライン状態を補助表示する

#### 想定クエリ

| 用途 | クエリ | インデックス |
|---|---|---|
| ユーザー一覧 | `collection("users")` | 不要 |
| ユーザー一覧の並び順を `username` にする場合 | `orderBy("username")` | 単一フィールド index で足りる想定 |
| ユーザー一覧の並び順を `createdAt` にする場合 | `orderBy("createdAt", "desc")` | 単一フィールド index で足りる想定 |

#### メモ

- ユーザー一覧に最新メッセージを表示する場合、現状の実装案ではユーザーごとに `latest` を取りにいく形になるため、件数が増えると見直しが必要になる
- 最新メッセージを表示する場合は、ひとまず表示のたびに都度クエリする前提にする
- 専用コレクションの追加は、本当にパフォーマンス上の問題が出てから検討する

### PrivateChat

#### 目的

- 1 対 1 の会話履歴を時系列で表示する
- 新規メッセージを送信する

#### 想定クエリ

| 用途 | クエリ | インデックス |
|---|---|---|
| 会話一覧取得 | `query(collection("directMessages"), where("chatId", "==", chatId), orderBy("createdAt", "asc"))` | `chatId + createdAt` の複合インデックス候補 |
| チャット相手の表示情報取得 | `getDoc(doc("users", userId))` | 不要 |

#### メモ

- `chatId` の生成規則は `#27` 依存
- 現状コードは `timestamp` を使っているが、今後は `createdAt` 前提に寄せる

### Profile

#### 想定クエリ

| 用途 | クエリ | インデックス |
|---|---|---|
| 自分のプロフィール取得 | `getDoc(doc("users", currentUserId))` | 不要 |
| プロフィール更新 | `updateDoc(doc("users", currentUserId), ...)` | 不要 |

### Timeline

#### 目的

- スレッド一覧を新着順で表示する

#### 想定クエリ

| 用途 | クエリ | インデックス |
|---|---|---|
| スレッド一覧（新着順） | `query(collection("threads"), orderBy("createdAt", "desc"))` | 単一フィールド index で足りる想定 |
| 投稿者絞り込み | `query(collection("threads"), where("authorId", "==", userId), orderBy("createdAt", "desc"))` | `authorId + createdAt` の複合インデックス候補 |
| タグ絞り込み | `query(collection("threads"), where("tags", "array-contains", tag), orderBy("createdAt", "desc"))` | `tags + createdAt` の複合インデックス候補 |

#### メモ

- 基本線は新着順表示で十分とし、更新順ソートはこの設計の主対象に含めない
- タグ絞り込みを MVP に含めるかは別途 UI 要件と合わせて確認が必要

### ThreadDetail

#### 目的

- スレッド本体と、その配下コメントを時系列で表示する

#### 想定クエリ

| 用途 | クエリ | インデックス |
|---|---|---|
| スレッド本体取得 | `getDoc(doc("threads", threadId))` | 不要 |
| コメント一覧 | `query(collection("threads", threadId, "comments"), orderBy("createdAt", "asc"))` | 不要 |

#### メモ

- スレッド配下サブコレクションの単純 `orderBy` で足りるため、現時点では複合インデックス不要

## インデックス候補一覧

### 追加候補

| コレクション | フィールド | 用途 | 依存 |
|---|---|---|---|
| `directMessages` | `chatId ASC, createdAt ASC` | PrivateChat の時系列表示 | なし |
| `directMessages` | `chatId ASC, createdAt DESC` | PrivateChat の逆順取得 | なし |
| `threads` | `authorId ASC, createdAt DESC` | 投稿者ごとのスレッド一覧 | 投稿者絞り込みを採用する場合 |
| `threads` | `tags ARRAY_CONTAINS, createdAt DESC` | タグ絞り込み + 新着順 | タグ検索を採用する場合 |

### 追加不要

| クエリ | 理由 |
|---|---|
| `users/{userId}` 単一ドキュメント取得 | ドキュメント直接参照のため |
| `users` コレクション全件取得 | 現状の単純取得では複合インデックス不要 |
| `threads/{threadId}/comments` の `orderBy("createdAt")` | サブコレクション単体の単純並び替えで足りる想定 |

## `#27` 反映事項

- `chatId` は長さプレフィックス方式を前提にする
- `directMessages` の会話一覧取得は `chatId` をキーに絞り込む前提にする
- `PrivateChat` の時系列表示は `directMessages.createdAt` を使う前提で整理する
