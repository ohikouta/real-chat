<template>
  <section class="timeline-view">
    <div class="timeline-shell">
      <header class="timeline-header">
        <div>
          <p class="timeline-kicker">相談投稿</p>
          <h1>Timeline</h1>
          <p class="timeline-description">
            学習中に詰まったことや相談したいことを、タイトルと本文で投稿できます。
          </p>
        </div>
      </header>

      <section class="composer-card">
        <h2>新しい相談を投稿</h2>
        <form class="composer-form" @submit.prevent="submitThread">
          <label class="field">
            <span>タイトル</span>
            <input
              v-model.trim="form.title"
              type="text"
              maxlength="120"
              placeholder="例: Firestore のクエリ設計で詰まっています"
            />
          </label>

          <label class="field">
            <span>本文</span>
            <textarea
              v-model.trim="form.body"
              rows="6"
              maxlength="2000"
              placeholder="状況、試したこと、困っている点を書いてください"
            />
          </label>

          <label class="field">
            <span>タグ</span>
            <input
              v-model="form.tags"
              type="text"
              placeholder="vue, firebase, firestore"
            />
            <small>カンマ区切りで入力します。</small>
          </label>

          <p v-if="submitError" class="message message--error">{{ submitError }}</p>

          <div class="composer-actions">
            <button class="primary-button" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? '投稿中...' : '投稿する' }}
            </button>
          </div>
        </form>
      </section>

      <section class="threads-section">
        <div class="threads-section__header">
          <h2>新着の相談</h2>
          <p v-if="isLoading" class="message">読み込み中です...</p>
        </div>

        <p v-if="loadError" class="message message--error">{{ loadError }}</p>
        <p v-else-if="!isLoading && threads.length === 0" class="empty-state">
          まだ相談投稿はありません。
        </p>

        <ul v-else class="thread-list">
          <li v-for="thread in threads" :key="thread.id" class="thread-card">
            <div class="thread-card__meta">
              <span class="thread-card__author">{{ thread.authorName }}</span>
              <span>{{ formatDate(thread.createdAt) }}</span>
            </div>
            <div class="thread-card__header">
              <h3>{{ thread.title }}</h3>
              <router-link
                class="thread-card__link"
                :to="{ name: 'ThreadDetail', params: { postId: thread.id } }"
                :aria-label="`${thread.title} の詳細を見る`"
              >
                詳細を見る
              </router-link>
            </div>
            <p class="thread-card__body">{{ thread.body }}</p>
            <ul v-if="thread.tags.length" class="tag-list">
              <li v-for="tag in thread.tags" :key="tag" class="tag-chip">#{{ tag }}</li>
            </ul>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

function normalizeTags(rawTags) {
  return rawTags
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, '').toLowerCase())
    .filter((tag, index, array) => tag && array.indexOf(tag) === index);
}

