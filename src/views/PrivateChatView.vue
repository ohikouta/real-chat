<template>
  <section class="chat-wrapper">
    <div class="chat-container">
      <div class="chat-topbar">
        <button @click="goToHome" class="home-button">一覧へ戻る</button>
        <p class="chat-caption">Direct Messages</p>
      </div>

      <div class="chat-header">
        <div>
          <p class="chat-kicker">1:1 Chat</p>
          <h2>{{ chatPartnerName }}とのDM</h2>
        </div>
        <p v-if="loadError" class="message message--error">{{ loadError }}</p>
      </div>

      <div class="messages" ref="messagesContainer">
        <p v-if="isLoading" class="message">メッセージを読み込み中です...</p>
        <p v-else-if="messages.length === 0" class="message">
          まだメッセージはありません。最初のDMを送ってみましょう。
        </p>

        <div
          v-for="message in messages"
          :key="message.id"
          class="message-bubble"
          :class="{
            'my-message': message.senderId === currentUser?.uid,
            'other-message': message.senderId !== currentUser?.uid
          }"
        >
          <p class="message-author">{{ message.senderName }}</p>
          <p class="message-text">{{ message.text }}</p>
          <small class="timestamp">{{ formatTimestamp(message.createdAt) }}</small>
        </div>
      </div>

      <p v-if="sendError" class="message message--error">{{ sendError }}</p>
      <div class="composer-shell">
        <MessageInput @send-message="sendMessage" />
      </div>
    </div>
  </section>
</template>

<script>
import { nextTick } from 'vue';
import { getAuth } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore';
import MessageInput from '../components/MessageInput.vue';
import { db } from '../firebaseConfig';
import { resolveDisplayName } from '../utils/userProfile';

function generateChatId(userId1, userId2) {
  if (!userId1 || !userId2) {
    throw new Error('chatId の生成には 2 つの UID が必要です');
  }

  const [uidA, uidB] = [String(userId1), String(userId2)].sort();

  if (uidA === uidB) {
    throw new Error('同一ユーザー間の chatId は生成できません');
  }

  return `dm:v1:${uidA.length}:${uidA}|${uidB.length}:${uidB}`;
}

