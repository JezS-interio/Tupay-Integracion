# 🔍 Firestore Index Required

## ⚠️ Product Details Page Not Working - Index Missing

The product detail page is showing "Product not found" because a Firestore composite index is missing.

### The Issue

When clicking a product from the carousel, the app queries Firestore using:
```javascript
where('id', '==', productId)
where('isActive', '==', true)
```

This composite query requires a Firestore index that doesn't exist yet.

### ✅ How to Fix (Takes 2 minutes)

#### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com
2. Select your project: **intitech-development**
3. Navigate to: **Firestore Database** → **Indexes**

#### Step 2: Create the Composite Index

Click **"Create Index"** and enter:

- **Collection ID:** `products`
- **Fields to index:**
  1. Field: `id` → Order: `Ascending`
  2. Field: `isActive` → Order: `Ascending`
- **Query scopes:** Collection

Click **Create Index**

#### Step 3: Wait for Index to Build

The index usually takes 1-5 minutes to build. You'll see the status change from "Building" to "Enabled".

### 🎯 What This Fixes

After creating this index:
- ✅ Clicking products from the carousel will load the product detail page
- ✅ Product links from anywhere in the site will work correctly
- ✅ No more "Product not found" errors

### Alternative: Click the Error Link

When you click a product and get the error, Firebase will show an error in the browser console with a direct link to create the index. You can click that link and it will pre-fill the index creation form for you.

### Current Status

**Affected:** Product detail page (`/shop-details?id=...`)
**Cause:** Missing Firestore composite index for `id` + `isActive`
**Fix Time:** 2 minutes to create + 1-5 minutes for index to build
