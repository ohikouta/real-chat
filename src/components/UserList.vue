<template>
  <section class="user-list">
    <div class="user-list__header">
      <div>
        <p class="user-list__kicker">Direct Messages</p>
        <h2>ユーザー一覧</h2>
      </div>
      <p class="user-list__note">表示名とアイコンは Profile 画面で編集できます。</p>
    </div>

    <p v-if="loadError" class="message message--error">{{ loadError }}</p>
    <p v-else-if="isLoading" class="message">ユーザーを読み込み中です...</p>
    <p v-else-if="users.length === 0" class="message">表示できるユーザーがいません。</p>

    <div v-else class="user-grid">
      <article v-for="user in users" :key="user.uid" class="user-card">
        <router-link :to="{ name: 'PrivateChat', params: { userId: user.uid } }" class="user-link">
          <img :src="user.profileImageUrl || defaultProfileImage" alt="Profile Image" class="profile-image" />
          <div class="user-card__body">
            <h3>{{ user.displayName }}</h3>
            <p>{{ user.email }}</p>
            <p v-if="user.latestMessage" class="latest-message">
              Last message: {{ user.latestMessage.text || user.latestMessage.content || 'メッセージあり' }}
            </p>
            <p class="status" :class="{ online: user.isOnline, offline: !user.isOnline }">
              {{ user.isOnline ? 'Online' : 'Offline' }}
            </p>
          </div>
        </router-link>
      </article>
    </div>
  </section>
</template>

<script>
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';
import defaultProfileImage from '@/assets/default-profile.png';
import { resolveDisplayName, resolveProfileImageUrl } from '../utils/userProfile';

export default {
  name: 'UserList',
  data() {
    return {
      users: [],
      isLoading: true,
      loadError: '',
      defaultProfileImage,
      unsubscribeUsers: null
    };
  },
  created() {
    this.unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      async (snapshot) => {
        try {
          const currentUserId = auth.currentUser?.uid;
          const nextUsers = await Promise.all(
            snapshot.docs
              .filter((docSnapshot) => docSnapshot.id !== currentUserId)
              .map(async (docSnapshot) => {
                const userData = docSnapshot.data();
                const latestMessageDoc = await getDoc(doc(db, `users/${docSnapshot.id}/messages`, 'latest'));

                return {
                  uid: docSnapshot.id,
                  email: userData.email || '',
                  displayName: resolveDisplayName(userData),
                  profileImageUrl: resolveProfileImageUrl(userData),
                  isOnline: Boolean(userData.isOnline),
                  latestMessage: latestMessageDoc.exists() ? latestMessageDoc.data() : null
                };
              })
          );

          this.users = nextUsers.sort((left, right) => {
            if (left.isOnline !== right.isOnline) {
              return left.isOnline ? -1 : 1;
            }

            return left.displayName.localeCompare(right.displayName, 'ja');
          });
          this.isLoading = false;
          this.loadError = '';
        } catch (error) {
          console.error('ユーザー一覧取得エラー:', error);
          this.loadError = 'ユーザー一覧の読み込みに失敗しました。';
          this.isLoading = false;
        }
      },
      (error) => {
        console.error('ユーザー購読エラー:', error);
        this.loadError = 'ユーザー一覧の購読に失敗しました。';
        this.isLoading = false;
      }
    );
  },
  beforeUnmount() {
    if (this.unsubscribeUsers) {
      this.unsubscribeUsers();
      this.unsubscribeUsers = null;
    }
  }
};
</script>

<style scoped>
.user-list {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  display: grid;
  gap: 20px;
}

.user-list__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
}

.user-list__kicker {
  margin: 0 0 8px;
  color: #35469c;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.user-list__header h2,
.user-list__note {
  margin: 0;
}

.user-list__note {
  color: #667085;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.user-card {
  border-radius: 16px;
  border: 1px solid #e4e7ec;
  background: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
}

.user-link {
  display: flex;
  gap: 14px;
  padding: 18px;
  color: inherit;
  text-decoration: none;
}

.profile-image {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 50%;
  background: #dbe1f3;
  flex-shrink: 0;
}

.user-card__body {
  min-width: 0;
}

.user-card__body h3,
.user-card__body p {
  margin: 0;
}

.user-card__body h3 {
  margin-bottom: 6px;
}

.user-card__body p {
  color: #667085;
}

.latest-message {
  margin-top: 10px;
}

.status {
  margin-top: 10px;
  font-weight: 700;
}

.online {
  color: #027a48;
}

.offline {
  color: #b54708;
}

.message {
  margin: 0;
}

.message--error {
  color: #c62828;
}
</style>
