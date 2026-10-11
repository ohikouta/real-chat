# 単体テストケース

機能上の振る舞いを対象とし、外部サービスから分離して確認できる入出力や状態変化を定義する。対象メソッドやコンポーネントは実装上のテスト対象として参照する。

## プロフィール情報の表示

| ケースID | 前提・操作 | 期待結果 | 実行結果・観察 | 実施日 | コミット・環境 |
|---|---|---|---|---|---|
| UT-PROFILE-001 | `resolveDisplayName(null)` | `匿名ユーザー` を返す | | | |
| UT-PROFILE-002 | `displayName`, `username`, `email` がすべてある | `displayName` を返す | | | |
| UT-PROFILE-003 | `displayName` が空で `username` と `email` がある | `username` を返す | | | |
| UT-PROFILE-004 | `displayName` と `username` が空で `email` がある | `email` を返す | | | |
| UT-PROFILE-005 | 候補値に空白のみの文字列があり、後続候補に値がある | 空白候補を飛ばし、最初の有効値を返す | | | |
| UT-PROFILE-006 | 全候補が空または空白で、独自fallbackを渡す | trim済み候補がなければ独自fallbackを返す | | | |
| UT-IMAGE-001 | profileが`null`または未指定 | 空文字を返す | | | |
| UT-IMAGE-002 | `profileImageUrl`が文字列以外 | 空文字を返す | | | |
| UT-IMAGE-003 | `profileImageUrl`に前後の空白がある | 前後の空白を除いたURLを返す | | | |

## Firebaseエラーの利用者向け案内

| ケースID | 前提・操作 | 期待結果 | 実行結果・観察 | 実施日 | コミット・環境 |
|---|---|---|---|---|---|
| UT-AUTH-001 | error code=`auth/invalid-email` | メールアドレス形式のエラーメッセージを返す | | | |
| UT-AUTH-002 | error code=`auth/missing-password` | パスワード必須のエラーメッセージを返す | | | |
| UT-AUTH-003 | error code=`auth/invalid-credential` | 認証情報が正しくない旨のメッセージを返す | | | |
| UT-AUTH-004 | error code=`auth/wrong-password` | 認証情報が正しくない旨のメッセージを返す | | | |
| UT-AUTH-005 | error code=`auth/user-not-found` | 認証情報が正しくない旨のメッセージを返す | | | |
| UT-AUTH-006 | error code=`auth/email-already-in-use` | メールアドレス使用済みのメッセージを返す | | | |
| UT-AUTH-007 | error code=`auth/weak-password` | パスワード要件のメッセージを返す | | | |
| UT-AUTH-008 | error code=`auth/too-many-requests` | 時間を置くよう案内するメッセージを返す | | | |
| UT-AUTH-009 | 未知のerror codeと独自fallback | 独自fallbackを返す | | | |
| UT-FIRESTORE-001 | error code=`permission-denied` | 権限がない旨のメッセージを返す | | | |
| UT-FIRESTORE-002 | error code=`unavailable` | 接続できない旨のメッセージを返す | | | |
| UT-FIRESTORE-003 | error code=`failed-precondition` | 必要な設定が不足している旨のメッセージを返す | | | |
| UT-FIRESTORE-004 | error code=`not-found` | 対象データがない旨のメッセージを返す | | | |
| UT-FIRESTORE-005 | 未知のerror codeと独自fallback | 独自fallbackを返す | | | |
| UT-STORAGE-001 | error code=`storage/unauthorized` | 権限がない旨のメッセージを返す | | | |
| UT-STORAGE-002 | error code=`storage/canceled` | キャンセルされた旨のメッセージを返す | | | |
| UT-STORAGE-003 | error code=`storage/retry-limit-exceeded` | タイムアウトした旨のメッセージを返す | | | |
| UT-STORAGE-004 | error code=`storage/object-not-found` | 対象ファイルがない旨のメッセージを返す | | | |
| UT-STORAGE-005 | error code=`storage/invalid-format` | ファイル形式が不正な旨のメッセージを返す | | | |
| UT-STORAGE-006 | 未知のerror codeと独自fallback | 独自fallbackを返す | | | |

## プロフィール画像アップロード

