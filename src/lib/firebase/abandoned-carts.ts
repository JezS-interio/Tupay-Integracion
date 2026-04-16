import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

const ABANDONED_CARTS_COLLECTION = 'abandoned_carts';

export interface AbandonedCartItem {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  image?: string;
}

export interface AbandonedCart {
  userId?: string;
  email: string;
  userName?: string;
  items: AbandonedCartItem[];
  cartTotal: number;
  createdAt: string;
  updatedAt: string;
  emailSent?: boolean;
  emailSentAt?: string;
}

/**
 * Save or update an abandoned cart for a user
 */
export async function saveAbandonedCart(
  email: string,
  items: AbandonedCartItem[],
  cartTotal: number,
  userId?: string,
  userName?: string
): Promise<void> {
  if (items.length === 0) {
    // If cart is empty, delete the abandoned cart record
    await deleteAbandonedCart(email);
    return;
  }

  const cartData: AbandonedCart = {
    userId,
    email,
    userName,
    items,
    cartTotal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emailSent: false,
  };

  // Use email as document ID for easy lookup and updates
  await setDoc(doc(db, ABANDONED_CARTS_COLLECTION, email), cartData, { merge: true });
}

/**
 * Get abandoned cart by email
 */
export async function getAbandonedCart(email: string): Promise<AbandonedCart | null> {
  const docRef = doc(db, ABANDONED_CARTS_COLLECTION, email);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as AbandonedCart;
  }

  return null;
}

/**
 * Delete abandoned cart (when user completes checkout or empties cart)
 */
export async function deleteAbandonedCart(email: string): Promise<void> {
  const docRef = doc(db, ABANDONED_CARTS_COLLECTION, email);
  await deleteDoc(docRef);
}

/**
 * Get all abandoned carts that need email reminders
 * (carts older than X hours, email not sent yet)
 */
export async function getAbandonedCartsForReminder(hoursThreshold: number = 2): Promise<AbandonedCart[]> {
  const thresholdDate = new Date();
  thresholdDate.setHours(thresholdDate.getHours() - hoursThreshold);
  const thresholdISOString = thresholdDate.toISOString();

  const q = query(
    collection(db, ABANDONED_CARTS_COLLECTION),
    where('emailSent', '==', false),
    where('updatedAt', '<', thresholdISOString)
  );

  const querySnapshot = await getDocs(q);
  const abandonedCarts: AbandonedCart[] = [];

  querySnapshot.forEach((doc) => {
    abandonedCarts.push(doc.data() as AbandonedCart);
  });

  return abandonedCarts;
}

/**
 * Mark abandoned cart email as sent
 */
export async function markAbandonedCartEmailSent(email: string): Promise<void> {
  const docRef = doc(db, ABANDONED_CARTS_COLLECTION, email);

  await setDoc(
    docRef,
    {
      emailSent: true,
      emailSentAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Update abandoned cart timestamp (called when user modifies cart)
 */
export async function updateAbandonedCartTimestamp(email: string): Promise<void> {
  const docRef = doc(db, ABANDONED_CARTS_COLLECTION, email);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    await setDoc(
      docRef,
      {
        updatedAt: new Date().toISOString(),
        // Reset email sent flag if user is actively modifying cart
        emailSent: false,
      },
      { merge: true }
    );
  }
}
