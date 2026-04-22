import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './config';
import { UserProfile, CreateUserProfileData } from '@/types/user';

const USERS_COLLECTION = 'users';

/**
 * Create a new user profile in Firestore
 */
export async function createUserProfile(data: CreateUserProfileData): Promise<UserProfile> {
  const userProfile: UserProfile = {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    emailVerified: data.emailVerified || false,
    emailNotifications: true,
    orderNotifications: true,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, USERS_COLLECTION, data.uid), userProfile);

  return userProfile;
}

/**
 * Get user profile by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }

  return null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, uid);

  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Get user profile by email
 */
export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('email', '==', email)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as UserProfile;
  }

  return null;
}

/**
 * Check if user profile exists
 */
export async function userProfileExists(uid: string): Promise<boolean> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);

  return docSnap.exists();
}

/**
 * Add order ID to user's order history
 */
export async function addOrderToUserHistory(uid: string, orderId: string): Promise<void> {
  const profile = await getUserProfile(uid);

  if (profile) {
    const orderIds = profile.orderIds || [];
    orderIds.push(orderId);

    await updateUserProfile(uid, { orderIds });
  }
}

/**
 * Save checkout address to user profile
 */
export async function saveCheckoutAddress(uid: string, address: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  street: string;
  streetTwo?: string;
  city: string;
  state: string;
  country: string;
}): Promise<void> {
  await updateUserProfile(uid, {
    shippingAddress: {
      firstName: address.firstName,
      lastName: address.lastName,
      email: address.email,
      phone: address.phone,
      companyName: address.companyName || '',
      street: address.street,
      streetTwo: address.streetTwo || '',
      city: address.city,
      state: address.state,
      zip: '',
      country: address.country,
    },
  });
}

/**
 * Get all user profiles
 */
export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
  const users: UserProfile[] = [];

  querySnapshot.forEach((doc) => {
    users.push(doc.data() as UserProfile);
  });

  return users;
}
