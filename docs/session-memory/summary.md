# Project Summary

- Updated At: 2026-03-22T02:55:00Z
- Branch: issue-56-clean-main
- HEAD: f02dfd05
- Updated By: Codex

## Current Status

- `#25` は完了し、PR `#32` は merge 済み
- `#27` は完了し、PR `#37` は merge 済み
- `#30` は完了し、PR `#34` は merge 済み
- `#44` は完了し、PR `#59` は merge 済み
- `#46` は完了し、PR `#60` は merge 済み
- 現在の open Issue は `#45` `#48` `#56`
- Firestore 設計の基準は [firestore.md](../db/firestore.md)

## Recent Progress

- `#25` のレビュー内容を `docs/db/firestore.md` に反映
- PR `#32` を日本語化し、差分を `docs/db/firestore.md` のみに整理して squash merge
- GitHub Issue `#25` から `#30` をチェックボックス形式へ更新
- Obsidian の `vue-chat` タスクカードを Issue リンク形式へ更新し、`#25` を完了に変更
- マルチエージェント運用ルールを `docs/multi-agent-orchestration.md` に追加
- Obsidian `10_Knowledge` に Codex マルチエージェント運用ナレッジを追加
- `#26` `#27` `#28` `#29` `#30` のドラフト文書を作成
- 各 Issue ごとにレビュー用 PR を作成
- `#37` のレビュー指摘を受けて `chatId` を長さプレフィックス方式へ修正
- Copilot レビューコメントへ修正内容を返信
- PR `#37` を merge し、Issue `#27` を closed 確認
- PR `#35` を close し、Issue `#29` の権限方針整理を完了
- PR `#36` を merge し、Issue `#28` のクエリ / インデックス設計整理を完了
- `#28` のレビューで、ページ単位でクエリ設計を整理し、`Users` の最新メッセージ表示は都度クエリを基本とする方針に整理
- `directMessages` の時系列表示は `createdAt` を基準とし、旧 `messages.timestamp` は送信日時として扱う前提に整理
- `docs/emulator-acceptance.md` の `threads.commentCount` / `lastCommentAt` 前提を現行方針に合わせて調整
- PR `#34` を review 後に merge し、Issue `#30` が closed になったことを確認
- Obsidian `タスク.md` の `vue-chat` レーンで `#30` を完了へ同期
- Obsidian の `vue-chat` レーンにあった未起票の実装タスクを GitHub Issue `#40` - `#48` として起票
- `#47` の着手として、route 直結の画面を `views` に寄せ、`ProfileComponent` を `ProfileDetails` へ改名
- `HomeView` の重複していた Firestore 購読 / 送信責務を削除し、`ChatView` を廃止
- `src/router/index.js` の route name と guard 判定を整理し、`docs/routes.md` など関連ドキュメントを同期
- `npm run lint` を実行し、lint error なしを確認
- `#52` が merge され、`#47` の画面責務整理が `main` に取り込まれた
- `#53` が merge され、`#40` の相談投稿と新着一覧が `main` に取り込まれた
- `#54` のレビュー対応で `ThreadDetailView` の route param 変更追従と無効投稿ガードを追加した
- `#42` の参加者一覧表示を実装し、`authorId` 優先集約で表示方針を整理した
- `#43` の着手として `PrivateChatView` を `directMessages` + `chatId` + `createdAt` 前提へ切り替えた
- `#44` の着手としてプロフィール最小構成を `displayName` / `profileImageUrl` 中心へ整理した
- `#59` の Copilot 指摘対応で、`ProfileDetails` の dirty 制御、`UserList` の N+1 解消、DM 送信者名キャッシュ、表示名フォールバック統一を実施した
- `#44` が merge 済みとなり、Obsidian の `vue-chat` レーンを同期した
- `#46` の着手として `firebaseError` util を追加し、認証・DM・スレッド・プロフィール系のエラー表示とログ出力を統一した
- `#60` が merge 済みとなり、`#46` のエラーハンドリング統一が `main` に取り込まれた
- `#56` の確認として、`git fetch origin` を prompt 側から外し、safe default と矛盾しないよう整理した
- `#56` の確認として、`gh api` は read-only GET を safe default、`POST|PATCH|PUT|DELETE` を要確認に切り分けた
- `AGENTS.md` の承認ポリシーへ `gh api` read/write の境界を追記した
- PR 作成フローとして、通常 PR を原則とし、draft PR は明確な未完理由がある場合に限る方針を明文化した
- PR 作成時は原則としてユーザー（`ohikouta`）を assignee に設定する方針を追加した

