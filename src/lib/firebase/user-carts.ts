import { db } from './config';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export interface UserCartItem {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails?: string[];
    previews: string[];
  };
}

export interface UserCart {
  userId: string;
  items: UserCartItem[];
  updatedAt: string;
}

/**
 * Save user's cart to Firestore
 */
export async function saveUserCart(userId: string, items: UserCartItem[]): Promise<void> {
  try {
    const cartRef = doc(db, 'user_carts', userId);

    const cartData: UserCart = {
      userId,
      items,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(cartRef, cartData);
  } catch (error) {
    console.error('Error saving user cart:', error);
    throw error;
  }
}

/**
 * Load user's cart from Firestore
 */
export async function loadUserCart(userId: string): Promise<UserCartItem[]> {
  try {
    const cartRef = doc(db, 'user_carts', userId);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      const cartData = cartSnap.data() as UserCart;
      const items = cartData.items || [];

      // Convert any Firestore Timestamp objects to ISO strings for Redux serialization
      const serializedItems = items.map((item: any) => {
        // Remove any updatedAt or other timestamp fields that shouldn't be on items
        const { updatedAt, createdAt, ...itemWithoutTimestamps } = item;

        return {
          ...itemWithoutTimestamps,
        };
      });

      return serializedItems;
    }

    return [];
  } catch (error) {
    console.error('Error loading user cart:', error);
    return [];
  }
}

/**
 * Delete user's cart from Firestore
 */
export async function deleteUserCart(userId: string): Promise<void> {
  try {
    const cartRef = doc(db, 'user_carts', userId);
    await deleteDoc(cartRef);
  } catch (error) {
    console.error('Error deleting user cart:', error);
    throw error;
  }
}
