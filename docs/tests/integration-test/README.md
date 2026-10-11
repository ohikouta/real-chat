# 結合テストケース

Firestore Security RulesとFirebase Authentication / Firestore Emulatorの認可境界を検証する。ケースごとに許可または拒否を1つずつ判定する。

## 実行条件

| 項目 | 値 |
|---|---|
| コマンド | `npm run test:rules` |
| Emulator | Firebase Auth、Cloud Firestore |
| Emulator用プロジェクトID | `demo-real-chat` |
| テストユーザー | Alice、Bob、Charlie（テスト実行時に作成） |
| 初期化 | スクリプトがFirestore Emulatorのデータを消去してから開始する |

接続先は Firebase Auth Emulator と Cloud Firestore Emulator である。実行スクリプトは [`scripts/verify-firestore-rules.mjs`](../../../scripts/verify-firestore-rules.mjs)、Rules定義は [`firestore.rules`](../../../firestore.rules) を参照する。

## ケース一覧

各行は、認証主体・対象データ・操作に対するSecurity Rulesの期待判定を定義する。データ形式、必須フィールド、値の範囲など各制約について、許可条件と拒否条件を設計対象とする。

## Security Rules ケース

| ケースID | 前提・操作 | 期待結果 | 実行結果・観察 | 実施日 | コミット・環境 |
|---|---|---|---|---|---|
| IT-USER-001 | Aliceが自身のUIDをドキュメントIDにしてプロフィールを作成 | 許可される | | | |
| IT-USER-002 | Bobが自身のUIDをドキュメントIDにしてプロフィールを作成 | 許可される | | | |
| IT-USER-003 | 未認証で`users`一覧を取得 | `PERMISSION_DENIED`となる | | | |
| IT-USER-004 | 認証済みBobが`users`一覧を取得 | 許可される | | | |
| IT-USER-005 | BobがAliceのプロフィールを更新 | `PERMISSION_DENIED`となる | | | |
| IT-USER-006 | Aliceが自身のプロフィールとオンライン状態を更新 | 許可される | | | |
| IT-USER-007 | Aliceが自身のAuthメールアドレスと異なるメールアドレスへ更新 | `PERMISSION_DENIED`となる | | | |
| IT-THREAD-001 | Aliceが自身を`authorId`に指定してスレッドを作成 | 許可される | | | |
| IT-THREAD-002 | 未認証でスレッドを取得 | `PERMISSION_DENIED`となる | | | |
| IT-THREAD-003 | 認証済みBobがAliceのスレッドを取得 | 許可される | | | |
| IT-THREAD-004 | 非作成者BobがAliceのスレッドを更新 | `PERMISSION_DENIED`となる | | | |
| IT-THREAD-005 | 作成者Aliceが自身のスレッド本文を更新 | 許可される | | | |
| IT-THREAD-006 | 作成者Aliceがスレッドの`commentCount` / `lastCommentAt`を変更 | `PERMISSION_DENIED`となる | | | |
| IT-COMMENT-001 | Bobが自身を`authorId`に指定してAliceのスレッドへコメントを作成 | 許可される | | | |
| IT-COMMENT-002 | 非作成者AliceがBobのコメントを削除 | `PERMISSION_DENIED`となる | | | |
| IT-COMMENT-003 | 作成者Bobが自身のコメント本文を更新 | 許可される | | | |
| IT-DM-001 | Aliceが自身を`senderId`に指定し、Bob宛てDMを作成 | 許可される | | | |
| IT-DM-002 | 受信者BobがAliceからのDMを取得 | 許可される | | | |
| IT-DM-003 | 第三者CharlieがAliceとBobのDMを取得 | `PERMISSION_DENIED`となる | | | |
| IT-DM-004 | BobがAliceを`senderId`に偽装してDMを作成 | `PERMISSION_DENIED`となる | | | |
| IT-DM-005 | Aliceが参加者と一致しない`chatId`を指定してDMを作成 | `PERMISSION_DENIED`となる | | | |
| IT-DM-006 | Aliceが作成済みDM本文を更新 | `PERMISSION_DENIED`となる | | | |
