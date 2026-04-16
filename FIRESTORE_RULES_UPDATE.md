# Firestore Security Rules Update

## Current Issue
The homepage cannot load banners due to Firestore permission errors.

## Required Firestore Rules

Go to Firebase Console → Firestore Database → Rules and add these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products - Public read, admin write
    match /products/{productId} {
      allow read: if true;  // Anyone can read products
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Banners - Public read, admin write
    match /banners/{bannerId} {
      allow read: if true;  // Anyone can read banners
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users - Users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }

    // Orders - Users can read/write their own orders
    match /orders/{orderId} {
      allow read: if request.auth != null &&
                     (request.auth.uid == resource.data.userId ||
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Quick Steps

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Click "Firestore Database" in left sidebar
4. Click "Rules" tab at top
5. Replace ALL rules with the rules above
6. Click "Publish"

## What These Rules Do

✅ **Public Access:**
- Anyone can read products (for shop page)
- Anyone can read banners (for homepage carousel)

✅ **Protected Access:**
- Only admins can write products
- Only admins can write banners
- Only authenticated users can create orders
- Users can only see their own orders

✅ **Security:**
- Prevents unauthorized writes
- Protects user data
- Allows public browsing without login
