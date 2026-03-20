<template>
	<div>
		<h2>Login</h2>
		<p>ログイン情報を入力してください！</p>
		<input v-model="email" type="email" placeholder="Email" />
		<input v-model="password" type="password" placeholder="Password" />
		<button @click="login">Login</button>
	</div>
</template>

<script>
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default {
	data() {
		return {
			email: "",
			password: ""
		};
	},
	methods: {
		async login() {
			try {
				// ユーザーのログイン
				const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
				const user =  userCredential.user;
				console.log("User logged in:", userCredential.user);

				// FirestoreでユーザーのisOnlineをtrueに更新
				const userDocRef = doc(db, "users", user.uid);
				await updateDoc(userDocRef, {
					isOnline: true
				});
				
				// ログイン成功後の処理(例：リダイレクト)
				this.$router.push({ name: "Home" });
			} catch (error) {
				console.error("Login error:", error);
			}
		}
	}
};

</script>