<template>
  <section class="login-card">
    <h2>Login</h2>
    <p class="login-note">ログイン情報を入力してください。</p>

    <label class="field">
      <span>Email</span>
      <input v-model.trim="email" type="email" placeholder="Email" />
    </label>

    <label class="field">
      <span>Password</span>
      <input v-model="password" type="password" placeholder="Password" />
    </label>

    <p v-if="errorMessage" class="message message--error">{{ errorMessage }}</p>

    <button class="primary-button" @click="login" :disabled="isSubmitting">
      {{ isSubmitting ? 'ログイン中...' : 'Login' }}
    </button>
  </section>
</template>

<script>
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { getAuthErrorMessage, getFirestoreErrorMessage, logFirebaseError } from '../utils/firebaseError';

export default {
  data() {
    return {
      email: '',
      password: '',
      isSubmitting: false,
      errorMessage: ''
    };
  },
  methods: {
    async login() {
      this.errorMessage = '';

      if (!this.email || !this.password) {
        this.errorMessage = 'メールアドレスとパスワードを入力してください。';
        return;
      }

      this.isSubmitting = true;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email || this.email,
            isOnline: true
          }, { merge: true });
        } catch (error) {
          logFirebaseError('ログイン後のユーザー状態更新', error);
          this.errorMessage = getFirestoreErrorMessage(error, 'ログイン状態の同期に失敗しました。再度ログインしてください。');
          await signOut(auth);
          return;
        }

        this.$router.push({ name: 'Home' });
      } catch (error) {
        logFirebaseError('ログイン', error);
        this.errorMessage = getAuthErrorMessage(error, 'ログインに失敗しました。入力内容を確認して再度お試しください。');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.login-card {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 20px;
  display: grid;
  gap: 16px;
}

.login-note {
  margin: 0;
  color: #667085;
}

.field {
  display: grid;
  gap: 8px;
}

.field input {
  border: 1px solid #d0d5dd;
  border-radius: 10px;
  padding: 12px 14px;
}

.message {
  margin: 0;
}

.message--error {
  color: #c62828;
}

.primary-button {
  border: none;
  border-radius: 10px;
  background: #35469c;
  color: #fff;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
