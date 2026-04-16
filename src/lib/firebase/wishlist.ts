// Firebase Wishlist functions
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './config';

const WISHLIST_COLLECTION = 'wishlists';

export interface WishlistItem {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  imgs?: {
    thumbnails?: string[];
    previews: string[];
  };
  img?: string;
  addedAt: string;
}

// Get user's wishlist (using session ID for anonymous users)
export const fetchWishlist = async (sessionId: string): Promise<WishlistItem[]> => {
  try {
    const docRef = doc(db, WISHLIST_COLLECTION, sessionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const items = data.items || [];

      // Convert any Firestore Timestamp objects to ISO strings for Redux serialization
      return items.map((item: any) => {
        // Remove any updatedAt field that shouldn't be on items
        const { updatedAt, ...itemWithoutUpdatedAt } = item;

        return {
          ...itemWithoutUpdatedAt,
          addedAt: typeof item.addedAt === 'string'
            ? item.addedAt
            : item.addedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      });
    }
    return [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
};

// Add item to wishlist
export const addToWishlist = async (
  sessionId: string,
  item: Omit<WishlistItem, 'addedAt'>
): Promise<boolean> => {
  try {
    const docRef = doc(db, WISHLIST_COLLECTION, sessionId);
    const docSnap = await getDoc(docRef);

    let items: WishlistItem[] = [];

    if (docSnap.exists()) {
      items = docSnap.data().items || [];
    }

    // Check if item already exists
    const existingIndex = items.findIndex((i) => i.id === item.id);

    if (existingIndex >= 0) {
      // Update quantity
      items[existingIndex].quantity += item.quantity;
    } else {
      // Add new item
      items.push({
        ...item,
        addedAt: new Date().toISOString(),
      });
    }

    await setDoc(docRef, {
      items,
      updatedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (
  sessionId: string,
  productId: number
): Promise<boolean> => {
  try {
    const docRef = doc(db, WISHLIST_COLLECTION, sessionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    let items: WishlistItem[] = docSnap.data().items || [];
    items = items.filter((item) => item.id !== productId);

    await updateDoc(docRef, {
      items,
      updatedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
};

// Clear entire wishlist
export const clearWishlist = async (sessionId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, WISHLIST_COLLECTION, sessionId);
    await setDoc(docRef, {
      items: [],
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return false;
  }
};

// Get or create session ID for anonymous users
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('wishlist_session_id');

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('wishlist_session_id', sessionId);
  }

  return sessionId;
};
