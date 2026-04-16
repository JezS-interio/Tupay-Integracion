// src/lib/firebase/firestore.ts
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
  limit,
  DocumentData,
} from 'firebase/firestore';
import { db } from './config';

// Generic fetch document
export const fetchDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

// Generic fetch collection
export const fetchCollection = async (collectionName: string) => {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Generic add document
export const addDocument = async (collectionName: string, data: DocumentData) => {
  const collectionRef = collection(db, collectionName);
  const docRef = await addDoc(collectionRef, {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

// Generic update document
export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: DocumentData
) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

// Generic delete document
export const deleteDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};
