# Project Summary

- Updated At: 2026-03-24T00:00:00Z
- Branch: issue-roadmap-docs
- Updated By: Codex

## Current Status

- `#25` `#27` `#28` `#29` `#30` は完了済み
- `#40` `#41` `#42` `#43` `#44` `#45` `#46` `#47` `#48` は完了または close 済み
- 現在の open Issue は `#63` `#64` `#65`
- 現在の open PR は `#66`
- アプリの現状整理と次フェーズの棚卸しが次のテーマ

## Recent Progress

- `#44` でプロフィール最小構成と編集導線を整理した
- `#45` で Firestore Security Rules と emulator 検証スクリプトを追加した
- `#46` で主要画面の Firebase エラーハンドリングを共通化した
- `#47` で route 直結画面とコンポーネント責務を整理した
- `#48` は `main` 上で実質達成済みと確認し close した
- README の関連ドキュメント導線を整理し、現状評価・振り返り・デプロイ計画・ロードマップ文書を追加した
- 次フェーズの正式 backlog として `#63` `#64` `#65` を起票した
- `#63` の docs 整理を commit し、PR `#66` を通常 PR として作成した

## Current Decisions

- `directMessages` を正式保存先とする
- コメントは `threads/{threadId}/comments` のサブコレクションで扱う
- `chatId` は長さプレフィックス方式 `dm:v1:<lenA>:<uidA>|<lenB>:<uidB>` で生成する
- Firestore Rules は `users` を認証ユーザー限定、`threads` / `comments` を認証 + author 基準、`directMessages` を当事者限定 + sender 基準で扱う
- route 直結の画面は `views` を入口にし、再利用 UI は `components` に置く
- 表示名のフォールバック順は `displayName -> username -> email -> 匿名ユーザー` を標準とする
- PR は原則通常 PR とし、assignee は原則 `ohikouta`
- GitHub 状態を更新したターンでは Obsidian `タスク.md` と session-memory を同ターンで同期する
- Issue 用 branch / worktree は `origin/main` 起点で作る

## Next Actions

- PR `#66` のレビュー対応と merge を進めて `#63` を close する
- `#64` で Firebase Hosting 前提の初回デプロイ準備を整理する
- `#65` で初回デプロイと公開 URL 上の確認を進める

## Reference Logs

- [project-assessment.md](../project-assessment.md)
- [project-retrospective.md](../project-retrospective.md)
- [deployment-plan.md](../deployment-plan.md)
- [roadmap.md](../roadmap.md)
- [audit.md](./audit.md)
