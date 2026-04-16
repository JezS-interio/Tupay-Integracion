# Required Firestore Security Rules

Add these rules to your Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Allow users to read/write their own cart
    match /user_carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow users to read/write their own abandoned cart
    match /abandoned_carts/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }

    // Allow users to read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Products are public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Set to true for admin users or use custom claims
    }
  }
}
```

## How to Update

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Paste the rules above
5. Click **Publish**

## What These Rules Do

- **user_carts**: Allows authenticated users to read/write their own cart
- **abandoned_carts**: Allows authenticated users to read/write their own abandoned cart
- **users**: Allows authenticated users to read/write their own profile
- **products**: Public read access, admin-only write (configure as needed)