## Current Decisions

- `directMessages` を正式保存先とする
- `messages` の移行 / 廃止 / ロールバック条件は `#26` で決める
- `chatId` は長さプレフィックス方式 `dm:v1:<lenA>:<uidA>|<lenB>:<uidB>` で生成する
- コメントは `threads/{threadId}/comments` のサブコレクションで扱う
- 表示用の `authorName` / `senderName` はキャッシュとして保持する
- GitHub Issue の `やること` / `完了条件` はチェックボックス形式を標準とする
- GitHub Issue / PR のタイトル・本文・コメントは原則日本語で記述する
- マルチエージェントでは原則 `1 Issue = 1 子エージェント` で進める
- 並列作業では branch だけでなく worktree も分ける
- Codex のガードレールは `AGENTS.md` とは別に `.codex/rules/*.rules` で管理する
- `gh` の読み取り系は許可、変更系は都度確認、`git reset --hard` と `firebase deploy` は禁止する
- `users.isOnline` はユーザー任意更新ではなくシステム管理フィールドとして扱い、必要なら表示可否は別設定で持つ
- `threads.commentCount` / `threads.lastCommentAt` は必須前提にせず、基本は `comments` から取得する
- Vue / React の設計文書は、ページ責務とコンポーネント責務を先に分離してから書く
- `Users` の最新メッセージ表示は、必要ならまず都度クエリで扱い、専用コレクション追加はパフォーマンス課題が出てから検討する
- `PrivateChat` の時系列表示は `directMessages.createdAt` を基準にする
- route 直結の画面は `views` を入口にし、再利用 UI は `components` に置く
- route guard は path 文字列の分岐より `meta` ベースを優先する
- スレッド一覧はまず `threads` を `createdAt desc` で購読し、タグ絞り込みや詳細遷移は後続 Issue で段階的に足す
- スレッド詳細は `threads/{threadId}` と `threads/{threadId}/comments` を別購読で扱い、コメントは `createdAt asc` 表示を基本とする
- `ThreadDetailView` は `route.params.postId` の変化を watch し、同一コンポーネント再利用時も購読を張り直す
- スレッド参加者一覧は `threads.authorId` と `comments.authorId` を優先して集約し、`authorId` が欠ける場合のみ表示名ベースでフォールバックする
- `PrivateChatView` の DM は `directMessages` を正式保存先とし、`chatId + createdAt` で購読する
- `users/{userId}/messages/latest` は当面は補助表示データ扱いに留め、DM 保存先にはしない
- プロフィール最小構成の正本は `users/{uid}` の `displayName` / `profileImageUrl` とし、互換のため `username` 読み取りは残す
- 表示名のフォールバック順は `displayName -> username -> email -> 匿名ユーザー` を標準とする
- プロフィール編集導線は `/profile` に寄せ、登録直後も `/profile` へ送る
- Firebase エラー処理は「ユーザー向けメッセージ」と「開発者向けログ」を分離し、`logFirebaseError` とエラー変換 util で寄せる
- 標準的な実装運用は `Issue確認 -> worktree/branch作成 -> 実装 -> lint/build -> PR作成 -> Copilotレビュー反映 -> 動作確認 -> merge` を基本線とする
- 承認が必要になりやすいコマンド群と、安全側に寄せるコマンド群は `AGENTS.md` と `.codex/rules/*.rules` で管理する
- `gh api` は `.codex/rules/10-safe-default.rules` で allow された特定の read-only GET のみ安全側、`--method POST|PATCH|PUT|DELETE` とそれ以外の `gh api` は要確認として扱う
- GitHub の Issue / PR 状態を更新したターンでは、対応する Obsidian `タスク.md` も同ターンで同期する
- PR は原則として通常 PR で作成し、draft PR は明確な未完理由がある場合に限る
- PR 作成時は原則としてユーザー（`ohikouta`）を assignee に設定する

## Next Actions

- Issue `#56` の差分を `main` 起点の clean branch で PR に載せ直す
- `#56` の整理後、`#45` または `#48` の着手順を決める

## Reference Logs

- Obsidian 実施ログ `2026-03-08-Firestore設計整理.md` を追加
- [audit.md](./audit.md)
- [failure-notes.md](./failure-notes.md)
- [multi-agent-orchestration.md](../multi-agent-orchestration.md)
