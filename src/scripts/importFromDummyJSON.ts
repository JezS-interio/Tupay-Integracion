import { db } from '@/lib/firebase/config';
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

interface DummyJSONProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  sku: string;
  thumbnail: string;
  images: string[];
}

const CATEGORIES_TO_FETCH = [
  'smartphones',
  'laptops',
  'tablets',
  'mens-watches',
  'womens-watches',
  'mobile-accessories'
];

async function fetchDummyJSONProducts() {
  const allProducts: DummyJSONProduct[] = [];

  for (const category of CATEGORIES_TO_FETCH) {
    try {
      const response = await fetch(`https://dummyjson.com/products/category/${category}`);
      const data = await response.json();
      allProducts.push(...data.products);
      console.log(`✓ Fetched ${data.products.length} products from ${category}`);
    } catch (error) {
      console.error(`✗ Error fetching ${category}:`, error);
    }
  }

  return allProducts;
}

function transformToFirestoreProduct(dummyProduct: DummyJSONProduct) {
  // Calculate discounted price based on discount percentage
  const discountedPrice = dummyProduct.price * (1 - dummyProduct.discountPercentage / 100);

  // Map DummyJSON categories to our categories
  const categoryMap: Record<string, string> = {
    'smartphones': 'Smartphones',
    'laptops': 'Computers',
    'tablets': 'Tablets',
    'mens-watches': 'Wearables',
    'womens-watches': 'Wearables',
    'mobile-accessories': 'Accessories'
  };

  return {
    title: dummyProduct.title,
    description: dummyProduct.description,
    price: parseFloat(dummyProduct.price.toFixed(2)),
    discountedPrice: parseFloat(discountedPrice.toFixed(2)),
    category: categoryMap[dummyProduct.category] || 'Electronics',
    stock: dummyProduct.stock,
    sku: dummyProduct.sku,
    rating: dummyProduct.rating,
    brand: dummyProduct.brand,
    // Use DummyJSON CDN images directly
    img: dummyProduct.thumbnail,
    imgs: {
      previews: dummyProduct.images.slice(0, 4) // Take up to 4 images
    },
    isActive: true,
    isFeatured: dummyProduct.rating >= 4.5,
    isNewArrival: dummyProduct.id % 3 === 0, // Randomly mark some as new
    isBestSeller: dummyProduct.rating >= 4.7,
    createdAt: new Date().toISOString()
  };
}

async function deleteAllProducts() {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);

  console.log(`\nDeleting ${snapshot.size} existing products...`);

  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  console.log('✓ All existing products deleted\n');
}

async function importProducts() {
  console.log('Starting DummyJSON import...\n');

  // Step 1: Fetch products from DummyJSON
  console.log('Step 1: Fetching products from DummyJSON...');
  const dummyProducts = await fetchDummyJSONProducts();
  console.log(`\n✓ Total products fetched: ${dummyProducts.length}\n`);

  // Step 2: Delete existing products
  console.log('Step 2: Cleaning up existing products...');
  await deleteAllProducts();

  // Step 3: Transform and import to Firestore
  console.log('Step 3: Importing products to Firestore...');
  const productsRef = collection(db, 'products');
  let imported = 0;

  for (const dummyProduct of dummyProducts) {
    try {
      const firestoreProduct = transformToFirestoreProduct(dummyProduct);
      await addDoc(productsRef, firestoreProduct);
      imported++;
      console.log(`✓ Imported: ${dummyProduct.title}`);
    } catch (error) {
      console.error(`✗ Error importing ${dummyProduct.title}:`, error);
    }
  }

  console.log(`\n✓ Import complete! ${imported} products imported to Firestore`);
  console.log('\nProduct categories imported:');
  console.log('- Smartphones');
  console.log('- Laptops (Computers)');
  console.log('- Tablets');
  console.log('- Watches (Wearables)');
  console.log('- Mobile Accessories');
}

// Run the import
importProducts()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });
