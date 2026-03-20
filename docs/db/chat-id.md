# chatId 仕様

`#27 DM 識別用 chatId の生成ルールと衝突回避方針を確定する` の成果物。
この文書は、1対1 DM を安定して識別するための `chatId` 生成規則と、衝突回避の前提を定義する。

## 目的

- 同じ 2 人の DM で常に同じ `chatId` を生成できるようにする
- 参加者の順序に依存しない識別子にする
- `#28` クエリ / インデックス、`#29` Rules 方針の前提にできる粒度まで整理する

## 現状

- 現行の `PrivateChatView.vue` では `generateChatId(userId1, userId2) { return [userId1, userId2].sort().join('_'); }` を使っている
- `messages` の各ドキュメントには `chatId` と `participants` が入っている
- To-Be の `directMessages` では `chatId` は必須、`participants` は現時点では必須にしない

## 採用方針

### ルール

`chatId` は「参加者 2 名の UID を昇順ソートしたうえで、長さプレフィックス付きの文字列として連結したもの」を使う。

例:

```text
dm:v1:<lenA>:<uidA>|<lenB>:<uidB>
```

### 生成手順

1. 参加者 UID 2 つを受け取る
2. 空文字や `null` / `undefined` を拒否する
3. 自分自身との DM を許可しないなら、同一 UID の組み合わせを拒否する
4. 2 つの UID を文字列として昇順ソートする
5. それぞれの UID の文字数を取得する
6. `dm:v1:<lenA>:<uidA>|<lenB>:<uidB>` の形式で結合する

### ソート順

UID の並び順は、元の UID 文字列を JavaScript の文字列比較と同じ規則で昇順に比較した結果に従う。実装上は、共有ユーティリティ内で `String(uidA) < String(uidB)` と同等の比較結果になるようにそろえる。

## 採用理由

- **順序非依存**  
  ソートしてから連結するため、送信者 / 受信者の順が逆でも同じ `chatId` になる

- **クライアント側で同期的に生成できる**  
  ハッシュ計算やサーバー発番を前提にせず、現在の実装構成でも扱いやすい

- **UID の文字種に依存しない**  
  区切り文字だけで分割せず、長さ情報で各 UID の境界を確定できるため、UID に `_` や `:` のような記号が含まれても衝突しない

- **将来の仕様変更に備えられる**  
  `dm:v1:` を付けることで、フォーマットを将来変更しても識別しやすい

## 衝突回避方針

### 想定する衝突

- 参加者順が違うだけで別 `chatId` になる
- UID の中に区切り文字相当の記号が含まれていて誤って同一視される
- 不正な入力で空の `chatId` が作られる

### 回避策

- 参加者 UID は必ず昇順ソートする
- `chatId` は必ず 2 名分の UID から導出する
- `senderId` / `receiverId` を正本参照として保持し、`chatId` は派生値として扱う
- 書き込み時は共有ユーティリティの `generateChatId(senderId, receiverId)` を必ず通して `chatId` を生成する
- 同一 UID の組み合わせを許さない場合は生成時に弾く
- UID の境界は区切り文字ではなく長さ情報で判定する

## 現行実装との関係

現行の `sort().join('_')` はシンプルだが、UID に区切り文字が含まれる場合に衝突する余地がある。そのため正式仕様では、UID の文字種前提に依存しない長さプレフィックス方式を採用する。

## 実装イメージ

```js
function generateChatId(userId1, userId2) {
  if (!userId1 || !userId2) {
    throw new Error('chatId の生成には 2 つの UID が必要です');
  }

  const [uidA, uidB] = [String(userId1), String(userId2)].sort();

  if (uidA === uidB) {
    throw new Error('同一ユーザー間の chatId は生成できません');
  }

  return `dm:v1:${uidA.length}:${uidA}|${uidB.length}:${uidB}`;
}
```

## 後続 Issue への引き継ぎ

### `#28` クエリ / インデックス

- `directMessages` は `chatId + createdAt` で取得する前提を置ける
- `chatId` は単一文字列フィールドとして `where("chatId", "==", chatId)` に使う
- 文字列長は UID 長に依存するが、長さ情報を含んでもクエリ前提は変わらない

### `#29` Rules 方針

- Rules では `senderId` / `receiverId` を正本の参加者情報として扱う
- `chatId` の妥当性を Rules で完全再計算するかどうかは `#29` で判断する
- 最低限、当事者以外が他人の組み合わせで DM を読めない前提を維持する

## 完了条件に対する自己判定

- [x] `chatId` の生成ルールを提示した
- [x] 衝突回避方針を整理した
- [x] `#28` と `#29` が参照できる前提を記述した

## 未確定事項

- Rules で `chatId` の整合性をどこまで検証するか
- 既存 `messages.chatId` は旧フォーマットのため、`#26` で新フォーマットへの変換方針を扱う
