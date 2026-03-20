<template>
  <section class="hero">
    <div class="hero__content">
      <p class="hero_badge">リアルなチャット</p>
      <h1>エンジニアのためのリアルタイムで、リアルすぎるチャット</h1>
      <p class="hero__lead">
        リアルタイムで、リアルすぎる情報共有
      </p>

      <ul class="hero__features">
        <li>リアルタイムメッセージ</li>
        <li>コソ練している人が誰かわかるログイン／登録</li>
        <li>カスタマイズ性の高いプロフィール機能</li>
      </ul>

      <div class="hero__actions">
        <button class="btn primary" @click="$emit('login')">ログインして始める</button>
        <button class="btn ghost" @click="$emit('register')">初めての方はこちら</button>
      </div>
    </div>
      
      <div class="hero__visual">
        <img src="@/assets/sample_chat.png" alt="チャットのイメージ" />
        <p>コンタクトリストやダイレクトチャットの画面イメージ</p>
      </div>
  </section>
</template>

<script>
export default {
  name: 'LandingHero',
  emits: ['login', 'register']
};
</script>

<style scoped>
.hero {
  display: flex;
  gap: 40px;
  padding: 60px 40px;
  background: linear-gradient(135deg, #f5f7ff 0%, #e8ecff 100%);
  border-radius: 16px;
  align-items: center;
  flex-wrap: wrap;
}
.hero__content { flex: 1; min-width: 280px; }
.hero__badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: #eef1ff;
  color: #5a6bea;
  font-size: 14px;
  margin-bottom: 12px;
}
.hero h1 { font-size: 2rem; margin-bottom: 12px; }
.hero__lead { color: #4a4a4a; line-height: 1.6; margin-bottom: 20px; }
.hero__features { list-style: none; padding: 0; margin: 0 0 24px; }
.hero__features li { margin-bottom: 8px; }
.hero__actions { display: flex; gap: 16px; flex-wrap: wrap; }
.btn {
  padding: 12px 24px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.btn.primary { background: #5a6bea; color: white; }
.btn.ghost { background: transparent; border: 1px solid #5a6bea; color: #5a6bea; }
.hero__visual { flex: 0.8; min-width: 240px; text-align: center; }
.hero__visual img { max-width: 100%; border-radius: 12px; box-shadow: 0 18px 30px rgba(40, 95, 255, 0.15); }
</style>