export default {
  name: 'TimelineView',
  setup() {
    const form = reactive({
      title: '',
      body: '',
      tags: ''
    });
    const threads = ref([]);
    const isLoading = ref(true);
    const isSubmitting = ref(false);
    const submitError = ref('');
    const loadError = ref('');
    let unsubscribeThreads = null;

    const canSubmit = computed(() => {
      return form.title.trim() && form.body.trim();
    });

    const resetForm = () => {
      form.title = '';
      form.body = '';
      form.tags = '';
    };

    const loadThreads = () => {
      const threadsQuery = query(collection(db, 'threads'), orderBy('createdAt', 'desc'));

      unsubscribeThreads = onSnapshot(
        threadsQuery,
        (snapshot) => {
          threads.value = snapshot.docs.map((threadDoc) => {
            const data = threadDoc.data();

            return {
              id: threadDoc.id,
              title: data.title || '',
              body: data.body || '',
              tags: Array.isArray(data.tags) ? data.tags : [],
              authorName: data.authorName || '匿名ユーザー',
              createdAt: data.createdAt || null
            };
          });
          isLoading.value = false;
          loadError.value = '';
        },
        (error) => {
          console.error('Failed to load threads:', error);
          loadError.value = '相談一覧の読み込みに失敗しました。時間を置いて再度お試しください。';
          isLoading.value = false;
        }
      );
    };

    const resolveAuthorName = async (user) => {
      if (user.displayName) {
        return user.displayName;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          return user.email || '匿名ユーザー';
        }

        const userData = userDoc.data();
        return userData.username || userData.email || user.email || '匿名ユーザー';
      } catch (error) {
        console.error('Failed to resolve author profile:', error);
        return user.email || '匿名ユーザー';
      }
    };

    const submitThread = async () => {
      submitError.value = '';

      if (!canSubmit.value) {
        submitError.value = 'タイトルと本文は必須です。';
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        submitError.value = '投稿するにはログインが必要です。';
        return;
      }

      isSubmitting.value = true;

      try {
        const authorName = await resolveAuthorName(currentUser);

        await addDoc(collection(db, 'threads'), {
          title: form.title.trim(),
          body: form.body.trim(),
          tags: normalizeTags(form.tags),
          authorId: currentUser.uid,
          authorName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        resetForm();
      } catch (error) {
        console.error('Failed to create thread:', error);
        submitError.value = '相談投稿に失敗しました。入力内容を確認して再度お試しください。';
      } finally {
        isSubmitting.value = false;
      }
    };

    const formatDate = (timestamp) => {
      if (!timestamp?.toDate) {
        return '投稿直後';
      }

      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(timestamp.toDate());
    };

    onMounted(() => {
      loadThreads();
    });

    onBeforeUnmount(() => {
      if (unsubscribeThreads) {
        unsubscribeThreads();
      }
    });

    return {
      form,
      threads,
      isLoading,
      isSubmitting,
      submitError,
      loadError,
      submitThread,
      formatDate
    };
  }
};
</script>

<style scoped>
.timeline-view {
  padding: 32px 20px 48px;
}

.timeline-shell {
  max-width: 920px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.timeline-header,
.composer-card,
.thread-card {
  background: #ffffff;
  border: 1px solid #e6e8f2;
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(31, 41, 55, 0.05);
}

.timeline-header {
  padding: 28px;
}

.timeline-kicker {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5a6bea;
}

.timeline-header h1,
.composer-card h2,
.threads-section h2,
.thread-card h3 {
  margin: 0;
}

.timeline-description {
  margin: 12px 0 0;
  line-height: 1.7;
  color: #5b6475;
}

.composer-card {
  padding: 28px;
}

.composer-form {
  display: grid;
  gap: 18px;
  margin-top: 20px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  font-weight: 600;
  color: #2f3850;
}

.field input,
.field textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #cfd6e6;
  border-radius: 12px;
  font: inherit;
  color: #243046;
  background: #fbfcff;
  box-sizing: border-box;
}

.field textarea {
  resize: vertical;
}

.field small {
  color: #72809b;
}

.composer-actions {
  display: flex;
  justify-content: flex-end;
}

.primary-button {
  min-width: 140px;
  padding: 12px 18px;
  border: none;
  border-radius: 12px;
  background: #5a6bea;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: default;
}

.threads-section {
  display: grid;
  gap: 16px;
}

.threads-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.thread-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 16px;
}

.thread-card {
  padding: 22px;
}

.thread-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.thread-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #6c7891;
}

.thread-card__author {
  font-weight: 700;
  color: #35469c;
}

.thread-card__link {
  flex-shrink: 0;
  color: #4c5dd8;
  font-weight: 700;
  text-decoration: none;
}

.thread-card__body {
  margin: 12px 0 0;
  line-height: 1.7;
  color: #445067;
  white-space: pre-wrap;
}

.tag-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 16px 0 0;
}

.tag-chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef1ff;
  color: #4c5dd8;
  font-size: 13px;
  font-weight: 600;
}

.message,
.empty-state {
  margin: 0;
  color: #667085;
}

.message--error {
  color: #c0364b;
}

@media (max-width: 640px) {
  .timeline-view {
    padding: 20px 14px 32px;
  }

  .timeline-header,
  .composer-card,
  .thread-card {
    padding: 20px;
  }

  .threads-section__header,
  .thread-card__meta,
  .thread-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .composer-actions {
    justify-content: stretch;
  }

  .primary-button {
    width: 100%;
  }
}
</style>
