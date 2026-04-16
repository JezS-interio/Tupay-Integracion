const { initializeApp } = require('firebase/app');
const { getFirestore, doc, deleteDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteDuplicate() {
  const docId = 'GFQmyIQRqExyvnj9MNoI'; // Duplicate Mr. Coffee

  console.log('Deleting duplicate Mr. Coffee Coffee Maker Pro...');
  console.log(`DocID: ${docId}`);

  try {
    await deleteDoc(doc(db, 'products', docId));
    console.log('✅ Successfully deleted duplicate product');
  } catch (error) {
    console.error('❌ Error deleting product:', error);
  }
}

deleteDuplicate();
