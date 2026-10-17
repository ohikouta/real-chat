const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
});

const db = admin.firestore();

(async () => {
  const collections = await db.listCollections();
  for (const col of collections) {
    console.log('COLLECTION:', col.id);
    const snap = await col.limit(3).get();
    snap.forEach(doc => console.log(' ', doc.id, doc.data()));
  }
})();

