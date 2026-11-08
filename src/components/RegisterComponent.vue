<template>
  <section class="shadcn-ui register-card">
    <h2>Register</h2>
    <p class="register-note">登録時に表示名を設定します。あとから編集する場所は Profile です。</p>

    <div class="field">
      <Label for="register-email">Email</Label>
      <Input id="register-email" v-model.trim="email" type="email" autocomplete="email" placeholder="Email" :disabled="isSubmitting" />
    </div>

    <div class="field">
      <Label for="register-password">Password</Label>
      <Input id="register-password" v-model="password" type="password" autocomplete="new-password" placeholder="Password" :disabled="isSubmitting" />
    </div>

    <div class="field">
      <Label for="register-display-name">Display Name</Label>
      <Input id="register-display-name" v-model.trim="displayName" type="text" autocomplete="nickname" maxlength="40" placeholder="表示名" :disabled="isSubmitting" />
    </div>

    <p v-if="errorMessage" class="message message--error" role="alert">{{ errorMessage }}</p>

    <Button class="w-full" size="lg" @click="register" :disabled="isSubmitting">
      {{ isSubmitting ? '登録中...' : 'Register' }}
    </Button>
  </section>
</template>

<script>
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { getAuthErrorMessage, getFirestoreErrorMessage, logFirebaseError } from '../utils/firebaseError';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default {
  components: { Button, Input, Label },
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

.message {
  margin: 0;
}

.message--error {
  color: #c62828;
}

</style>
