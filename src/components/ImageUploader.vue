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
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/firebaseConfig';
import { getFirestoreErrorMessage, logFirebaseError } from '../utils/firebaseError';

export default {
  emits: ['imageUploaded'],
  data() {
    return {
      file: null,
      uploadProgress: null,
      downloadURL: null
    };
  },
  methods: {
    onFileChange(event) {
      this.file = event.target.files[0];
    },
    async uploadImage() {
      if (!this.file) return alert('Please select an image file.');

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return alert('Please log in to upload a profile image.');

      const storageRef = ref(storage, `profileImages/${user.uid}/profile.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, this.file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          this.uploadProgress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
        },
        (error) => {
          logFirebaseError('プロフィール画像アップロード', error);
          alert(getFirestoreErrorMessage(error, '画像アップロードに失敗しました。時間を置いて再度お試しください。'));
        },
        async () => {
          this.downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at', this.downloadURL);

          const db = getFirestore();
          const userDocRef = doc(db, 'users', user.uid);
          try {
            await setDoc(userDocRef, {
              profileImageUrl: this.downloadURL,
              updatedAt: serverTimestamp()
            }, { merge: true });

            this.$emit('imageUploaded', this.downloadURL);
            alert('Profile image uploaded successfully!');
          } catch (error) {
            logFirebaseError('プロフィール画像URL保存', error);
            alert(getFirestoreErrorMessage(error, '画像URLの保存に失敗しました。時間を置いて再度お試しください。'));
          }
        }
      );
    }
  }
};
</script>
