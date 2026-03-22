あなたはこのプロジェクトをサポートするエージェントの「主担当」になります。
必要に応じて、あなた自身がコンテキストを抱えきれない場合は、タスクを分担させたいエージェントの作成を提案してください。
その場合は、作成したいエージェントについて「どのディレクトリに配置するか」「何を担当させるか」を明確にした上で提案してください。

- 開発サーバー: `npm run serve`
- 本番ビルド: `npm run build`
- Lint: `npm run lint`
- Firebase CLI を使う場合は `npm install -g firebase-tools` → `firebase login` → `firebase init`（必要に応じて）→ `firebase emulators:start` / `firebase deploy` などのフローを利用。

## Obsidian ノート
- このプロジェクトに関する補足メモは Obsidian vault に保存されている。
- vault の具体的なローカルパスは各自の環境に依存するため、このリポジトリ内では絶対パスを固定しないこと。
- このプロジェクトの主要ノート（vault ルートを `${VAULT_ROOT}` とした場合の相対パス例）:
  - `${VAULT_ROOT}/vue-chat/README.md`
  - `${VAULT_ROOT}/vue-chat/06_Dev/Codex運用ガイド.md`
  - `${VAULT_ROOT}/vue-chat/06_Dev/GitHub運用方針.md`
  - `${VAULT_ROOT}/vue-chat/06_Dev/開発メモ.md`
  - `${VAULT_ROOT}/タスク.md`
  - `${VAULT_ROOT}/vue-chat/08_Logs/README.md`
  - `${VAULT_ROOT}/vue-chat/09_Decisions/README.md`
- このリポジトリで作業を始める際は、必要に応じて上記ノートを参照してよい。
- `タスク.md` では `vue-chat` レーンを、このプロジェクトの開発タスク整理の参照元として扱うこと。
- まず `vue-chat/README.md` を起点にし、実装ルールは `06_Dev/Codex運用ガイド.md` と `06_Dev/GitHub運用方針.md` を確認すること。
- vault 全体を無差別に探索せず、まずはこのプロジェクトに対応するディレクトリ配下のみを確認すること。
- `タスク.md` を参照する場合も、まずは `vue-chat` に関係するセクションやタグ付き項目だけを対象にすること。
- コードとノートの内容が矛盾する場合は、コード・設定ファイル・実装を優先し、ノートは補助情報として扱うこと。
- Obsidian は、アイデア整理、要件整理、タスク分解の下書き、論点整理、作業ログ、意思決定メモなどの「考えるための場所」として扱うこと。
- 実際に着手する正式タスクは GitHub Issue を正とし、Obsidian のみで完結する運用にしないこと。
- まだ曖昧で Issue 化前の内容は Obsidian に置き、着手すると決めたら Issue に昇格させること。

## 作業方針
- 破壊的変更や設計変更を伴う編集は、事前に方針と影響範囲を共有してから行うこと。
- 軽微な修正や、ユーザーが明示的に依頼した実装については、そのまま進めてよい。
- 標準的な Issue 実装フローは、原則として `Issue確認 -> worktree/branch作成 -> 実装 -> lint/build -> PR作成 -> Copilotレビュー反映 -> 動作確認 -> merge` とする。
- PR を作成したら、原則として Copilot レビューを確認し、conversation ごとに修正内容を返信したうえでマージ判定へ進めること。
- Copilot レビューを受けたときは、原則として `1 conversation = 1 commit` で対応し、どの指摘への修正かを commit message から追える状態を保つこと。
- Copilot レビュー対応の標準手順は、`review thread の取得 -> 指摘内容と対応方針の共有 -> conversation ごとの修正 -> conversation ごとの commit -> lint/build -> 各 conversation へ返信 -> 最終確認` とする。
- PR は原則として通常 PR で作成し、draft PR は「レビュー前にまだ動作確認や差分整理が終わっていない」など明確な理由がある場合に限ること。
- PR を作成する際は、原則として assignee をユーザー本人（`ohikouta`）に設定すること。
- 動作確認は、可能なら branch / worktree ごとに開発サーバーを別ポートで立て、main 未反映でも確認できる状態を優先すること。
- 手動確認を依頼する際は、「確認URL」「確認手順」「見てほしい観点」を毎回セットで提示すること。単に「確認してください」で終わらせないこと。
- ユーザーが「ガンガン進める」「そのまま進める」と明示した実装タスクでは、標準フロー内の実装・検証・PR更新は止まらず進めてよい。ただし deploy、破壊的操作、workspace 外更新は別扱いとする。
- 本プロジェクトの開発者は Vue.js / Firebase の初学者であるため、アドバイス時は両技術の仕様に沿ったベストプラクティスを優先すること。
- 提案はそのまま鵜呑みにせず、妥当性・保守性・実装コストを踏まえて批判的に検討すること。
- 理解や提案に筋が通っている場合は、その点を明確にフィードバックすること。
- GitHub の操作は `gh` コマンドを前提としてよい。
- Issue、PR、リポジトリ確認など GitHub 関連の作業では、まず `gh` の利用を優先すること。
- GitHub を正式な作業単位と履歴管理の場として扱い、Issue を正式タスク、PR を実装結果とレビュー単位として扱うこと。
- 実装方針や優先順位、次に着手する作業を提案する前に、既存の GitHub Issue / PR を `gh` で確認し、未確認のまま新規タスク前提で話を進めないこと。
- Issue をクローズするか判断するときは、必ず Issue 本文の完了条件を基準に確認すること。話しながら論点が増えても、完了条件を超える追加論点は別 Issue 候補として切り出し、現在の Issue を不必要に膨らませないこと。
- GitHub Issue の `やること` と `完了条件` は、進捗が追えるように原則チェックボックス形式で書くこと。特に `完了条件` は Issue クローズ判定の基準として扱う。
- GitHub Issue / PR のタイトル・本文・コメントは、特別な理由がない限り日本語で記述すること。英語の自動生成文面は、そのまま残さず読みやすい日本語へ整えること。
- PR 本文の作成や更新では、shell 展開事故を避けるため `--body-file` を優先し、バッククォートやパスを含む本文をそのまま `--body` へ流し込まないこと。
- Obsidian と GitHub の二重管理を避け、着手中・着手予定の作業一覧は GitHub Issue を基準にし、Obsidian 側は補助的な整理と記録に寄せること。
- Obsidian のタスクカードは、対応する GitHub Issue 番号を必ず明記すること。Issue 番号がないカードは正式着手前のメモとして扱い、実作業の前提にしないこと。
- Obsidian のタスクカードは PR と直接紐づけなくてよい。PR は GitHub 上で Issue と紐づいていれば十分とする。
- GitHub Issue / PR の本文やコメントには、原則として Obsidian ノートへの参照や依存関係を書かないこと。GitHub 上の情報だけで作業単位と判断材料が閉じる状態を保つこと。
- レビューや相談の中で決まった事項は、その場で関連ドキュメント、`docs/session-memory/summary.md`、`docs/session-memory/audit.md` に反映すること。未記録の口頭合意を次回セッションへ持ち越さないこと。
- GitHub Issue / PR の状態を更新したターンでは、対応する Obsidian `タスク.md` のカード状態も同じターンで同期すること。後でまとめて更新する運用にしないこと。
- 特に Issue close / PR merge / 実装完了確認のタイミングでは、GitHub と Obsidian の状態ズレがないかを終了前チェック項目として扱うこと。
- 設計文書で大きな手戻りや構造的なミスが起きた場合は、原因・再発防止策を `docs/session-memory/failure-notes.md` に記録すること。

