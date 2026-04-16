const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function verifyProducts() {
  const productsRef = collection(db, "products");
  const snapshot = await getDocs(productsRef);

  const products = [];
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    products.push({
      docId: docSnap.id,
      id: data.id,
      title: data.title,
      brand: data.brand,
      category: data.category,
      imageUrl: data.imgs?.previews?.[0] || data.img || "/images/placeholder.png",
    });
  }

  products.sort((a, b) => a.id - b.id);

  console.log('Total products:', products.length);
  console.log('\nFirst 10 products to verify:\n');

  products.slice(0, 10).forEach(p => {
    console.log(`ID ${p.id}: ${p.title}`);
    console.log(`  Brand: ${p.brand || 'N/A'}`);
    console.log(`  Category: ${p.category || 'N/A'}`);
    console.log(`  Image: ${p.imageUrl}`);
    console.log('');
  });
}

verifyProducts().catch(console.error);
