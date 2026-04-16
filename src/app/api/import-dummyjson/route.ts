import { NextResponse } from 'next/server';
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
    const response = await fetch(`https://dummyjson.com/products/category/${category}`);
    const data = await response.json();
    allProducts.push(...data.products);
  }

  return allProducts;
}

function transformToFirestoreProduct(dummyProduct: DummyJSONProduct) {
  const discountedPrice = dummyProduct.price * (1 - dummyProduct.discountPercentage / 100);

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
    img: dummyProduct.thumbnail,
    imgs: {
      previews: dummyProduct.images.slice(0, 4)
    },
    isActive: true,
    isFeatured: dummyProduct.rating >= 4.5,
    isNewArrival: dummyProduct.id % 3 === 0,
    isBestSeller: dummyProduct.rating >= 4.7,
    createdAt: new Date().toISOString()
  };
}

export async function POST() {
  try {
    // Step 1: Fetch products from DummyJSON
    const dummyProducts = await fetchDummyJSONProducts();

    // Step 2: Delete existing products
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Step 3: Import new products
    let imported = 0;
    for (const dummyProduct of dummyProducts) {
      const firestoreProduct = transformToFirestoreProduct(dummyProduct);
      await addDoc(productsRef, firestoreProduct);
      imported++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${imported} products from DummyJSON!\n\nCategories imported:\n- Smartphones\n- Laptops\n- Tablets\n- Watches\n- Mobile Accessories\n\nAll products now have real images that match their names.`
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import products' },
      { status: 500 }
    );
  }
}
