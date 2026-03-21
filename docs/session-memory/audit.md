# Project Audit Log

## 2026-03-21T14:07:45Z

- PR `#53` の merge を取り込み、`issue-41-thread-detail` worktree を `origin/main` 最新へ更新
- `#41` の実装として `src/views/ThreadDetailView.vue` を追加し、スレッド詳細・コメント一覧・コメント投稿フォームを実装
- `src/router/index.js` に `/timeline/:postId/thread` ルートを追加し、`src/views/TimelineView.vue` から詳細導線を追加
- `docs/routes.md` を `ThreadDetail` 実装後の状態へ更新
- `npm run lint` は成功、`npm run build` は bundle size warning のみで成功

## 2026-03-21T00:27:14Z

- `#52` の merge を取り込み、`issue-40-threads` worktree を `origin/main` 最新へ更新
- `#40` の実装として `src/views/TimelineView.vue` を追加し、`threads` 投稿フォームと新着一覧を実装
- `src/router/index.js` に `/timeline` ルート、`src/components/Header.vue` に `Timeline` 導線を追加
- `docs/routes.md` を `/timeline` 実装後の状態へ更新
- build を妨げていた `src/assets/sample_chat.png` 欠落を解消
- `npm run lint` は成功、`npm run build` は bundle size warning のみで成功

## 2026-03-08T04:03:59Z

- セッション継続用の記録機構を導入
- `current.md` ベースではなく markdown 直接更新運用へ切り替え

## 2026-03-08T04:27:00Z

- `current.md` を廃止し、`audit.md` を最新監査ログの起点に変更
- Obsidian の `vue-chat` タスクカード内の Issue 表記を GitHub リンク形式へ統一

## 2026-03-08T04:39:00Z

- `#25` レビューで合意した設計判断を `docs/db/firestore.md` に反映
- Issue のクローズ判断は完了条件を基準にする運用を `AGENTS.md` に明記
- レビュー中の合意事項は関連ドキュメントと session memory に即時反映する運用を追加

## 2026-03-08T04:48:00Z

- GitHub Issue `#25` から `#30` をチェックボックス形式へ更新
- GitHub Issue / PR の `やること` / `完了条件` はチェックボックス形式を標準とする運用を追加

## 2026-03-08T05:55:00Z

- PR `#32` のタイトルと本文を日本語化
- `#25` のスコープ超過、`chatId` の確定しすぎ、`messages` の扱いに関するレビューコメントを PR `#32` に投稿
- GitHub Issue / PR のタイトル・本文・コメントは原則日本語で記述する運用を追加

## 2026-03-08T06:05:00Z

- PR `#32` の差分を `docs/db/firestore.md` のみに整理
- PR `#32` を ready 化して squash merge
- Issue `#25` を closed 確認

## 2026-03-08T06:12:00Z

- Obsidian の `タスク.md` で `#25` カードを完了へ更新
- Obsidian 実施ログ `2026-03-08-Firestore設計整理.md` を追加

## 2026-03-08T06:25:00Z

- マルチエージェント運用を今後の前提とし、`docs/multi-agent-orchestration.md` を追加
- 親エージェント / 子エージェント / 人間の役割分担を定義
- 原則 `1 Issue = 1 子エージェント`、並列作業では worktree を分ける方針を明文化
- Obsidian `10_Knowledge/Codexマルチエージェント運用.md` に再利用ナレッジを追加

## 2026-03-08T07:20:00Z

- マルチエージェントで `#26` `#27` `#28` `#29` `#30` のドラフト文書を並列作成
- `#27` は親判断で `chatId = sort().join('_')` に確定
- Issue ごとに worktree を分けて branch を作成
- レビュー用 PR を作成
  - `#33` for `#26`
  - `#37` for `#27`
  - `#36` for `#28`
  - `#35` for `#29`
  - `#34` for `#30`

## 2026-03-08T08:05:00Z

- PR `#37` のレビューで、`sort().join('_')` は UID に区切り文字が含まれる場合に衝突しうる指摘を受けた
- 仕様として後から詰まないことを優先し、`chatId` を長さプレフィックス方式 `dm:v1:<lenA>:<uidA>|<lenB>:<uidB>` へ修正
- `docs/db/chat-id.md` を更新し、衝突回避の理屈を「区切り文字依存ではなく長さで境界を確定する」として明文化
- 依存文書 `docs/db/messages-migration.md` と `docs/db/firestore-queries.md` に新しい `chatId` 仕様を反映
- PR `#37` の本文は長さプレフィックス方式に更新済み

## 2026-03-08T14:20:00Z

- `docs/db/chat-id.md` にソート順の比較規則と `generateChatId(senderId, receiverId)` を必ず通す整合性前提を追記
- PR `#37` の Copilot レビューコメント 4 件に対して、修正内容を GitHub 上で返信
- PR `#37` を merge、Issue `#27` が closed になったことを確認
- 今日の作業ログを `summary.md` `audit.md` Obsidian ログへ取りまとめ

## 2026-03-11T12:45:00Z