## 承認ポリシー
- Codex がユーザー確認を求めやすいのは、主に `git` の更新系（`fetch` `worktree add` `add` `commit` `push` など）、`gh` の更新系（`pr create` `pr comment` `pr review` `issue comment` など）、`gh api`、`npm install` 系、`firebase`、`docker`、`rm -rf`、および workspace 外への書き込みである。
- 読み取り系の `gh issue/pr view|list`、`git status|diff|log|show`、`git worktree list`、`npm run lint|build` は原則として安全側に寄せる。
- `gh api` は `.codex/rules/10-safe-default.rules` で allow された特定の read-only GET のみ安全側に寄せてよい。それ以外の `gh api` 呼び出しと、write 系の `--method POST|PATCH|PUT|DELETE` は都度確認対象として扱う。
- `npm run serve` は標準のローカル確認フローとして扱う。branch / worktree ごとの別ポート起動を許容する。
- Obsidian vault など workspace 外への書き込みは、内容が正しくても別途確認対象として扱う。
- `git reset --hard`、`git checkout --`、`git clean -fd|-xdf`、`firebase deploy`、package publish は禁止対象として維持する。

## コード規約・実装方針
- Vue コンポーネントは Composition API / Options API いずれも可だが、同一ファイル内ではスタイルを統一。
- ファイル名は PascalCase（Vue コンポーネント）、kebab-case（その他 JS ファイル）を基本とする。
- Firebase 呼び出しは `src/firebaseConfig.js` からエクスポートした `db` `auth` `storage` を利用し、重複初期化を避ける。
- Firestore クエリは async/await または購読（`onSnapshot`）を使い、エラー処理とログを入れる。
- CSS は既存スタイルに合わせて Scoped を基本とする。
- commit は「レビューで追える意味のある単位」で切ること。1 Issue = 1 commit に固定せず、機能まとまりや review conversation 単位で分割し、逆に強く結びついた変更は不自然に分割しないこと。

## テスト・検証
- 現状ユニットテストは未整備。必要に応じて Vue Test Utils + Jest などで導入。
- Firebase エミュレーターを併用するとブラウザ依存を減らし CLI での確認が容易になる。

## ナレッジ共有
- 新規スクリプトやビルド手順を追加する際は本ファイルを更新し、他の開発者が迷わないようにする。
- Obsidian 側に重要な設計判断や運用ルールを追加した場合は、必要に応じて本ファイルから参照先を更新する。
- セッション継続が必要な作業では、区切りごとに `docs/session-memory/summary.md` を最新化し、`docs/session-memory/audit.md` に実施ログを追記すること。次回開始時は `summary.md` を起点にし、必要に応じて `audit.md` `failure-notes.md` と履歴も遡って進捗を把握する。
- Vue / React の設計文書は、書き始める前に「主軸はページかコンポーネントか」「成果物に含めるセクション」「含めない情報」「レビュー観点」を先に固定すること。
- マルチエージェントで進める場合は、`docs/multi-agent-orchestration.md` を参照し、原則 `1 Issue = 1 子エージェント` で担当を分けること。
- 並列作業では branch だけでなく worktree も分けること。tmux の pane 分割だけで同じ作業ディレクトリを共有しないこと。
