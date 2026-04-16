# 🔒 Firestore Security Rules - Production Ready

## ⚠️ CRITICAL: Update Your Firebase Rules NOW

Your current setup allows client-side writes to products, which is a security risk. Here are the proper rules:

## Option 1: Basic Security (Localhost-Only Admin)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products: Public read, NO client-side writes
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Admin operations should use Firebase Admin SDK
    }

    // Users can read/write their own cart
    match /user_carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read/write their own abandoned cart
    match /abandoned_carts/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }

    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Banners: Public read, no client writes
    match /banners/{bannerId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Option 2: With Admin Authentication (RECOMMENDED)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }

    // Products: Public read, admin-only write
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Admin collection
    match /admins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only set via Firebase Console or Admin SDK
    }

    // Users can read/write their own cart
    match /user_carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read/write their own abandoned cart
    match /abandoned_carts/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }

    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Banners: Public read, admin-only write
    match /banners/{bannerId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Orders: Users can read own orders, admins can read all
    match /orders/{orderId} {
      allow read: if request.auth != null &&
                     (request.auth.uid == resource.data.userId || isAdmin());
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }
  }
}
```

## 📋 How to Update (DO THIS NOW!)

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com
2. Select your project: **intitech-development**
3. Navigate to: **Firestore Database** → **Rules**

### Step 2: Choose Your Security Level

#### For Development (Localhost-Only Admin):
- Copy **Option 1** rules above
- This prevents public writes but your localhost admin pages won't work in production
- ⚠️ Your admin pages currently write from the browser, so this will break them!

#### For Production (Recommended):
- Copy **Option 2** rules above
- Create an admin user in Firestore manually
- Your admin pages will work securely from anywhere

### Step 3: Set Up Admin User (If using Option 2)

Go to Firestore and manually create this document:

**Collection:** `admins`
**Document ID:** `YOUR_FIREBASE_AUTH_UID`
**Fields:**
```json
{
  "isAdmin": true,
  "email": "your@email.com",
  "createdAt": "2026-01-15"
}
```

### Step 4: Update Admin Pages for Authentication

Your admin pages will need to:
1. Require user login
2. Check if user is admin
3. Only then allow product modifications

## ⚠️ CURRENT SECURITY RISKS

**What's exposed right now:**

1. **Your Firebase API keys are public** ✅ This is normal and safe
2. **Your Firestore rules might allow public writes** ❌ THIS IS THE REAL RISK
3. **Admin pages work without authentication** ❌ Only protected by localhost check

## 🎯 Action Items (Priority Order)

1. **IMMEDIATELY:** Check your current Firestore rules
2. **HIGH PRIORITY:** Update rules to prevent public writes
3. **MEDIUM PRIORITY:** Add authentication to admin pages
4. **LOW PRIORITY:** Don't worry about hiding the API keys (can't be hidden)

## 🔍 Check Your Current Rules

Run this in Firebase Console:
1. Go to Firestore Database → Rules
2. Look at your `products` collection rules
3. If you see `allow write: if true`, **you have a security issue**

## Summary

**The API Keys being public = TOTALLY FINE ✅**
**Your Firestore Rules = NEEDS IMMEDIATE ATTENTION ⚠️**

The keys are meant to be public. The rules are what protect your data!
