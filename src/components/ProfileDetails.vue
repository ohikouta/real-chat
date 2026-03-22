<template>
  <section class="profile-details">
    <header class="profile-header">
      <div>
        <p class="profile-kicker">Profile</p>
        <h2>プロフィール設定</h2>
        <p class="profile-note">表示名とアイコンはこの画面から編集します。</p>
      </div>
    </header>

    <template v-if="user">
      <section class="profile-summary">
        <img :src="previewImageUrl" alt="プロフィール画像" class="profile-avatar" />
        <div class="profile-summary__body">
          <p class="profile-name">{{ resolvedDisplayName }}</p>
          <p class="profile-email">{{ user.email }}</p>
          <p class="profile-meta">UID: {{ user.uid }}</p>
        </div>
      </section>

      <form class="profile-form" @submit.prevent="saveProfile">
        <label class="field">
          <span>表示名</span>
          <input
            v-model.trim="form.displayName"
            type="text"
            maxlength="40"
            placeholder="表示名を入力"
            @input="markDirty"
          />
        </label>

        <label class="field">
          <span>アイコン画像 URL</span>
          <input
            v-model.trim="form.profileImageUrl"
            type="url"
            placeholder="https://example.com/profile.png"
            @input="markDirty"
          />
          <small>画像 URL を直接指定できます。下のアップローダーを使っても反映されます。</small>
        </label>

        <div class="profile-upload">
          <p class="profile-upload__label">画像をアップロードする</p>
          <ImageUploader @imageUploaded="handleImageUploaded" />
        </div>

        <p v-if="message" class="message message--success">{{ message }}</p>
        <p v-if="errorMessage" class="message message--error">{{ errorMessage }}</p>

        <div class="actions">
          <button class="primary-button" type="submit" :disabled="isSaving">
            {{ isSaving ? '保存中...' : 'プロフィールを保存' }}
          </button>
        </div>
      </form>
    </template>

    <p v-else class="message">ログイン中のユーザー情報が見つかりません。</p>
  </section>
</template>

<script>
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import ImageUploader from './ImageUploader.vue';
import defaultProfileImage from '../assets/default-profile.png';
import { auth, db } from '../firebaseConfig';
import { getFirestoreErrorMessage, logFirebaseError } from '../utils/firebaseError';
import { resolveDisplayName, resolveProfileImageUrl } from '../utils/userProfile';

export default {
  name: 'ProfileDetails',
  components: {
    ImageUploader
  },
  data() {
    return {
      user: null,
      profile: null,
      form: {
        displayName: '',
        profileImageUrl: ''
      },
      isDirty: false,
      hasInitializedForm: false,
      isSaving: false,
      message: '',
      errorMessage: '',
      unsubscribeAuth: null,
      unsubscribeProfile: null,
      defaultProfileImage
    };
  },
  computed: {
    resolvedDisplayName() {
      return resolveDisplayName({
        displayName: this.form.displayName || this.profile?.displayName || this.user?.displayName,
        username: this.profile?.username,
        email: this.user?.email
      });
    },
    previewImageUrl() {
      return resolveProfileImageUrl({
        profileImageUrl: this.form.profileImageUrl || this.profile?.profileImageUrl
      }) || this.defaultProfileImage;
    }
  },
  created() {
    this.unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      this.user = user || null;
      this.profile = null;
      this.message = '';
      this.errorMessage = '';

      if (this.unsubscribeProfile) {
        this.unsubscribeProfile();
        this.unsubscribeProfile = null;
      }

      if (!user) {
        this.form.displayName = '';
        this.form.profileImageUrl = '';
        return;
      }

      this.form.displayName = user.displayName || '';
      this.form.profileImageUrl = '';

      this.unsubscribeProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (snapshot) => {
          const profileData = snapshot.exists() ? snapshot.data() : {};
          this.profile = profileData;
          if (!this.hasInitializedForm || !this.isDirty) {
            this.form.displayName = profileData.displayName || this.user?.displayName || '';
            this.form.profileImageUrl = resolveProfileImageUrl(profileData) || this.user?.photoURL || '';
            this.hasInitializedForm = true;
          }
        },
        (error) => {
          logFirebaseError('プロフィール取得', error);
          this.errorMessage = getFirestoreErrorMessage(error, 'プロフィール情報の読み込みに失敗しました。');
        }
      );
    });
  },
  beforeUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }

    if (this.unsubscribeProfile) {
      this.unsubscribeProfile();
      this.unsubscribeProfile = null;
    }
  },
  methods: {
    markDirty() {
      this.isDirty = true;
    },
    handleImageUploaded(url) {
      this.form.profileImageUrl = url;
      this.isDirty = true;
      this.message = 'アップロードした画像をフォームへ反映しました。保存すると確定します。';
      this.errorMessage = '';
    },
    async saveProfile() {
      this.message = '';
      this.errorMessage = '';

      if (!this.user) {
        this.errorMessage = 'プロフィールを保存するにはログインが必要です。';
        return;
      }

      if (!this.form.displayName.trim()) {
        this.errorMessage = '表示名は必須です。';
        return;
      }

      this.isSaving = true;

      try {
        const nextDisplayName = this.form.displayName.trim();
        const nextProfileImageUrl = this.form.profileImageUrl.trim();

        await updateProfile(this.user, {
          displayName: nextDisplayName,
          photoURL: nextProfileImageUrl || null
        });

        await setDoc(doc(db, 'users', this.user.uid), {
          displayName: nextDisplayName,
          username: nextDisplayName,
          email: this.user.email || '',
          profileImageUrl: nextProfileImageUrl,
          updatedAt: serverTimestamp()
        }, { merge: true });

        this.isDirty = false;
        this.message = 'プロフィールを更新しました。';
      } catch (error) {
        logFirebaseError('プロフィール更新', error);
        this.errorMessage = getFirestoreErrorMessage(error, 'プロフィール更新に失敗しました。時間を置いて再度お試しください。');
      } finally {
        this.isSaving = false;
      }
    }
  }
};
</script>

<style scoped>
.profile-details {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  display: grid;
  gap: 24px;
}

.profile-header h2,
.profile-name {
  margin: 0;
}

.profile-kicker {
  margin: 0 0 8px;
  color: #35469c;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.profile-note {
  color: #6b7280;
  margin: 8px 0 0;
}

.profile-summary {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 20px;
  border-radius: 18px;
  background: #f6f7fb;
}

.profile-avatar {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 50%;
  background: #dbe1f3;
}

.profile-summary__body {
  display: grid;
  gap: 6px;
}

.profile-email,
.profile-meta {
  margin: 0;
  color: #667085;
}

.profile-form {
  display: grid;
  gap: 18px;
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

.field small {
  color: #667085;
}

.profile-upload {
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #e4e7ec;
  background: #fff;
}

.profile-upload__label {
  margin: 0 0 12px;
  font-weight: 600;
}

.actions {
  display: flex;
  justify-content: flex-start;
}

.message {
  margin: 0;
}

.message--success {
  color: #027a48;
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
