<template>
  <section class="thread-detail-view">
    <div class="thread-detail-shell">
      <router-link class="back-link" :to="{ name: 'Timeline' }">
        ← Timeline に戻る
      </router-link>

      <p v-if="threadError" class="message message--error">{{ threadError }}</p>
      <article v-else-if="thread" class="thread-card">
        <div class="thread-meta">
          <span class="thread-author">{{ thread.authorName }}</span>
          <span>{{ formatDate(thread.createdAt) }}</span>
        </div>
        <h1>{{ thread.title }}</h1>
        <p class="thread-body">{{ thread.body }}</p>
        <ul v-if="thread.tags.length" class="tag-list">
          <li v-for="tag in thread.tags" :key="tag" class="tag-chip">#{{ tag }}</li>
        </ul>
      </article>
      <p v-else class="message">スレッドを読み込み中です...</p>

      <section v-if="thread" class="participants-section">
        <div class="participants-section__header">
          <h2>参加者</h2>
          <p class="participants-section__count">{{ participants.length }}人</p>
        </div>

        <p v-if="commentsLoading" class="message">コメント参加者を読み込み中です...</p>
        <ul v-else class="participant-list">
          <li v-for="participant in participants" :key="participant.key" class="participant-card">
            <p class="participant-name">{{ participant.name }}</p>
            <div class="participant-badges">
              <span v-if="participant.isThreadAuthor" class="participant-badge">投稿者</span>
              <span v-if="participant.commentCount > 0" class="participant-badge participant-badge--subtle">
                コメント {{ participant.commentCount }}件
              </span>
            </div>
          </li>
        </ul>
      </section>

      <section class="comment-composer">
        <h2>コメントを投稿</h2>
        <form @submit.prevent="submitComment" class="comment-form">
          <label class="field">
            <span>コメント本文</span>
            <textarea
              v-model.trim="commentBody"
              rows="5"
              maxlength="2000"
              placeholder="状況の補足や回答を書いてください"
            />
          </label>

          <p v-if="commentError" class="message message--error">{{ commentError }}</p>

          <div class="comment-actions">
            <button
              type="submit"
              class="primary-button"
              :disabled="isSubmittingComment || !canSubmitComment"
            >
              {{ isSubmittingComment ? '投稿中...' : 'コメントする' }}
            </button>
          </div>
        </form>
      </section>

      <section class="comments-section">
        <div class="comments-section__header">
          <h2>コメント一覧</h2>
          <p v-if="commentsLoading" class="message">読み込み中です...</p>
        </div>

        <p v-if="commentsError" class="message message--error">{{ commentsError }}</p>
        <p v-else-if="!commentsLoading && comments.length === 0" class="message">
          まだコメントはありません。
        </p>

        <ul v-else class="comment-list">
          <li v-for="comment in comments" :key="comment.id" class="comment-card">
            <div class="comment-meta">
              <span class="comment-author">{{ comment.authorName }}</span>
              <span>{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p class="comment-body">{{ comment.body }}</p>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<script>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useRoute } from 'vue-router';
import { auth, db } from '../firebaseConfig';