- Codex の project rules を `.codex/rules/` に追加
- `10-safe-default.rules` で read-only git / GitHub 確認 / `npm run lint|build` / `codex execpolicy check` を許可
- `20-approval-required.rules` で GitHub 更新、依存変更、worktree 変更、Firebase、Docker、再帰削除を都度確認に設定
- `30-forbidden.rules` で `git reset --hard` `git checkout --` `git clean -fd|-xdf` `firebase deploy` `npm|pnpm|yarn publish` を禁止

## 2026-03-14T02:20:00Z

- Issue `#29` / PR `#35` のレビューで、`users.isOnline` はユーザー任意更新ではなくシステム管理フィールドとして扱う方針へ整理
- `threads.commentCount` / `threads.lastCommentAt` は必須前提から外し、基本は `threads/{threadId}/comments` から取得する方針へ整理
- PR `#35` の Copilot レビューコメントに返信し、権限マトリクス上の「原則なし」を「当面は許可しない」へ統一
- Issue `#29` が close されたことを確認
- Obsidian `タスク.md` の `#29` カードを完了へ更新
- GitHub では close 済みだった Issue `#26` / PR `#33` と Obsidian `タスク.md` / session-memory の状態ズレを検出し、同期した
- 今後は Issue / PR の進捗変更時に、原則として Obsidian `タスク.md` と session-memory をこちらで更新する運用を `AGENTS.md` に追記

## 2026-03-14T03:00:00Z

- `#28` の設計文書レビューで、ページ / コンポーネントの主軸が曖昧なまま書き始めたことによる大きな手戻りを確認
- 再発防止のため `docs/session-memory/failure-notes.md` を追加
- session-memory README と `AGENTS.md` に failure note 運用と設計文書の事前固定ルールを追加

## 2026-03-14T09:59:15Z

- PR `#36` `#28 画面ごとの Firestore クエリ設計を整理する` が merge され、Issue `#28` が closed になったことを確認
- `#28` のレビューで、クエリ設計文書をページ単位へ整理し、`Users` の最新メッセージ表示は都度クエリを基本とする方針に整理
- `PrivateChat` の時系列表示は `directMessages.createdAt` を基準にする方針で `#27` 反映事項を修正
- Obsidian `タスク.md` の `#28` カードを `Done` レーンへ移す前提で同期を実施

## 2026-03-14T11:10:00Z

- `docs/emulator-acceptance.md` を見直し、`threads.commentCount` / `threads.lastCommentAt` を必須前提にしない現在方針へ文面を調整
- Obsidian `タスク.md` の `vue-chat` レーンを確認し、未起票だった実装タスクを GitHub Issue として分解
- GitHub Issue `#40` - `#48` を起票
  - `#40` 相談投稿（threads）機能を実装する
  - `#41` スレッド詳細画面とコメント機能を実装する
  - `#42` スレッド参加者一覧を詳細画面に表示する
  - `#43` ダイレクトチャットを `directMessages` 前提で安定化する
  - `#44` 認証済みユーザーのプロフィール最小構成と編集導線を整える
  - `#45` Firestore Security Rules を `threads` / `comments` / `directMessages` まで実装する
  - `#46` Firebase 呼び出しのエラーハンドリングを主要画面で統一する
  - `#47` 画面 / コンポーネント命名と責務のズレを整理する
  - `#48` リポジトリ名変更に合わせて README と関連表記を整理する

## 2026-03-15T01:05:11Z

- PR `#34` `#30 エミュレータ受け入れシナリオを整理する` が merge され、Issue `#30` が closed になったことを確認
- `docs/emulator-acceptance.md` を `#30` の設計成果物として扱い、設計整理を完了に寄せた
- session-memory の `summary.md` を更新し、open Issue の起点を `#40` - `#48` に修正
- Obsidian `タスク.md` の `vue-chat` レーンで `#30` を完了へ同期

## 2026-03-15T12:23:19Z

- Issue `#47` の着手として、route 直結の画面を `LoginView` `RegisterView` `UsersView` `ProfileView` に整理
- `src/router/index.js` の route name を `Login` `Register` `Users` `Profile` へ統一し、guard 判定を `meta.requiresAuth` / `meta.guestOnly` ベースへ整理
- `HomeView` から未使用の `messages` / `users` 購読と送信ロジックを削除し、認証状態による分岐だけへ責務を縮小
- `ProfileComponent` を `ProfileDetails` へ改名し、未使用の `ChatView` を削除
- `docs/routes.md` `docs/db/messages-migration.md` `docs/db/firestore-queries.md` `docs/view-wireframes.drawio` を現行構成へ同期
- `npm run lint` を実行し、lint error がないことを確認

## 2026-03-21T14:45:00Z

- PR `#54` の Copilot レビューを確認し、`ThreadDetailView` が `route.params.postId` 変更時も購読を張り直すよう修正
- スレッド未存在時はコメント投稿を止めるガードと submit button disabled を追加
- `TimelineView` の `詳細を見る` にスレッドタイトル込みの `aria-label` を追加
- `docs/routes.md` のチェックリストから将来 Issue `#42` の項目を分離し、今後対応セクションへ移動
- `npm run lint` と `npm run build` を再実行し、warning のみで通過を確認
