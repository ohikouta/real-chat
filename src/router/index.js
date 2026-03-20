import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../firebaseConfig';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import ProfileView from '../views/ProfileView.vue';
import UsersView from '../views/UsersView.vue';
import PrivateChatView from '../views/PrivateChatView.vue';

let authReadyPromise;

function getAuthReady() {
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        unsubscribe();
        resolve();
      });
    });
  }

  return authReadyPromise;
}

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/login', name: 'Login', component: LoginView, meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { guestOnly: true } },
  { path: '/profile', name: 'Profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/users', name: 'Users', component: UsersView, meta: { requiresAuth: true } },
  { path: '/chat/:userId', name: 'PrivateChat', component: PrivateChatView, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach(async (to, from, next) => {
  await getAuthReady();

  const user = auth.currentUser;

  if (to.meta.requiresAuth && !user) {
    next('/login');
  } else if (to.meta.guestOnly && user) {
    next('/');
  } else {
    next();
  }
});

export default router;
