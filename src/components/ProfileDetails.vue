<template>
  <div class="profile-details">
    <h2>Profile</h2>
    <template v-if="user">
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>UID:</strong> {{ user.uid }}</p>
      <p class="profile-note">プロフィール編集導線はこの画面に集約します。</p>
    </template>
    <p v-else>No user is logged in</p>
  </div>
</template>

<script>
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default {
  name: 'ProfileDetails',
  data() {
    return {
      user: null,
      unsubscribeAuth: null
    };
  },
  created() {
    this.unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
      }
    });
  },
  beforeUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
  }
};
</script>

<style scoped>
.profile-details {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 20px;
}

.profile-note {
  color: #6b7280;
}
</style>
