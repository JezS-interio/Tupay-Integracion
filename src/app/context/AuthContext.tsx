'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { createUserProfile, userProfileExists } from '@/lib/firebase/users';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName?: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => { throw new Error('Not implemented'); },
  login: async () => { throw new Error('Not implemented'); },
  loginWithGoogle: async () => { throw new Error('Not implemented'); },
  logout: async () => { throw new Error('Not implemented'); },
  resetPassword: async () => { throw new Error('Not implemented'); },
  sendEmailVerification: async () => { throw new Error('Not implemented'); },
  updateUserProfile: async () => { throw new Error('Not implemented'); },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up with email and password
  const signup = async (email: string, password: string, displayName?: string): Promise<User> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name if provided
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }

      // Send verification email
      if (result.user) {
        await firebaseSendEmailVerification(result.user);
      }

      // Create user profile in Firestore (client-side)
      if (result.user) {
        try {
          await createUserProfile({
            uid: result.user.uid,
            email: result.user.email!,
            displayName: displayName || result.user.email?.split('@')[0] || 'User',
            photoURL: result.user.photoURL || undefined,
            emailVerified: result.user.emailVerified,
          });
        } catch (error) {
          console.error('Error creating user profile:', error);
        }

        // Send welcome email (optional, doesn't block signup)
        try {
          await fetch('/api/send-welcome-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: result.user.email,
              userName: displayName || result.user.email?.split('@')[0] || 'there',
            }),
          });
        } catch (error) {
          console.error('Error sending welcome email:', error);
        }
      }

      toast.success('Account created successfully! Please check your email to verify your account.');
      return result.user;
    } catch (error: any) {
      const message = error.code === 'auth/email-already-in-use'
        ? 'Email already in use'
        : error.code === 'auth/weak-password'
        ? 'Password should be at least 6 characters'
        : 'Failed to create account';
      toast.error(message);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      return result.user;
    } catch (error: any) {
      const message = error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : error.code === 'auth/too-many-requests'
        ? 'Too many failed attempts. Please try again later.'
        : 'Failed to sign in';
      toast.error(message);
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Check if this is a new user and create profile (client-side)
      if (result.user) {
        try {
          const exists = await userProfileExists(result.user.uid);

          if (!exists) {
            // Create profile for new user
            await createUserProfile({
              uid: result.user.uid,
              email: result.user.email!,
              displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
              photoURL: result.user.photoURL || undefined,
              emailVerified: result.user.emailVerified,
            });

            // Send welcome email only for new users
            try {
              await fetch('/api/send-welcome-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: result.user.email,
                  userName: result.user.displayName || result.user.email?.split('@')[0] || 'there',
                }),
              });
            } catch (error) {
              console.error('Error sending welcome email:', error);
            }
          }
        } catch (error) {
          console.error('Error creating user profile:', error);
        }
      }

      toast.success('Welcome!');
      return result.user;
    } catch (error: any) {
      const message = error.code === 'auth/popup-closed-by-user'
        ? 'Sign-in cancelled'
        : 'Failed to sign in with Google';
      toast.error(message);
      throw error;
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    try {
      // Dispatch pre-logout event so AuthCartSync can save cart while still authenticated
      const event = new CustomEvent('auth:pre-logout', { detail: { user } });
      window.dispatchEvent(event);

      // Wait a bit for the cart to be saved
      await new Promise(resolve => setTimeout(resolve, 500));

      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      const message = error.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : 'Failed to send reset email';
      toast.error(message);
      throw error;
    }
  };

  // Send email verification
  const sendEmailVerification = async (): Promise<void> => {
    try {
      if (!user) throw new Error('No user logged in');
      await firebaseSendEmailVerification(user);
      toast.success('Verification email sent!');
    } catch (error) {
      toast.error('Failed to send verification email');
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName: string, photoURL?: string): Promise<void> => {
    try {
      if (!user) throw new Error('No user logged in');
      await updateProfile(user, { displayName, photoURL });
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    sendEmailVerification,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
