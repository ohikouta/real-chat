<template>
  <div>
    <input type="file" @change="onFileChange" />
    <button @click="uploadImage">Upload Profile Image</button>
    <p v-if="uploadProgress">Uploading: {{ uploadProgress }}%</p>
    <p v-if="downloadURL">Uploaded: <a :href="downloadURL" target="_blank">{{ downloadURL }}</a></p>
    <img :src="downloadURL" alt="Profile Image" />
  </div>
</template>

<script>
import { getAuth } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { storage } from "@/firebaseConfig";

export default {
  data() {
    return {
      file: null,
      uploadProgress: null,
      downloadURL: null,
    };
  },
  methods: {
    onFileChange(event) {
      this.file = event.target.files[0];
    },
    async uploadImage() {
      if (!this.file) return alert("Please select an image file.");

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return alert("Please log in to upload a profile image.");

      const storageRef = ref(storage, `profileImages/${user.uid}/profile.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, this.file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // 進行状況の更新
          this.uploadProgress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
        },
        (error) => {
          console.error("Upload failed:", error);
          alert("Upload failed. Please try again.");
        },
        async () => {
          // アップロード完了後にURLを取得
          this.downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", this.downloadURL);

          // FirestoreにURLを保存
          const db = getFirestore();
          const userDocRef = doc(db, "users", user.uid);
          await setDoc(userDocRef, { profileImageUrl: this.downloadURL }, { merge: true });

          alert("Profile image uploaded successfully!");
        }
      );
    },
  },
};
</script>
