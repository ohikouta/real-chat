# Project Audit Log

## 2026-03-24T00:00:00Z

- `origin/main` 起点の clean worktree `/tmp/vue-chat-roadmap` を作成し、次フェーズ整理用の branch `issue-roadmap-docs` を開始
- `README.md` の欠落リンク `docs/vision.md` を除去し、現状評価・振り返り・デプロイ計画・ロードマップ文書への導線を追加
- `docs/project-assessment.md` `docs/project-retrospective.md` `docs/deployment-plan.md` `docs/roadmap.md` を追加し、現状整理と次フェーズ候補を文書化
- `docs/session-memory/summary.md` に残っていた conflict marker を除去し、open Issue / PR の現況へ更新
- GitHub Issue `#63` `#64` `#65` を起票し、次フェーズの正式 backlog を作成
- `#63 現状整理と次フェーズのロードマップを追加` を commit し、PR `#66` を通常 PR として作成

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

## 2026-03-20T00:10:00Z

- リポジトリ文書への固有名 `トビ` の追記は Obsidian 側の役割ベース運用と層がずれるため取り下げ
- `AGENTS.md` / `docs/multi-agent-orchestration.md` / `docs/session-memory/summary.md` から固有名の記述を削除

## 2026-03-20T01:05:00Z

- このリポジトリの Codex 名はリポジトリ直下の `.codex-name` で管理する運用に合わせていたが、現行 `main` には `.codex-name` が存在しない状態を確認した
- 固有名は文書本文ではなく設定ファイル側で管理する方針は維持しつつ、ログ上の値と実ファイル状態は一致させる

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

## 2026-03-21T15:05:00Z

- Issue `#42` の着手として `ThreadDetailView` に参加者一覧を追加
- 参加者はスレッド投稿者とコメント投稿者を `authorId` 優先で集約し、重複を除いて表示する方針に整理
- `authorName` が欠ける場合は `匿名ユーザー` を表示するフォールバックで統一
- `docs/routes.md` と `docs/session-memory/summary.md` を `#42` の実装状況へ同期

## 2026-03-22T01:00:00Z

- Issue `#43` の着手として `PrivateChatView` を `directMessages` 前提へ切り替え
- DM 一覧購読は `chatId + createdAt`、新規送信は `directMessages.createdAt` を使う実装へ寄せた
- `MessageInput` の未定義状態を削除し、DM 送信用の最小コンポーネントへ整理
- `UserList` の `users/{userId}/messages/latest` は補助表示として壊れない読み取りへ調整
- `directMessages` の `chatId + createdAt` 複合インデックス定義を `firebase.json` / `firestore.indexes.json` として追加

## 2026-03-22T09:45:00Z

- Issue `#44` の着手として、プロフィール最小構成を `displayName` / `profileImageUrl` 中心へ整理
- `RegisterComponent` で auth の `displayName` と `users/{uid}` を同時に初期化し、登録後は `/profile` を編集導線の起点にするよう変更
- `ProfileDetails` をプロフィールの表示 / 編集画面へ作り替え、表示名更新、画像 URL 編集、画像アップロード導線を 1 か所に集約
- `Header` `UserList` `TimelineView` `ThreadDetailView` `PrivateChatView` の表示名フォールバックを `displayName -> username -> email -> 匿名ユーザー` へ統一
- `UserList` では自分自身を一覧から除外し、`users` 購読ベースで表示名・アイコン・オンライン状態を表示するよう整理
- `npm run lint` と `npm run build` を再実行し、warning のみで通過を確認

## 2026-03-22T10:05:00Z

- PR `#59` の Copilot review thread 4 件を確認
- `ProfileDetails` で Firestore snapshot が編集中フォームを上書きしないよう `dirty` 制御を追加
- `UserList` から `users/{uid}/messages/latest` の都度読み取りを外し、`#44` の責務に不要な N+1 を解消
- `PrivateChatView` で送信者名の解決結果をキャッシュし、毎送信ごとの Firestore 読み取りを避けるよう変更
- `PrivateChatView` のチャット相手名 fallback を `匿名ユーザー` に統一
- 運用ルールとして `1 conversation = 1 commit`、PR 本文は `--body-file` 優先、意味単位での commit 分割を `AGENTS.md` に追記

## 2026-03-22T10:30:00Z

