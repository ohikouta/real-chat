<template>
  <div class="message-input">
    <input
      v-model="message"
      @keyup.enter="handleSend"
      placeholder="メッセージを入力..."
    />
    <button @click="handleSend">送信</button>
  </div>
</template>

<script>
export default {
  name: 'MessageInput',
  data() {
    return {
      message: ''
    };
  },
  methods: {
    handleSend() {
      if (this.message.trim()) {
        this.$emit('sendMessage', this.message);
        this.message = '';
      }
    }
  }
};
</script>
<style scoped>
.message-input {
  display: flex;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}
input {
  flex: 1;
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 14px;
  background: #f8fafc;
  font: inherit;
}
button {
  padding: 0 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: white;
  border: none;
  font-weight: 700;
  cursor: pointer;
}
button:hover {
  filter: brightness(1.05);
}

@media (max-width: 640px) {
  .message-input {
    flex-direction: column;
  }

  button {
    min-height: 48px;
  }
}
</style>
