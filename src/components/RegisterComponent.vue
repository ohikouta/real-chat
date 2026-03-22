<template>
  <section class="register-card">
    <h2>Register</h2>
    <p class="register-note">登録時に表示名を設定します。あとから編集する場所は Profile です。</p>

    <label class="field">
      <span>Email</span>
      <input v-model.trim="email" type="email" placeholder="Email" />
    </label>

    <label class="field">
      <span>Password</span>
      <input v-model="password" type="password" placeholder="Password" />
    </label>

    <label class="field">
      <span>Display Name</span>
      <input v-model.trim="displayName" type="text" maxlength="40" placeholder="表示名" />
    </label>

    <p v-if="errorMessage" class="message message--error">{{ errorMessage }}</p>

    <button class="primary-button" @click="register" :disabled="isSubmitting">
      {{ isSubmitting ? '登録中...' : 'Register' }}
    </button>
  </section>
</template>

<script>
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { getAuthErrorMessage, getFirestoreErrorMessage, logFirebaseError } from '../utils/firebaseError';

export default {
  data() {
    return {
      email: '',
      password: '',
      displayName: '',
      isSubmitting: false,
      errorMessage: ''
    };
  },
  methods: {
    async register() {
      this.errorMessage = '';

      if (!this.email || !this.password || !this.displayName) {
        this.errorMessage = 'メールアドレス、パスワード、表示名は必須です。';
        return;
      }

      this.isSubmitting = true;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;
        const normalizedDisplayName = this.displayName.trim();

        await updateProfile(user, {
          displayName: normalizedDisplayName
        });

        await setDoc(doc(db, 'users', user.uid), {
          displayName: normalizedDisplayName,
          username: normalizedDisplayName,
          email: this.email,
          profileImageUrl: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        this.$router.push('/profile');
      } catch (error) {
        logFirebaseError('ユーザー登録', error);
        this.errorMessage = error?.code?.startsWith('auth/')
          ? getAuthErrorMessage(error, '登録に失敗しました。入力内容を確認して再度お試しください。')
          : getFirestoreErrorMessage(error, 'プロフィール初期化に失敗しました。時間を置いて再度お試しください。');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.register-card {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 20px;
  display: grid;
  gap: 16px;
}

.register-note {
  color: #667085;
  margin: 0;
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
