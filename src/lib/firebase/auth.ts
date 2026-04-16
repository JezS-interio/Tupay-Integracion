// src/lib/firebase/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from './config';

// Sign up with email/password
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Update display name if provided
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }

  return userCredential.user;
};

// Sign in with email/password
export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  return userCredential.user;
};

// Sign out
export const logOut = async () => {
  await signOut(auth);
};

// Password reset
export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