- PR `#59` が merge され、Issue `#44` が closed になったことを確認
- Obsidian `タスク.md` の `vue-chat` レーンで `#44` 完了、`#47` 完了、`#45` `#46` `#48` の `real-chat` リンク同期を実施
- Issue `#46` の着手として `/tmp/vue-chat-46` worktree を作成
- `src/utils/firebaseError.js` を追加し、認証エラーと Firestore エラーのユーザー向けメッセージ変換、および開発者向けログ出力関数を定義
- `LoginComponent` に送信中 UI / 画面内エラー表示 / `users.isOnline` 更新失敗時のメッセージを追加
- `MessageInput` に disabled / buttonLabel を追加し、`PrivateChatView` で送信中 UI とエラー表示を統一
- `TimelineView` `ThreadDetailView` `UserList` `ProfileDetails` `ImageUploader` の Firestore 失敗時メッセージとログ出力を共通 util へ寄せた
- `npm run lint` と `npm run build` を再実行し、warning のみで通過を確認
- 手動確認依頼時は `確認URL` `確認手順` `見てほしい観点` を毎回明示する運用を `AGENTS.md` に追記

## 2026-03-22T00:00:00Z

- 標準的な開発フローを `Issue確認 -> worktree/branch作成 -> 実装 -> lint/build -> PR作成 -> Copilotレビュー反映 -> 動作確認 -> merge` として `AGENTS.md` に明文化
- 承認が発生しやすいコマンド群を `AGENTS.md` の承認ポリシーへ整理
- `.codex/rules/10-safe-default.rules` に `npm run serve` と `git fetch origin` を追加し、標準フロー内の不要な確認を減らす方針へ更新

## 2026-03-22T00:40:00Z

- `#40` `#41` `#42` が GitHub では完了していた一方、Obsidian `タスク.md` が未同期だったことを確認
- 再発防止として、Issue close / PR merge / 実装完了確認のターンで Obsidian `タスク.md` も同ターン同期するルールを `AGENTS.md` に追記

## 2026-03-22T02:10:00Z

- open Issue を再確認し、継続作業の対象を `#56 Codex 承認ルールと標準開発フローを整理する` に絞った
- `.codex/rules/20-approval-required.rules` から `git fetch` の prompt 重複を外し、`10-safe-default.rules` の `git fetch origin` 許可と矛盾しないよう整理した
- `.codex/rules/*.rules` で `gh api` を read-only GET は安全側、`--method POST|PATCH|PUT|DELETE` は要確認に切り分けた
- `AGENTS.md` の承認ポリシーへ `gh api` の read/write 境界を追記し、末尾の重複行を解消した
- `summary.md` の open Issue / next actions を現状に合わせて更新した

## 2026-03-22T02:35:00Z

- PR 作成フローについて、draft PR を標準にしない方針を確認した
- `AGENTS.md` に「PR は原則として通常 PR、draft は明確な未完理由がある場合のみ」と追記した
- `summary.md` にも同方針を同期し、次回以降の判断ブレを防ぐ状態にした

## 2026-03-22T02:55:00Z

- PR 作成時の追加運用として、原則ユーザー（`ohikouta`）を assignee に設定する方針を確認した
- `AGENTS.md` と `summary.md` に同方針を追記し、以後の PR 作成手順へ反映する前提を明文化した

## 2026-03-22T08:20:00Z

- Issue `#45` の着手として `/tmp/vue-chat-45` worktree で `firestore.rules` を新規追加した
- `users` `threads` `threads/{threadId}/comments` `directMessages` の read / create / update / delete 制御を `docs/db/firestore-authz.md` に沿って Rules 化した
- `firebase.json` に Firestore Rules パスと auth / firestore emulator 設定を追加した
- `scripts/verify-firestore-rules.mjs` と `npm run test:rules` を追加し、Auth emulator の ID token を使って Rules を通過 / 拒否確認する検証スクリプトを用意した
- `AGENTS.md` に `npm run test:rules` を追記した
- `npm run lint` は成功した
- `npm run test:rules` は Firestore emulator 起動に Java Runtime が必要なため、現環境では `java -version` 不在で未完了になった

## 2026-03-22T08:45:00Z

- Java Runtime 導入を試みたが、Homebrew / 直ダウンロードともにネットワーク速度がボトルネックとなり、このターンでは完了しなかった
- Firestore emulator を使う `npm run test:rules` は次回継続課題として扱う

## 2026-03-22T11:11:00Z

- `/tmp/java-runtime/jdk-21.0.10+7-jre/Contents/Home` に展開した Temurin JRE 21 を使って Firestore emulator を起動できる状態にした
- `firebase.json` の emulator ポートを auth `9199` / firestore `8180` に寄せた前提で、`scripts/verify-firestore-rules.mjs` が `FIREBASE_AUTH_EMULATOR_HOST` / `FIRESTORE_EMULATOR_HOST` を読むよう修正した
- `npm run test:rules` を再実行し、`users` `threads` `threads/{threadId}/comments` `directMessages` の許可 / 拒否ケースがすべて PASS することを確認した

## 2026-03-22T11:25:00Z

- `#45 Firestore Security Rules と検証スクリプトを追加` を commit した
- branch `issue-45-security-rules` を push し、通常 PR `#62` `#45 Firestore Security Rules を実装する` を作成した
- PR 作成時に `assignee` として `ohikouta` を設定した
