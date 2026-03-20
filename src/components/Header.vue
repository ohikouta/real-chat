<template>
  <header class="app-header">
    <div class="app-header__left">
      <router-link to="/" class="brand">Real Chat</router-link>
      <nav class="nav">
        <router-link to="/" class="nav__link">Home</router-link>
        <router-link to="/users" class="nav__link">Users</router-link>
        <router-link to="/profile" class="nav__link">Profile</router-link>
      </nav>
    </div>

    <div class="app-header__right">
      <div v-if="user" class="user-info">
        <span class="user-info__name">{{ displayName }}</span>
        <button class="btn ghost" @click="handleSignOut">Logout</button>
      </div>
      <div v-else class="auth-actions">
        <router-link to="/login" class="btn primary">Login</router-link>
        <router-link to="/register" class="btn ghost">Register</router-link>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default {
  name: 'Header',
  setup() {
    const router = useRouter();
    const user = ref(null);
    let unsubscribe = null;

    onMounted(() => {
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
      });
    });

    onBeforeUnmount(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });

    const displayName = computed(() => {
      if (!user.value) return '';
      return user.value.displayName || user.value.email || 'User';
    });

    const handleSignOut = async () => {
      try {
        if (user.value) {
          const userDocRef = doc(db, 'users', user.value.uid);
          await updateDoc(userDocRef, { isOnline: false });
        }
      } catch (error) {
        console.error('Failed to update user status on sign out:', error);
      }

      try {
        await signOut(auth);
        router.push('/');
      } catch (error) {
        console.error('Failed to sign out:', error);
      }
    };

    return {
      user,
      displayName,
      handleSignOut
    };
  }
};
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e5e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.app-header__left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.brand {
  font-weight: 700;
  color: #35469c;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 12px;
}

.nav__link {
  color: #4a4a4a;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 8px;
}

.nav__link.router-link-active {
  background: #eef1ff;
  color: #35469c;
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4a4a4a;
}

.user-info__name {
  font-weight: 600;
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
}

.btn.primary {
  background: #5a6bea;
  color: #fff;
  border-color: #5a6bea;
}

.btn.ghost {
  background: transparent;
  color: #5a6bea;
  border-color: #5a6bea;
}
</style>
