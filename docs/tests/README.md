# テスト方針

Real Chat の動作を単体・結合・システムの3つのレベルで確認する。各ファイルには、テストケースと、その実行結果・実施日・対象コミット・環境を記録する。

| テストレベル | 確認対象 | テストケースと実行結果 |
|---|---|---|
| 単体テスト | 外部サービスから分離した関数・コンポーネントの振る舞い | [`docs/tests/unit-test-cases.md`](./unit-test-cases.md) |
| 結合テスト | Firebase Authentication、Firestore、Security Rules間の連携 | [`docs/tests/integration-test-cases.md`](./integration-test-cases.md) |
| システムテスト | ブラウザ上での画面操作と、アプリケーション全体の振る舞い | [`docs/tests/system-test-cases.md`](./system-test-cases.md) |

## 参考規格

- [ISO/IEC/IEEE 29119-1:2022](https://www.iso.org/obp/ui/?_escaped_fragment_=iso%3Astd%3Aiso-iec-ieee%3A29119%3A-1%3Aed-2%3Av1%3Aen), §3.108「test level」
