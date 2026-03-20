<template>
  <div class="chat-view">
    <div v-if="currentUser">
      <UserList />
    </div>
    <div v-else>
      <LandingHero @login="goToLogin" @register="goToRegister"/>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import UserList from '../components/UserList.vue';
import LandingHero from '../components/LandingHero.vue';

export default {
  components: {
    UserList,
    LandingHero
  },
  setup() {
    const router = useRouter();
    const goToLogin = () => router.push('/login');
    const goToRegister = () => router.push('/register');
    const currentUser = ref(null);
    let unsubscribe = null;

    onMounted(() => {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        currentUser.value = user;
      });
    });

    onBeforeUnmount(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });

    return {
      goToLogin,
      goToRegister,
      currentUser
    };
  }
};
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
