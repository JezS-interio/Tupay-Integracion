# Firebase Setup Guide for NextMerce

This guide will walk you through setting up Firebase for your Next.js eCommerce application, from creating the project to implementing authentication, database, and deployment.

---

## Table of Contents

1. [Create Firebase Project](#1-create-firebase-project)
2. [Install Firebase Dependencies](#2-install-firebase-dependencies)
3. [Configure Firebase in Next.js](#3-configure-firebase-in-nextjs)
4. [Set Up Authentication](#4-set-up-authentication)
5. [Set Up Firestore Database](#5-set-up-firestore-database)
6. [Database Structure Design](#6-database-structure-design)
7. [Security Rules](#7-security-rules)
8. [Testing Your Setup](#8-testing-your-setup)
9. [Vercel Deployment](#9-vercel-deployment)

---

## 1. Create Firebase Project

### Step 1.1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account

### Step 1.2: Create New Project
1. Click **"Add project"** or **"Create a project"**
2. **Project name**: Enter a name (e.g., `nextmerce-shop`)
3. Click **Continue**
4. **Google Analytics**:
   - Toggle ON (recommended for production tracking)
   - Or toggle OFF if you don't need analytics
5. Click **Continue**
6. If Analytics enabled, select or create an Analytics account
7. Click **Create project**
8. Wait 30-60 seconds for project creation
9. Click **Continue** when ready

### Step 1.3: Register Web App
1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. **App nickname**: Enter a name (e.g., `NextMerce Web App`)
3. **Firebase Hosting**: Leave UNCHECKED (we're using Vercel)
4. Click **Register app**
5. **Copy the configuration object** - you'll need this soon:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
     measurementId: "G-XXXXXXXXXX" // Optional
   };
   ```
6. Click **Continue to console**

---

## 2. Install Firebase Dependencies

### Step 2.1: Install Firebase SDK

Open your terminal in the project directory and run:

```bash
npm install firebase
```

### Step 2.2: Verify Installation

Check that Firebase was added to `package.json`:

```bash
npm list firebase
```

You should see: `firebase@10.x.x` or similar.

---

## 3. Configure Firebase in Next.js

### Step 3.1: Create Environment Variables File

Create a file named `.env.local` in your project root:

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

**Replace the values** with your actual Firebase configuration from Step 1.3.

**Important Notes:**
- The `NEXT_PUBLIC_` prefix makes these variables accessible in the browser
- NEVER commit `.env.local` to Git (already in `.gitignore`)
- These API keys are safe to expose (they're restricted by Firebase security rules)

### Step 3.2: Create Firebase Configuration File

Create `src/lib/firebase/config.ts`:

```typescript
// src/lib/firebase/config.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

**Why this structure?**
- `getApps().length === 0` prevents re-initialization errors in Next.js dev mode
- We export `auth`, `db`, and `storage` for use throughout the app
- TypeScript ensures type safety

### Step 3.3: Update `.gitignore`

Ensure `.env.local` is ignored (should already be there):

```gitignore
# .gitignore
.env*.local
.env
```

---

## 4. Set Up Authentication

### Step 4.1: Enable Authentication in Firebase Console

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab

#### Enable Email/Password Authentication:
1. Click **Email/Password**
2. Toggle **Enable** to ON
3. Leave "Email link (passwordless sign-in)" OFF for now
4. Click **Save**

#### Enable Google Authentication:
1. Click **Google**
2. Toggle **Enable** to ON
3. **Project support email**: Select your email from dropdown
4. Click **Save**

### Step 4.2: Create Authentication Service

Create `src/lib/firebase/auth.ts`:

```typescript
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
```

### Step 4.3: Create Auth Context Provider

Create `src/app/context/AuthContext.tsx`:

```typescript
// src/app/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
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

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Step 4.4: Add AuthProvider to Layout

Update `src/app/(site)/layout.tsx`:

```typescript
import { AuthProvider } from '../context/AuthContext';

// Add AuthProvider to the provider chain:
// ReduxProvider → AuthProvider → CartModalProvider → ModalProvider → PreviewSliderProvider

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthProvider>
            <CartModalProvider>
              <ModalProvider>
                <PreviewSliderProvider>
                  {/* ... */}
                </PreviewSliderProvider>
              </ModalProvider>
            </CartModalProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
```

---

## 5. Set Up Firestore Database

### Step 5.1: Create Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. **Location**: Choose a location close to your users (e.g., `us-central`, `europe-west`)
   - **Note**: This CANNOT be changed later!
4. Click **Next**
5. **Security rules**: Select **Start in test mode** (we'll update rules later)
   - Test mode allows read/write for 30 days
6. Click **Enable**
7. Wait for database creation

### Step 5.2: Create Firestore Service Layer

Create `src/lib/firebase/firestore.ts`:

```typescript
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
```

---

## 6. Database Structure Design

### Firestore Collections Schema

Here's the recommended database structure for your eCommerce app:

#### **Collection: `users`**
```typescript
{
  uid: string;              // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;        // ISO timestamp
  updatedAt: string;

  // Optional fields
  phone?: string;
  addresses?: Array<{
    id: string;
    type: 'billing' | 'shipping';
    firstName: string;
    lastName: string;
    company?: string;
    streetAddress: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
}
```

#### **Collection: `products`**
```typescript
{
  id: string;               // Auto-generated
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  categoryId: string;
  reviews: number;          // Average rating
  reviewCount: number;
  stock: number;
  sku: string;

  images: {
    thumbnails: string[];   // URLs to thumbnail images
    previews: string[];     // URLs to full-size images
  };

  // Product details
  brand?: string;
  tags?: string[];
  colors?: string[];
  sizes?: string[];

  // SEO
  slug: string;             // URL-friendly title
  metaDescription?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Status
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
}
```

#### **Collection: `categories`**
```typescript
{
  id: string;
  title: string;
  slug: string;
  description?: string;
  image: string;
  productCount: number;
  isActive: boolean;
  order: number;            // Display order
  createdAt: string;
  updatedAt: string;
}
```

#### **Collection: `orders`**
```typescript
{
  id: string;               // Auto-generated
  userId: string;           // Reference to users collection
  orderNumber: string;      // e.g., "ORD-2024-00123"

  // Customer info
  customer: {
    name: string;
    email: string;
    phone: string;
  };

  // Addresses
  billingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    streetAddress: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    streetAddress: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Order items
  items: Array<{
    productId: string;
    title: string;
    price: number;
    discountedPrice?: number;
    quantity: number;
    thumbnail: string;
  }>;

  // Pricing
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;

  // Shipping & payment
  shippingMethod: {
    name: string;
    cost: number;
    estimatedDays?: string;
  };

  paymentMethod: string;    // 'cod', 'card', etc.
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

  // Order status
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

  // Additional info
  notes?: string;
  couponCode?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}
```

#### **Collection: `carts`**
```typescript
{
  id: string;               // userId
  userId: string;
  items: Array<{
    productId: string;
    title: string;
    price: number;
    discountedPrice?: number;
    quantity: number;
    thumbnail: string;
  }>;
  updatedAt: string;
}
```

#### **Collection: `wishlists`**
```typescript
{
  id: string;               // userId
  userId: string;
  items: Array<{
    productId: string;
    addedAt: string;
  }>;
  updatedAt: string;
}
```

#### **Collection: `reviews`** (Optional - for future)
```typescript
{
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;           // 1-5
  comment: string;
  helpful: number;          // Number of helpful votes
  createdAt: string;
  verified: boolean;        // Verified purchase
}
```

#### **Collection: `blog`** (Optional)
```typescript
{
  id: string;
  title: string;
  slug: string;
  content: string;          // Markdown or HTML
  excerpt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  featuredImage: string;
  category: string;
  tags: string[];
  views: number;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 7. Security Rules

### Step 7.1: Set Up Basic Security Rules

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }

    // Products collection (public read, admin write)
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // TODO: Add admin check
    }

    // Categories collection (public read, admin write)
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if false; // TODO: Add admin check
    }

    // Orders collection
    match /orders/{orderId} {
      allow read: if isSignedIn() &&
                     (resource.data.userId == request.auth.uid);
      allow create: if isSignedIn() &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // TODO: Add admin check
    }

    // Carts collection
    match /carts/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Wishlists collection
    match /wishlists/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Blog collection (public read, admin write)
    match /blog/{postId} {
      allow read: if true;
      allow write: if false; // TODO: Add admin check
    }

    // Reviews collection (optional)
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() &&
                               resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click **Publish**

**Note**: We'll add admin role checking later when we build the admin dashboard.

---

## 8. Testing Your Setup

### Step 8.1: Test Firebase Connection

Create a test file `src/app/test-firebase/page.tsx`:

```typescript
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { signInWithGoogle, logOut } from '@/lib/firebase/auth';

export default function TestFirebase() {
  const { user, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      alert('Sign in successful!');
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Sign in failed. Check console.');
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      alert('Signed out!');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Firebase Test Page</h1>

      {user ? (
        <div>
          <p>Signed in as: {user.email}</p>
          <p>Display name: {user.displayName}</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <p>Not signed in</p>
          <button onClick={handleGoogleSignIn}>Sign in with Google</button>
        </div>
      )}
    </div>
  );
}
```

### Step 8.2: Run the Test

1. Start your dev server: `npm run dev`
2. Navigate to `http://localhost:3000/test-firebase`
3. Click "Sign in with Google"
4. Check if sign in works
5. Check if sign out works

### Step 8.3: Verify in Firebase Console

1. Go to **Authentication** → **Users** tab
2. You should see your test user listed
3. Go to **Firestore Database**
4. Try adding a test collection manually to verify database access

---

## 9. Vercel Deployment

### Step 9.1: Prepare for Deployment

1. Ensure `.env.local` is in `.gitignore`
2. Test your app locally: `npm run build && npm start`
3. Fix any build errors

### Step 9.2: Deploy to Vercel

1. Install Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

2. **Option A: Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com/)
   - Import your Git repository
   - Configure environment variables (see Step 9.3)
   - Deploy

3. **Option B: Deploy via CLI**
   ```bash
   vercel
   ```

### Step 9.3: Add Environment Variables in Vercel

1. In Vercel Dashboard, go to your project → **Settings** → **Environment Variables**
2. Add each variable from your `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

3. Make sure to select **Production**, **Preview**, and **Development** for each variable

### Step 9.4: Update Firebase Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your Vercel domain (e.g., `your-app.vercel.app`)
3. Add your custom domain if you have one

### Step 9.5: Test Production Deployment

1. Visit your Vercel deployment URL
2. Test authentication flow
3. Check browser console for any errors
4. Verify Firebase connection

---

## Common Issues & Troubleshooting

### Issue: "Firebase app already initialized"
**Solution**: Check that you're using the singleton pattern in `src/lib/firebase/config.ts`:
```typescript
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
```

### Issue: "Missing or insufficient permissions"
**Solution**: Check Firestore security rules. In development, you can temporarily use:
```javascript
allow read, write: if true;
```
But NEVER use this in production!

### Issue: Google Sign-In popup blocked
**Solution**:
- Make sure your domain is added to Firebase Authorized domains
- Check browser popup blocker settings

### Issue: Environment variables not working
**Solution**:
- Ensure variables start with `NEXT_PUBLIC_`
- Restart dev server after adding new variables
- Check for typos in variable names

### Issue: Firestore writes not working
**Solution**:
- Check security rules
- Verify user is authenticated before writing
- Check Firebase Console for error logs

---

## Next Steps

After completing this setup:

1. **Integrate Authentication into UI**
   - Update sign in/sign up pages
   - Add user menu to header
   - Implement protected routes

2. **Migrate Product Data**
   - Create migration script to import static products to Firestore
   - Update components to fetch from Firestore

3. **Implement Cart Persistence**
   - Sync Redux cart with Firestore
   - Load cart on user login

4. **Build Checkout Flow**
   - Save orders to Firestore
   - Send confirmation emails

5. **Create Admin Dashboard**
   - Build admin UI for product management
   - Add admin role to users
   - Implement CRUD operations

---

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Vercel Deployment](https://vercel.com/docs)

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Author**: Claude Code Assistant

For questions or issues, refer to the troubleshooting section or Firebase documentation.
