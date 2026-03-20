import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, logEvent } from 'firebase/analytics'; // 追加
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig); // `initializeApp`を使用
const auth = getAuth(app);

// Firestoreのインスタンスを取得
const db = getFirestore(app);
const storage = getStorage(app);

// Optional: Analyticsの初期化
const analytics = getAnalytics(app);

// ページビューイベントを記録
logEvent(analytics, 'page_view');


export { db };
export { auth };
export { storage };
