<template>
  <div class="chat-wrapper">
    <button @click="goToHome" class="home-button">Home</button>
    <div class="chat-container">
      <h2>Chat with {{ chatPartnerName }}</h2>
      <div class="messages" ref="messagesContainer">
        <div 
          v-for="message in messages" 
          :key="message.id"
          :class="{
            'my-message': message.senderId === currentUser.uid,
            'other-message': message.senderId !== currentUser.uid
          }"
        >
          <p>
            <strong>{{ message.senderName }}:</strong> {{ message.text }}
          </p>
          <small class="timestamp">{{ formatTimestamp(message.timestamp) }}</small>
        </div>
      </div>
      <div class="input-container">
        <!-- 送信者によって違うクラスを割り当てる -->
        <input v-model="newMessage" placeholder="Type your message" />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
  </template>
  
  <script>
  import { db } from '../firebaseConfig';
  import { collection, addDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
  import { getDoc, doc } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';
  import { serverTimestamp } from 'firebase/firestore';

  
  export default {
    data() {
      return {
        messages: [],
        newMessage: '',
        currentUser: getAuth().currentUser,
        chatPartnerId: '',
        chatPartnerName: '',
      };
    },
    async created() {
      this.chatPartnerId = this.$route.params.userId;
      console.log('取れているかを確認する---->>>:', this.chatPartnerId);

      console.log('Chat partner ID:', this.chatPartnerId);
      const chatId = this.generateChatId(this.currentUser.uid, this.chatPartnerId);

      // Firestoreから特定のチャットメッセージをリアルタイムで取得
      const messagesQuery = query(
        collection(db, "messages"),
        where("chatId", "==", chatId),
        orderBy('timestamp', 'asc')
      );

      onSnapshot(messagesQuery, (snapshot) => {
        this.messages = snapshot.docs.map((doc) => ({
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        this.scrollToBottom();
      });

      // チャット相手の情報を取得
      await this.fetchChatPartnerName();

    },
    methods: {
      // chatIdを生成する関数
      generateChatId(userId1, userId2) {
        return [userId1, userId2].sort().join('_');
      },

      goToHome() {
        this.$router.push('/');
      },

      // チャット相手の名前をFirestoreから取得
      async fetchChatPartnerName() {
        if (!this.chatPartnerId) {
          console.log('checkckckckckk')
          console.error("chatPartnerId is undefined or null");
          this.chatPartnerName = "Unknown User";
          return;
        }

        const userDoc = doc(db, "users", this.chatPartnerId);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          this.chatPartnerName = docSnap.data().username || 'Anonymous';
        } else {
          console.log("No such user!");
          this.chatPartnerName = "Unknown User";
        }
      },

      // メッセージ送信
      async sendMessage() {
        const chatId = this.generateChatId(this.currentUser.uid, this.chatPartnerId);

        if (!this.newMessage.trim()) {
          alert('メッセージを入力してください');
          return;
        }

        // Firestoreからユーザーの名前を取得
        const userDoc = doc(db, "users", this.currentUser.uid);
        const userSnap = await getDoc(userDoc);
        let senderName = "Anonymous"; // デフォルトの名前
        if (userSnap.exists()) {
          senderName = userSnap.data().username || "Anonymous";
        }

        const messageData = {
          text: this.newMessage.trim(),
          senderId: this.currentUser.uid,
          senderName: senderName, 
          receiverId: this.chatPartnerId,
          chatId: chatId,  // ユニークなチャットIDを保存
          timestamp: serverTimestamp(),
          participants: [this.currentUser.uid, this.chatPartnerId]
        };

        try {
          await addDoc(collection(db, "messages"), messageData);
          this.newMessage = "";
          this.scrollToBottom();
        } catch (error) {
          console.error('メッセージ送信エラー:', error);
        }
      },
      formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      },
      scrollToBottom() {
        this.$nextTick(() => {
          const container = this.$refs.messagesContainer;
          container.scrollTop = container.scrollHeight;
        });
      },
    },
  };
  </script>

  <style scoped>
  .chat-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f0f0f0;
  }

  .chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
    padding: 20px;
    width: 80%;
    max-width: 1200px;
    border-radius: 8px;
    height: 80%;
    box-shadow: 0, 4px, 8px, rgba(0, 0, 0, 0.1);
  }

  .messages {
    flex: 1;
    overflow-y: auto;
  }

  .my-message {
    background-color: #d4f7dc;
    padding: 10px;
    margin: 10px 0;
    border-radius: 10px;
    max-width: 60%;
    align-self: flex-end;
  }

  .other-message {
    background-color: #f0f0f0;
    padding: 10px;
    margin: 10px 0;
    border-radius: 10px;
    max-width: 60%;
    align-self: flex-start;
  }

  .chat-container div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .input-container {
    display: flex;
    align-items: center;
  }

  input {
    width: calc(100% - 80px);
    padding: 10px;
    margin-top: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .home-button {
    align-self: flex-start;
    margin: 10px;
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .home-button:hover {
    background-color: #0056b3;
  }
  
  button {
    padding: 10px 20px;
    margin-left: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }

  .timestamp {
    font-size: 0.8rem;
    color: #666;
    text-align: right;
    margin-top: 5px;
  }
  </style>