| ケースID | 前提・操作 | 期待結果 | 実行結果・観察 | 実施日 | コミット・環境 |
|---|---|---|---|---|---|
| UT-PROFILE-UPLOAD-001 | 認証済みユーザーが容量上限を超える画像を選択する | 容量超過を示すメッセージが表示される | | | |
| UT-PROFILE-UPLOAD-002 | 認証済みユーザーが対応形式に含まれない画像を選択する | 形式不正を示すメッセージが表示される | | | |
| UT-PROFILE-UPLOAD-003 | Storageへのアップロードが失敗する | アップロード失敗を示すメッセージが表示される | | | |
| UT-PROFILE-UPLOAD-004 | アップロード進捗イベントを受け取る | 進捗率が画面に反映される | | | |
| UT-PROFILE-UPLOAD-005 | StorageへのアップロードとFirestoreへのURL保存が成功する | プロフィール画像URLが保存され、親コンポーネントへ通知される | | | |
| UT-PROFILE-UPLOAD-006 | Storageへのアップロード後、FirestoreへのURL保存が失敗する | URL保存の失敗を示すメッセージが表示される | | | |

## 認証状態の終了

| ケースID | 前提・操作 | 期待結果 | 実行結果・観察 | 実施日 | コミット・環境 |
|---|---|---|---|---|---|
| UT-AUTH-LOGOUT-001 | Firebase Authのログアウト処理が失敗する | 失敗が画面に通知され、ログアウト成功時の画面遷移は行わない | | | |

## ダイレクトメッセージ

| ケースID | 前提・操作 | 期待結果 | 実行結果・観察 | 実施日 | コミット・環境 |
|---|---|---|---|---|---|
| UT-DM-ID-001 | 同じ2つのUIDから、順序を逆にしてchatIdを生成する | 両方の結果が同一のchatIdになる | | | |
| UT-DM-ID-002 | UIDに区切り文字相当の文字を含む異なる2組からchatIdを生成する | それぞれ異なるchatIdになる | | | |
| UT-DM-ID-003 | UIDの一方が空または未指定の状態でchatIdを生成する | 生成エラーになる | | | |
| UT-DM-COMPOSER-001 | 入力コンポーネントがdisabled状態で送信操作を行う | 送信イベントが発火しない | | | |
| UT-DM-COMPOSER-002 | 空白文字だけを入力して送信する | 送信イベントが発火しない | | | |
| UT-DM-COMPOSER-003 | メッセージを入力して送信する | 入力内容を通知し、入力欄を空にする | | | |

## ケース選定の根拠

| 機能領域 | テストベース | テスト対象 |
|---|---|---|
| プロフィール情報の表示 | [Firestoreデータモデル](../../db/firestore.md) のユーザープロフィール項目 | [`resolveDisplayName`](../../../src/utils/userProfile.js)、[`resolveProfileImageUrl`](../../../src/utils/userProfile.js) |
| 認証・Firestore・画像操作時のエラー案内 | Firebaseの各サービスが返すエラーコードと利用者向け案内の要件 | [`firebaseError.js`](../../../src/utils/firebaseError.js) |
| プロフィール画像アップロード | [Issue #69 の完了条件](https://github.com/ohikouta/real-chat/issues/69) | [`ImageUploader.vue`](../../../src/components/ImageUploader.vue) |
| ログアウト時の状態管理 | [Issue #70 の完了条件](https://github.com/ohikouta/real-chat/issues/70) | `Header` のログアウト操作 |
| 1対1メッセージの識別 | [chatId仕様](../../db/chat-id.md) | `PrivateChatView` のchatId生成 |
| メッセージ入力 | ダイレクトメッセージの送信操作 | [`MessageInput.vue`](../../../src/components/MessageInput.vue) |

入力条件の分類には、ISTQB CTFL v4.0.1 §4.2.1 の同値分割を参考にする。文字列の有無・型・空白状態や、既知／未知のエラーコードを異なる入力群として扱う。順序を持つ値に仕様上の境界がある場合は、同シラバス §4.2.2 の境界値分析を適用する。

`UT-AUTH-007` は `auth/weak-password` を画面向けメッセージへ変換する関数のケースである。Firebase Authentication が受け付けるパスワード長の境界条件は、認証機能の振る舞いとして別のテスト対象に位置付ける。

### 参考情報

- ISTQB, *Certified Tester Foundation Level Syllabus v4.0.1*, §§4.2.1 “Equivalence Partitioning”, 4.2.2 “Boundary Value Analysis”. [公式シラバス](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
