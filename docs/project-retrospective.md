# Project Retrospective

この文書は、ここまでの開発を振り返って「問題だったこと」「改善したいこと」「よかったこと」を整理するためのメモです。

## 問題だったこと

### 1. branch / worktree の衛生管理で手戻りが出た

- `main` 起点ではない branch から派生して PR を作り、不要な履歴が混ざった
- 最新 `origin/main` を取り込まずに PR を出し、同じファイルで無駄な conflict を起こした
- 個人開発で避けられるはずの手戻りに時間を使った

### 2. GitHub と Obsidian と session-memory の同期漏れが繰り返し起きた

- Issue / PR の状態更新後に、補助記録の同期が遅れることがあった
- 実態は終わっていても、管理情報がずれて見える時間が発生した

### 3. 設計文書の切り方に迷いがあった

- 画面責務とコンポーネント責務を分ける前に文書を書き始め、手戻りが出た
- 汎用化しすぎた説明と、現場で使える具体性のバランスに迷いがあった

### 4. ローカル環境差分がつまずきになった

- worktree を切ると `.env.local` が自動では見えず、Firebase 初期化で白画面になった
- Firestore emulator 検証では Java Runtime が別途必要だった

## 原因

### 運用手順が「知っている」だけで「固定化されていなかった」

- `origin/main` 同期
- PR 前 diff 確認
- 状態変更後の同期

これらを毎回の終了条件として固定できていなかったことが大きい。

### プロジェクト運用の粒度がまだ定まっていなかった

- 何を GitHub Issue 化するか
- 何を Obsidian に置くか
- どこからが正式タスクか

この境界が途中まで曖昧だった。

## 再発防止

### 固定したい運用

- Issue 用 branch / worktree は必ず `origin/main` 起点で作る
- PR 作成前に `git fetch origin` と `origin/main..HEAD` の差分確認を入れる
- GitHub 状態を変えたターンでは `Obsidian -> summary.md -> audit.md` の順で同期する
- draft PR は明確な未完理由がある場合だけにする
- PR の assignee は原則 `ohikouta`

### 今後 Skill 化したい領域

- Issue から PR までの標準フロー
- GitHub / Obsidian / session-memory の同期
- Copilot レビュー対応
- ローカル確認と emulator 検証

## よかったこと

### 1. Firestore 設計から Security Rules まで繋げられた

- データ設計だけで終わらず、実装と Rules まで落とし込めた
- emulator ベースで「通すべき操作」と「拒否すべき操作」を確認できた

### 2. レビューを通して設計の精度が上がった

- `chatId`
- 画面責務
- Firestore クエリ
- Rules 制約

このあたりは、レビュー往復を通してかなり整理された。

### 3. 学習題材としての密度は高かった

- Vue Router
- Firebase Auth
- Firestore
- Storage
- Security Rules
- Emulator

を同時に触れたので、単なる UI 実装以上の経験になっている。

## 今後に活かしたいこと

- 実装より先に、完了条件と docs の置き場所を決める
- 技術的なベストプラクティスだけでなく、個人開発での運用ミスを減らすことを優先する
- 学習用プロジェクトでも、公開前提の docs / deploy / verify を早めに考える
