<template>
  <section class="chat-wrapper">
    <button @click="goToHome" class="home-button">Home</button>

    <div class="chat-container">
      <div class="chat-header">
        <h2>{{ chatPartnerName }}とのDM</h2>
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
      <MessageInput @send-message="sendMessage" />
    </div>
  </section>
</template>

<script>
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
    this.chatPartnerId = this.$route.params.userId;

    if (!this.currentUser || !this.chatPartnerId) {
      this.loadError = 'DMを開くためのユーザー情報が不足しています。';
      this.isLoading = false;
      return;
    }

    await this.fetchChatPartnerName();
    this.subscribeMessages();
  },
  beforeUnmount() {
    if (this.unsubscribeMessages) {
      this.unsubscribeMessages();
    }
  },
  methods: {
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
        this.chatPartnerName = userData.username || userData.email || '匿名ユーザー';
      } catch (error) {
        console.error('チャット相手取得エラー:', error);
        this.chatPartnerName = 'Unknown User';
      }
    },

    async resolveSenderName() {
      if (this.currentUser.displayName) {
        return this.currentUser.displayName;
      }

      try {
        const userSnap = await getDoc(doc(db, 'users', this.currentUser.uid));
        if (!userSnap.exists()) {
          return this.currentUser.email || '匿名ユーザー';
        }

        const userData = userSnap.data();
        return userData.username || userData.email || this.currentUser.email || '匿名ユーザー';
      } catch (error) {
        console.error('送信者名取得エラー:', error);
        return this.currentUser.email || '匿名ユーザー';
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
      this.$nextTick(() => {
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
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding: 20px;
  background: #eef2f8;
}

.chat-container {
  display: grid;
  gap: 16px;
  width: min(920px, 100%);
  min-height: 70vh;
  padding: 24px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(31, 41, 55, 0.08);
}

.chat-header {
  display: grid;
  gap: 6px;
}

.chat-header h2 {
  margin: 0;
  color: #243046;
}

.messages {
  display: grid;
  gap: 12px;
  min-height: 320px;
  max-height: 56vh;
  padding: 16px;
  overflow-y: auto;
  border-radius: 16px;
  background: #f8faff;
  border: 1px solid #d9e1ef;
}

.message-bubble {
  display: grid;
  gap: 6px;
  max-width: min(75%, 520px);
  padding: 14px 16px;
  border-radius: 16px;
}

.my-message {
  justify-self: end;
  background: #d7f7df;
}

.other-message {
  justify-self: start;
  background: #edf2ff;
}

.message-author,
.message-text,
.message {
  margin: 0;
}

.message-author {
  font-weight: 700;
  color: #243046;
}

.message-text {
  color: #334155;
  white-space: pre-wrap;
}

.timestamp {
  color: #64748b;
  text-align: right;
}

.home-button {
  align-self: flex-start;
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  background: #334155;
  color: #ffffff;
  cursor: pointer;
}

.message--error {
  color: #c0364b;
}

@media (max-width: 640px) {
  .chat-wrapper {
    padding: 14px;
  }

  .chat-container {
    padding: 16px;
    min-height: 72vh;
  }

  .message-bubble {
    max-width: 100%;
  }
}
</style>