export default {
  name: 'ThreadDetailView',
  setup() {
    const route = useRoute();
    const thread = ref(null);
    const comments = ref([]);
    const commentBody = ref('');
    const threadError = ref('');
    const commentsError = ref('');
    const commentError = ref('');
    const commentsLoading = ref(true);
    const isSubmittingComment = ref(false);
    let unsubscribeThread = null;
    let unsubscribeComments = null;

    const canSubmitComment = computed(() => {
      return Boolean(thread.value) && !threadError.value;
    });

    const participants = computed(() => {
      const participantMap = new Map();

      const upsertParticipant = ({ userId, name, isThreadAuthor = false, isCommentAuthor = false }) => {
        const normalizedName = name || '匿名ユーザー';
        const key = userId ? `user:${userId}` : `name:${normalizedName}`;
        const current = participantMap.get(key) || {
          key,
          userId: userId || '',
          name: normalizedName,
          isThreadAuthor: false,
          commentCount: 0
        };

        current.isThreadAuthor = current.isThreadAuthor || isThreadAuthor;
        if (!current.userId && userId) {
          current.userId = userId;
        }
        if (current.name === '匿名ユーザー' && normalizedName !== '匿名ユーザー') {
          current.name = normalizedName;
        }
        if (isCommentAuthor) {
          current.commentCount += 1;
        }

        participantMap.set(key, current);
      };

      if (thread.value) {
        upsertParticipant({
          userId: thread.value.authorId,
          name: thread.value.authorName,
          isThreadAuthor: true
        });
      }

      comments.value.forEach((comment) => {
        upsertParticipant({
          userId: comment.authorId,
          name: comment.authorName,
          isCommentAuthor: true
        });
      });

      return Array.from(participantMap.values()).sort((left, right) => {
        if (left.isThreadAuthor !== right.isThreadAuthor) {
          return left.isThreadAuthor ? -1 : 1;
        }

        if (left.commentCount !== right.commentCount) {
          return right.commentCount - left.commentCount;
        }

        return left.name.localeCompare(right.name, 'ja');
      });
    });

    const cleanupSubscriptions = () => {
      if (unsubscribeThread) {
        unsubscribeThread();
        unsubscribeThread = null;
      }

      if (unsubscribeComments) {
        unsubscribeComments();
        unsubscribeComments = null;
      }
    };

    const resetThreadState = () => {
      thread.value = null;
      comments.value = [];
      threadError.value = '';
      commentsError.value = '';
      commentError.value = '';
      commentsLoading.value = true;
    };

    const loadThread = (threadId) => {
      unsubscribeThread = onSnapshot(
        doc(db, 'threads', threadId),
        (snapshot) => {
          if (!snapshot.exists()) {
            thread.value = null;
            threadError.value = '対象のスレッドが見つかりません。';
            return;
          }

          const data = snapshot.data();
          thread.value = {
            id: snapshot.id,
            title: data.title || '',
            body: data.body || '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            authorId: data.authorId || '',
            authorName: data.authorName || '匿名ユーザー',
            createdAt: data.createdAt || null
          };
          threadError.value = '';
        },
        (error) => {
          console.error('Failed to load thread detail:', error);
          threadError.value = 'スレッド詳細の読み込みに失敗しました。';
        }
      );
    };

    const loadComments = (threadId) => {
      const commentsQuery = query(
        collection(db, 'threads', threadId, 'comments'),
        orderBy('createdAt', 'asc')
      );

      unsubscribeComments = onSnapshot(
        commentsQuery,
        (snapshot) => {
          comments.value = snapshot.docs.map((commentDoc) => {
            const data = commentDoc.data();

            return {
              id: commentDoc.id,
              body: data.body || '',
              authorId: data.authorId || '',
              authorName: data.authorName || '匿名ユーザー',
              createdAt: data.createdAt || null
            };
          });
          commentsLoading.value = false;
          commentsError.value = '';
        },
        (error) => {
          console.error('Failed to load comments:', error);
          commentsError.value = 'コメント一覧の読み込みに失敗しました。';
          commentsLoading.value = false;
        }
      );
    };

    const subscribeThreadDetail = (threadId) => {
      cleanupSubscriptions();
      resetThreadState();
      loadThread(threadId);
      loadComments(threadId);
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
        console.error('Failed to resolve comment author profile:', error);
        return user.email || '匿名ユーザー';
      }
    };

    const submitComment = async () => {
      commentError.value = '';

      if (!commentBody.value.trim()) {
        commentError.value = 'コメント本文は必須です。';
        return;
      }

      if (!canSubmitComment.value) {
        commentError.value = '存在しないスレッドにはコメントできません。';
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        commentError.value = 'コメントするにはログインが必要です。';
        return;
      }

      isSubmittingComment.value = true;

      try {
        const authorName = await resolveAuthorName(currentUser);

        await addDoc(collection(db, 'threads', route.params.postId, 'comments'), {
          body: commentBody.value.trim(),
          authorId: currentUser.uid,
          authorName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        commentBody.value = '';
      } catch (error) {
        console.error('Failed to create comment:', error);
        commentError.value = 'コメント投稿に失敗しました。時間を置いて再度お試しください。';
      } finally {
        isSubmittingComment.value = false;
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

    watch(
      () => route.params.postId,
      (threadId) => {
        if (!threadId) {
          cleanupSubscriptions();
          resetThreadState();
          threadError.value = '対象のスレッドが見つかりません。';
          return;
        }

        subscribeThreadDetail(threadId);
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      cleanupSubscriptions();
    });

    return {
      thread,
      comments,
      participants,
      commentBody,
      threadError,
      commentsError,
      commentError,
      commentsLoading,
      isSubmittingComment,
      canSubmitComment,
      submitComment,
      formatDate
    };
  }
};
</script>

<style scoped>
.thread-detail-view {
  padding: 32px 20px 48px;
}

.thread-detail-shell {
  max-width: 920px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.back-link {
  color: #4c5dd8;
  font-weight: 700;
  text-decoration: none;
}

.thread-card,
.comment-composer,
.comment-card {
  background: #ffffff;
  border: 1px solid #e6e8f2;
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(31, 41, 55, 0.05);
}

.thread-card,
.comment-composer {
  padding: 28px;
}

.participants-section {
  display: grid;
  gap: 16px;
  padding: 28px;
  background: #f6f8ff;
  border: 1px solid #dbe2ff;
  border-radius: 20px;
}

.thread-meta,
.comment-meta,
.comments-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.participants-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.thread-author,
.comment-author {
  font-weight: 700;
  color: #35469c;
}

.participants-section__count {
  margin: 0;
  color: #667085;
}

.thread-card h1,
.participants-section h2,
.comment-composer h2,
.comments-section h2 {
  margin: 0;
}

.thread-body,
.comment-body {
  margin: 16px 0 0;
  line-height: 1.75;
  color: #445067;
  white-space: pre-wrap;
}

.comment-form {
  display: grid;
  gap: 16px;
  margin-top: 18px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  font-weight: 600;
  color: #2f3850;
}

.field textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #cfd6e6;
  border-radius: 12px;
  font: inherit;
  color: #243046;
  background: #fbfcff;
  box-sizing: border-box;
  resize: vertical;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.primary-button {
  min-width: 160px;
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

.comments-section {
  display: grid;
  gap: 16px;
}

.participant-list,
.comment-list,
.tag-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.participant-list,
.comment-list {
  display: grid;
  gap: 16px;
}

.participant-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #dbe2ff;
}

.comment-card {
  padding: 22px;
}

.participant-name {
  margin: 0;
  font-weight: 700;
  color: #243046;
}

.participant-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.participant-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #4c5dd8;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
}

.participant-badge--subtle {
  background: #eef1ff;
  color: #4c5dd8;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.tag-chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef1ff;
  color: #4c5dd8;
  font-size: 13px;
  font-weight: 600;
}

.message {
  margin: 0;
  color: #667085;
}

.message--error {
  color: #c0364b;
}

@media (max-width: 640px) {
  .thread-detail-view {
    padding: 20px 14px 32px;
  }

  .thread-card,
  .participants-section,
  .comment-composer,
  .comment-card {
    padding: 20px;
  }

  .thread-meta,
  .participants-section__header,
  .participant-card,
  .comment-meta,
  .comments-section__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .participant-badges {
    justify-content: flex-start;
  }

  .comment-actions {
    justify-content: stretch;
  }

  .primary-button {
    width: 100%;
  }
}
</style>
