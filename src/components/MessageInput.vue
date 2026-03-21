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
  padding: 10px;
  border-top: 1px solid #ddd;
}
input {
  flex: 1;
  padding: 10px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
</style>
