# テスト設計書の仕様

## 目的

本書は、Real Chat のテストレベル、ケース設計、および実行記録の記載項目を定める。

## テストレベル

ISO/IEC/IEEE 29119-1:2022 は、テストレベルを固有の目的とリスクを扱うテスト段階として定義し、単体／コンポーネント、結合、システム、システム結合、受け入れを一般的な例として挙げている。本プロジェクトでは、対象と検証方法に基づき、テストケースを次の3レベルに整理する。

| 本書の分類 | 対象 | 主な確認内容 | ケース一覧 |
|---|---|---|---|
| 単体テスト | 外部サービスや画面から分離した関数・モジュール | 入力に対する出力、境界値、エラー変換 | [単体テストケース](./unit-test/README.md) |
| 結合テスト | 複数のモジュール、Firebaseサービス、Security Rules間の連携 | インターフェース、データ連携、認証・認可 | [結合テストケース](./integration-test/README.md) |
| システムテスト | ブラウザから操作するアプリケーション全体 | 画面遷移、利用者操作、画面表示、保存結果 | [システムテストケース](./system-test/README.md) |

本書では、ISO/IEC/IEEE 29119-1:2022が挙げる一般的なテストレベルを、Real Chatの検証対象に沿って単体・結合・システムの3分類に対応付ける。受け入れテストは利用者の業務上の要求への適合を確認する目的として、ケースの対象に応じて各レベルで実施する。

## ケース設計

ケースは利用者に提供する機能と、その機能に定めた振る舞いを軸に整理する。対象メソッドやコンポーネントは実装上のテスト対象として記録し、ケース分類は機能領域に基づける。

| 機能領域 | テストベース | 主なケース一覧 |
|---|---|---|
| 認証・画面アクセス | [ルーティング仕様](../routes.md)、[Issue #70](https://github.com/ohikouta/real-chat/issues/70) | [単体テスト](./unit-test/README.md)、[システムテスト](./system-test/README.md) |
| プロフィール・画像 | [Firestoreデータモデル](../db/firestore.md)、[Issue #69](https://github.com/ohikouta/real-chat/issues/69) | [単体テスト](./unit-test/README.md)、[システムテスト](./system-test/README.md) |
| ユーザー一覧 | [Firestoreクエリ設計](../db/firestore-queries.md)、[Firestore権限方針](../db/firestore-authz.md) | [結合テスト](./integration-test/README.md)、[システムテスト](./system-test/README.md) |
| 1対1メッセージ | [chatId仕様](../db/chat-id.md)、[Firestoreデータモデル](../db/firestore.md)、[Firestoreクエリ設計](../db/firestore-queries.md) | [単体テスト](./unit-test/README.md)、[結合テスト](./integration-test/README.md)、[システムテスト](./system-test/README.md) |
| スレッド・コメント | [Firestoreデータモデル](../db/firestore.md)、[Firestore権限方針](../db/firestore-authz.md) | [結合テスト](./integration-test/README.md)、[システムテスト](./system-test/README.md) |
| データアクセス制御 | [Firestore権限方針](../db/firestore-authz.md) | [結合テスト](./integration-test/README.md) |

ケース設計では、次の対応を追跡できるようにする。

`テストベース（要件・仕様） → 機能上の条件 → テストケースID → テストレベル → 実行記録`

テストベースには、プロダクト仕様、データモデル、権限方針、Issueの完了条件を用いる。テスト技法の参考情報は入力条件の整理に用い、期待結果はテストベースから定める。各ケースには一意のID、前提条件・操作、判定可能な期待結果を記載する。複数の独立した入力、権限判断、結果判定はケースを分ける。期待結果は、画面表示、データ状態、応答、エラーなど、実行後に確認できる内容で記述する。

## 網羅性の評価観点

テストベースに含まれる機能上の条件とケースIDの対応を確認し、次の観点を適用する。

- 入力値・データ状態を同値クラスに分け、各クラスの代表条件を選ぶ。
- 上限・下限など順序を持つ制約には境界値を設定する。
- 複数条件の組み合わせは決定表などで整理する。
- 状態によって動作が変わる機能は状態と遷移を整理する。
- 認証・認可、異常入力、外部サービスの失敗など、機能要件に関わる拒否・エラー条件を含める。
- コードの分岐網羅は実装構造の確認に用い、要件からのケース導出と併せて評価する。
- リスクに応じて確認の優先度と深さを定める。

網羅性は、テストベースの条件、入力クラス、境界、状態遷移、分岐、リスクに対するケースの対応状況で評価する。

## 実行記録

ケース表は1行を1回の実施記録として構成し、ケースID、前提条件・操作、期待結果、実行結果・観察、実施日、対象コミット、実行環境を記載する。同一ケースを複数回実施した場合は、実施ごとに行を設ける。

| 項目 | 記載内容 |
|---|---|
| 実行結果・観察 | `PASS` / `FAIL` / `BLOCKED` と確認した画面・データ・応答 |
| 実施日 | 実行日（YYYY-MM-DD） |
| 対象コミット | テスト対象のGitコミット |
| 実行環境 | ブラウザ、OS、Firebase Emulator等、再現に必要な環境 |

`FAIL` または `BLOCKED` の場合、再現条件と関連Issueを記録する。認証トークン、秘密情報、実ユーザーの個人情報は記録対象に含めない。

## 参考規格

- ISO/IEC/IEEE 29119-1:2022, *Software and systems engineering — Software testing — Part 1: General concepts*, §3.108 “test level”. [ISO Online Browsing Platform](https://www.iso.org/obp/ui/?_escaped_fragment_=iso%3Astd%3Aiso-iec-ieee%3A29119%3A-1%3Aed-2%3Av1%3Aen)