export default {
  name: 'PrivateChatView',
  components: {
    MessageInput
  },
  data() {
    return {
      messages: [],
      currentUser: null,
      chatPartnerId: '',
      chatPartnerName: '相手ユーザー',
      isLoading: true,
      loadError: '',
      sendError: '',
      unsubscribeMessages: null
    };
  },
  async created() {
    this.currentUser = getAuth().currentUser;
    await this.loadChat(this.$route.params.userId);
  },
  beforeUnmount() {
    if (this.unsubscribeMessages) {
      this.unsubscribeMessages();
    }
  },
  watch: {
    '$route.params.userId': {
      async handler(nextUserId) {
        if (this.currentUser) {
          await this.loadChat(nextUserId);
        }
      }
    }
  },
  methods: {
    resetChatState() {
      this.messages = [];
      this.chatPartnerName = '相手ユーザー';
      this.isLoading = true;
      this.loadError = '';
      this.sendError = '';
    },

    async loadChat(nextUserId) {
      this.chatPartnerId = nextUserId || '';
      if (this.unsubscribeMessages) {
        this.unsubscribeMessages();
        this.unsubscribeMessages = null;
      }

      this.resetChatState();

      if (!this.currentUser || !this.chatPartnerId) {
        this.loadError = 'DMを開くためのユーザー情報が不足しています。';
        this.isLoading = false;
        return;
      }

      if (this.currentUser.uid === this.chatPartnerId) {
        this.chatPartnerName = '自分自身';
        this.loadError = '自分自身とのDMは開けません。';
        this.isLoading = false;
        return;
      }

      await this.fetchChatPartnerName();
      this.subscribeMessages();
    },

    currentChatId() {
      return generateChatId(this.currentUser.uid, this.chatPartnerId);
    },

    subscribeMessages() {
      const messagesQuery = query(
        collection(db, 'directMessages'),
        where('chatId', '==', this.currentChatId()),
        orderBy('createdAt', 'asc')
      );

      this.unsubscribeMessages = onSnapshot(
        messagesQuery,
        (snapshot) => {
          this.messages = snapshot.docs.map((messageDoc) => {
            const data = messageDoc.data();

            return {
              id: messageDoc.id,
              text: data.text || '',
              senderId: data.senderId || '',
              senderName: data.senderName || '匿名ユーザー',
              receiverId: data.receiverId || '',
              chatId: data.chatId || '',
              createdAt: data.createdAt || null
            };
          });
          this.isLoading = false;
          this.loadError = '';
          this.scrollToBottom();
        },
        (error) => {
          console.error('DM読み込みエラー:', error);
          this.loadError = 'DMの読み込みに失敗しました。時間を置いて再度お試しください。';
          this.isLoading = false;
        }
      );
    },

    goToHome() {
      this.$router.push('/');
    },

    async fetchChatPartnerName() {
      try {
        const userDoc = await getDoc(doc(db, 'users', this.chatPartnerId));

        if (!userDoc.exists()) {
          this.chatPartnerName = 'Unknown User';
          return;
        }

        const userData = userDoc.data();
        this.chatPartnerName = resolveDisplayName(userData);
      } catch (error) {
        console.error('チャット相手取得エラー:', error);
        this.chatPartnerName = 'Unknown User';
      }
    },

    async resolveSenderName() {
      try {
        const userSnap = await getDoc(doc(db, 'users', this.currentUser.uid));
        if (!userSnap.exists()) {
          return resolveDisplayName({
            displayName: this.currentUser.displayName,
            email: this.currentUser.email
          });
        }

        const userData = userSnap.data();
        return resolveDisplayName({
          displayName: userData.displayName || this.currentUser.displayName,
          username: userData.username,
          email: userData.email || this.currentUser.email
        });
      } catch (error) {
        console.error('送信者名取得エラー:', error);
        return resolveDisplayName({
          displayName: this.currentUser.displayName,
          email: this.currentUser.email
        });
      }
    },

    async sendMessage(messageText) {
      this.sendError = '';

      if (!this.currentUser) {
        this.sendError = '送信するにはログインが必要です。';
        return;
      }

      const trimmedMessage = messageText.trim();
      if (!trimmedMessage) {
        this.sendError = 'メッセージを入力してください。';
        return;
      }

      try {
        const senderName = await this.resolveSenderName();

        await addDoc(collection(db, 'directMessages'), {
          text: trimmedMessage,
          senderId: this.currentUser.uid,
          senderName,
          receiverId: this.chatPartnerId,
          chatId: this.currentChatId(),
          createdAt: serverTimestamp()
        });

        this.scrollToBottom();
      } catch (error) {
        console.error('メッセージ送信エラー:', error);
        this.sendError = 'メッセージ送信に失敗しました。時間を置いて再度お試しください。';
      }
    },

    formatTimestamp(timestamp) {
      if (!timestamp?.toDate) {
        return '送信直後';
      }

      const date = timestamp.toDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },

    scrollToBottom() {
      nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }
};
</script>

<style scoped>
.chat-wrapper {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(125, 211, 252, 0.35), transparent 30%),
    linear-gradient(180deg, #f8fbff 0%, #edf4fb 100%);
}

.chat-container {
  display: grid;
  gap: 18px;
  width: min(960px, 100%);
  min-height: calc(100vh - 48px);
  margin: 0 auto;
  padding: 22px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 28px;
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(12px);
}

.chat-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.chat-caption {
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #64748b;
}

.chat-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 4px 0;
}

.chat-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.35rem, 2vw, 1.8rem);
}

.chat-kicker {
  margin: 0 0 6px;
  color: #475569;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.messages {
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 360px;
  max-height: 60vh;
  padding: 22px 18px;
  overflow-y: auto;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(241, 245, 249, 0.92)),
    linear-gradient(135deg, rgba(191, 219, 254, 0.28), rgba(226, 232, 240, 0.2));
  border: 1px solid rgba(148, 163, 184, 0.22);
}

.message-bubble {
  display: grid;
  gap: 8px;
  max-width: min(75%, 520px);
  padding: 14px 16px 12px;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.my-message {
  justify-self: end;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #f8fafc;
  border-bottom-right-radius: 8px;
}

.other-message {
  justify-self: start;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-bottom-left-radius: 8px;
}

.message-author,
.message-text,
.message {
  margin: 0;
}

.message-author {
  font-weight: 700;
  color: inherit;
  opacity: 0.85;
}

.message-text {
  color: inherit;
  white-space: pre-wrap;
  line-height: 1.6;
}

.timestamp {
  color: inherit;
  opacity: 0.7;
  text-align: right;
}

.composer-shell {
  padding: 6px 0 0;
}

.home-button {
  padding: 10px 16px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #0f172a;
  font-weight: 700;
  cursor: pointer;
}

.home-button:hover {
  background: #ffffff;
}

.message {
  color: #64748b;
}

.message--error {
  color: #c0364b;
}

@media (max-width: 640px) {
  .chat-wrapper {
    padding: 12px;
  }

  .chat-container {
    min-height: calc(100vh - 24px);
    padding: 16px;
    border-radius: 20px;
  }

  .chat-topbar,
  .chat-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .message-bubble {
    max-width: 100%;
  }
}
</style>
