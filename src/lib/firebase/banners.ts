// src/lib/firebase/banners.ts
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
} from 'firebase/firestore';
import { db } from './config';
import { Banner, BannerFormData } from '@/types/banner';

const BANNERS_COLLECTION = 'banners';

// Fetch all banners (optionally only active ones)
export const fetchBanners = async (activeOnly = false): Promise<Banner[]> => {
  try {
    const bannersRef = collection(db, BANNERS_COLLECTION);
    let q = query(bannersRef);

    if (activeOnly) {
      q = query(bannersRef, where('isActive', '==', true));
    }

    const snapshot = await getDocs(q);

    let banners = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Banner[];

    // Sort by order in client-side (no index needed)
    banners = banners.sort((a, b) => (a.order || 0) - (b.order || 0));

    return banners;
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
};

// Fetch banner by ID
export const fetchBannerById = async (
  bannerId: string
): Promise<Banner | null> => {
  try {
    const docRef = doc(db, BANNERS_COLLECTION, bannerId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Banner;
    }
    return null;
  } catch (error) {
    console.error('Error fetching banner:', error);
    return null;
  }
};

// Add new banner
export const addBanner = async (
  banner: BannerFormData
): Promise<string | null> => {
  try {
    const bannersRef = collection(db, BANNERS_COLLECTION);
    const docRef = await addDoc(bannersRef, {
      ...banner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding banner:', error);
    return null;
  }
};

// Update banner
export const updateBanner = async (
  bannerId: string,
  updates: Partial<BannerFormData>
): Promise<boolean> => {
  try {
    const docRef = doc(db, BANNERS_COLLECTION, bannerId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating banner:', error);
    return false;
  }
};

// Delete banner
export const deleteBanner = async (bannerId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, BANNERS_COLLECTION, bannerId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting banner:', error);
    return false;
  }
};
