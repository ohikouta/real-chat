export function logFirebaseError(context, error) {
  console.error(`[${context}]`, error);
}

export function getAuthErrorMessage(error, fallback = '認証に失敗しました。入力内容を確認して再度お試しください。') {
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません。';
    case 'auth/missing-password':
      return 'パスワードを入力してください。';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'メールアドレスまたはパスワードが正しくありません。';
    case 'auth/email-already-in-use':
      return 'そのメールアドレスはすでに使用されています。';
    case 'auth/weak-password':
      return 'パスワードは6文字以上で入力してください。';
    case 'auth/too-many-requests':
      return '試行回数が多すぎます。時間を置いて再度お試しください。';
    default:
      return fallback;
  }
}

export function getFirestoreErrorMessage(error, fallback = 'データの読み書きに失敗しました。時間を置いて再度お試しください。') {
  switch (error?.code) {
    case 'permission-denied':
      return 'この操作を実行する権限がありません。';
    case 'unavailable':
      return 'Firebase へ接続できませんでした。通信状態を確認して再度お試しください。';
    case 'failed-precondition':
      return '必要な設定が不足しているため処理を完了できませんでした。';
    case 'not-found':
      return '対象のデータが見つかりませんでした。';
    default:
      return fallback;
  }
}
