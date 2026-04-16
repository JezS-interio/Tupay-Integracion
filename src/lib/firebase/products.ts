// src/lib/firebase/products.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { FirestoreProduct } from '@/types/product';

const PRODUCTS_COLLECTION = 'products';

// Helper function to convert Firestore Timestamps to ISO strings
const convertTimestamps = (data: any): any => {
  const converted = { ...data };

  // Convert createdAt if it's a Timestamp
  if (converted.createdAt && typeof converted.createdAt?.toDate === 'function') {
    converted.createdAt = converted.createdAt.toDate().toISOString();
  }

  // Convert updatedAt if it's a Timestamp
  if (converted.updatedAt && typeof converted.updatedAt?.toDate === 'function') {
    converted.updatedAt = converted.updatedAt.toDate().toISOString();
  }

  return converted;
};

// Fetch all products
export const fetchAllProducts = async (): Promise<FirestoreProduct[]> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);

    // Sort in memory instead of Firestore to avoid index requirements
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      return convertTimestamps({
        ...data,
        // Use the id from document data if it exists and is a number, otherwise try parsing doc ID
        id: typeof data.id === 'number' ? data.id : (parseInt(doc.id) || 0),
      });
    }) as FirestoreProduct[];

    return products.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Fetch product by ID
export const fetchProductById = async (productId: string): Promise<FirestoreProduct | null> => {
  try {
    // Convert string ID to number for querying
    const numericId = parseInt(productId);

    if (isNaN(numericId)) {
      console.error('Invalid product ID:', productId);
      return null;
    }

    // Query by the numeric id field with isActive check
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(
      productsRef,
      where('id', '==', numericId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      return convertTimestamps({
        ...data,
        id: data.id,
      }) as FirestoreProduct;
    }

    console.warn(`Product not found with ID: ${numericId}`);
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

// Fetch products by category
export const fetchProductsByCategory = async (category: string): Promise<FirestoreProduct[]> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(
      productsRef,
      where('isActive', '==', true),
      where('category', '==', category)
    );
    const snapshot = await getDocs(q);

    // Sort in memory to avoid composite index
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      return convertTimestamps({
        ...data,
        // Use the id from document data if it exists and is a number, otherwise try parsing doc ID
        id: typeof data.id === 'number' ? data.id : (parseInt(doc.id) || 0),
      });
    }) as FirestoreProduct[];

    return products.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

// Get product counts by category
export const getCategoryCounts = async (): Promise<Record<string, number>> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);

    const counts: Record<string, number> = {};

    snapshot.docs.forEach(doc => {
      const product = convertTimestamps(doc.data()) as FirestoreProduct;
      const category = product.category || 'Uncategorized';
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Error getting category counts:', error);
    return {};
  }
};

// Fetch featured products
export const fetchFeaturedProducts = async (limit: number = 10): Promise<FirestoreProduct[]> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(
      productsRef,
      where('isActive', '==', true),
      where('isFeatured', '==', true)
    );
    const snapshot = await getDocs(q);

    // Sort and limit in memory to avoid composite index
    const products = snapshot.docs.map(doc =>
      convertTimestamps({
        id: parseInt(doc.id),
        ...doc.data(),
      })
    ) as FirestoreProduct[];

    return products
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

// Fetch best sellers
export const fetchBestSellers = async (limit: number = 10): Promise<FirestoreProduct[]> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(
      productsRef,
      where('isActive', '==', true),
      where('isBestSeller', '==', true)
    );
    const snapshot = await getDocs(q);

    // Sort and limit in memory to avoid composite index
    const products = snapshot.docs.map(doc =>
      convertTimestamps({
        id: parseInt(doc.id),
        ...doc.data(),
      })
    ) as FirestoreProduct[];

    return products
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    return [];
  }
};

// Fetch new arrivals
export const fetchNewArrivals = async (limit: number = 10): Promise<FirestoreProduct[]> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(
      productsRef,
      where('isActive', '==', true),
      where('isNewArrival', '==', true)
    );
    const snapshot = await getDocs(q);

    // Sort and limit in memory to avoid composite index
    const products = snapshot.docs.map(doc =>
      convertTimestamps({
        id: parseInt(doc.id),
        ...doc.data(),
      })
    ) as FirestoreProduct[];

    return products
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }
};

// Add product (admin function)
export const addProduct = async (product: Omit<FirestoreProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const docRef = await addDoc(productsRef, {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
};

// Update product (admin function)
export const updateProduct = async (
  productId: string,
  updates: Partial<FirestoreProduct>
): Promise<boolean> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
};

// Delete product (admin function)
export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};
