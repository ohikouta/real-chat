# Project Summary

- Updated At: 2026-03-21T00:27:14Z
- Branch: issue-40-threads
- HEAD: e117e26f
- Updated By: Codex

## Current Status

- `#25` は完了し、PR `#32` は merge 済み
- `#27` は完了し、PR `#37` は merge 済み
- `#30` は完了し、PR `#34` は merge 済み
- 現在の open Issue は `#40` - `#48`
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
- `#40` の着手として `/timeline` を追加し、`threads` 投稿フォームと新着一覧を `TimelineView` に実装
- `threads` 投稿時に `title` `body` `tags` `authorId` `authorName` `createdAt` `updatedAt` を保存するよう実装
- `Header` に `Timeline` 導線を追加し、`docs/routes.md` を現行ルーティングへ同期
- `LandingHero` の参照画像 `src/assets/sample_chat.png` を追加し、`npm run build` が通る状態へ復旧
- `npm run build` を実行し、bundle size warning のみで build 成功を確認

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

## Next Actions

- Issue `#40` の差分を branch / PR にまとめる
- `#40` のレビュー後、`#41` のスレッド詳細 / コメント機能へ進む

## Reference Logs

- Obsidian 実施ログ `2026-03-08-Firestore設計整理.md` を追加
- [audit.md](./audit.md)
- [failure-notes.md](./failure-notes.md)
- [multi-agent-orchestration.md](../multi-agent-orchestration.md)
