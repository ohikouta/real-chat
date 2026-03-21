# Routing Specification

このドキュメントは、ルーティング仕様をまとめています。
画面遷移の俯瞰は `docs/view-wireframes.drawio` の `FLOW_Navigation` を参照し、最終的な実装判断は本書を基準にします。

## 運用ルール

1. ルーティング変更時は、`src/router/index.js` と本書を同時更新する。
2. 画面導線レビューは drawio、実装仕様レビューは本書で行う。
3. `As-Is` は現状把握用、`To-Be` は次の実装ターゲットとして管理する。

## As-Is（現状実装）

参照: [src/router/index.js](../src/router/index.js)

| Path | Route Name | Component | Auth Required | Params | Notes |
|---|---|---|---|---|---|
| `/` | `Home` | `HomeView` | No | - | 未ログイン時はHero、ログイン時はUserListを表示 |
| `/register` | `Register` | `RegisterView` | No | - | `RegisterComponent` を表示。ログイン済みは`/`へリダイレクト |
| `/login` | `Login` | `LoginView` | No | - | `LoginComponent` を表示。ログイン済みは`/`へリダイレクト |
| `/profile` | `Profile` | `ProfileView` | Yes | - | `ProfileDetails` を表示。未ログイン時は`/login`へ |
| `/timeline` | `Timeline` | `TimelineView` | Yes | - | `threads` を新着順に表示し、投稿フォームを持つ。未ログイン時は`/login`へ |
| `/timeline/:postId/thread` | `ThreadDetail` | `ThreadDetailView` | Yes | `postId` | スレッド本体とコメント一覧、コメント投稿フォームを表示。未ログイン時は`/login`へ |
| `/users` | `Users` | `UsersView` | Yes | - | `UserList` を表示。未ログイン時は`/login`へ |
| `/chat/:userId` | `PrivateChat` | `PrivateChatView` | Yes | `userId` | 未ログイン時は`/login`へ |

## To-Be（設計反映後）

`FLOW_Navigation` と `SCREEN_*` 設計を踏まえたターゲット仕様。

| Path | Route Name (proposal) | Component (proposal) | Auth Required | Params | Notes |
|---|---|---|---|---|---|
| `/` | `Home` | `HomeView` | No | - | `SCREEN_Home` |
| `/login` | `Login` | `LoginView` | No | - | `SCREEN_Login` |
| `/register` | `Register` | `RegisterView` | No | - | `SCREEN_Register` |
| `/users` | `Users` | `UsersView` | Yes | - | `SCREEN_Users` |
| `/chat/:userId` | `PrivateChat` | `PrivateChatView` | Yes | `userId` | `SCREEN_PrivateChat`（1:1 DM専用） |
| `/profile` | `Profile` | `ProfileView` | Yes | - | `SCREEN_Profile` |
| `/timeline` | `Timeline` | `TimelineView` | Yes | - | `SCREEN_Timeline` |
| `/timeline/:postId/thread` | `ThreadDetail` | `ThreadDetailView` | Yes | `postId` | `SCREEN_ThreadDetail`（新規） |

## Guard仕様

### 現状

- 認証必須: `meta.requiresAuth` を付けた `/users`, `/profile`, `/timeline`, `/chat/*`
- 未認証で認証必須ページへアクセス: `/login`へリダイレクト
- 認証済みで `meta.guestOnly` を付けた `/login` または `/register` へアクセス: `/`へリダイレクト

### To-Be

- 認証必須: `/users`, `/profile`, `/chat/*`, `/timeline`, `/timeline/*`
- 未認証で認証必須ページへアクセス: `/login`へリダイレクト
- 認証済みで`/login`または`/register`へアクセス: `/`へリダイレクト

## 実装反映チェックリスト

1. `beforeEach` の認証必須判定が `ThreadDetail` を含む current route と一致していることを確認する
2. `Route Name` を表記ゆれなく統一（`Users`, `Login`, `Register`, `Profile`, `Timeline`, `ThreadDetail`）
3. `FLOW_Navigation` と差分がないことを確認

## 今後対応すること

1. `ThreadDetail` 画面から参加者一覧を表示できるようにする（#42）
