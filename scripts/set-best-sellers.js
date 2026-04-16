require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, query, where } = require('firebase/firestore');

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

async function setBestSellers() {
  try {
    console.log('Setting best sellers...\n');

    const productsRef = collection(db, 'products');

    // First, remove best seller flag from all products
    const allBestSellersQuery = query(productsRef, where('isBestSeller', '==', true));
    const existingBestSellers = await getDocs(allBestSellersQuery);

    console.log(`Removing isBestSeller flag from ${existingBestSellers.size} existing best sellers...`);
    for (const docSnap of existingBestSellers.docs) {
      await updateDoc(doc(db, 'products', docSnap.id), {
        isBestSeller: false,
      });
    }

    // Get first 5 active products
    const activeQuery = query(productsRef, where('isActive', '==', true));
    const snapshot = await getDocs(activeQuery);

    if (snapshot.empty) {
      console.log('❌ No active products found');
      return;
    }

    console.log(`\nFound ${snapshot.size} active products`);
    console.log('Setting first 5 as best sellers...\n');

    const products = snapshot.docs.slice(0, 5);
    const bestSellers = [];

    for (const docSnap of products) {
      await updateDoc(doc(db, 'products', docSnap.id), {
        isBestSeller: true,
      });

      const data = docSnap.data();
      bestSellers.push({
        id: data.id,
        title: data.title,
      });
      console.log(`✅ Set as best seller: ${data.title}`);
    }

    console.log(`\n✅ Successfully set ${bestSellers.length} products as best sellers`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting best sellers:', error);
    process.exit(1);
  }
}

setBestSellers();
