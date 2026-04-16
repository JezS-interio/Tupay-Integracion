# Bulk Import Guide

This folder is used for bulk importing products and banners to Firebase.

## How to Use:

### 1. Prepare Your Images

**For Products:**
- Put product images in: `/public/import-data/products/images/`
- Example: `iphone-14-pro-1.jpg`, `macbook-pro-1.jpg`

**For Banners:**
- Put banner images in: `/public/import-data/banners/images/`
- Example: `banner-headphones.jpg`, `banner-sale.jpg`

### 2. Edit JSON Files

**Products** (`/public/import-data/products/products.json`):
```json
[
  {
    "title": "Product Name",
    "description": "Product description...",
    "price": 99.99,
    "discountedPrice": 79.99,
    "category": "Electronics",
    "stock": 50,
    "sku": "PRD-001",
    "images": ["image1.jpg", "image2.jpg"],
    "isActive": true,
    "isFeatured": true,
    "isNewArrival": false,
    "isBestSeller": false
  }
]
```

**Banners** (`/public/import-data/banners/banners.json`):
```json
[
  {
    "title": "Banner Title",
    "subtitle": "Subtitle text",
    "description": "Description...",
    "buttonText": "Shop Now",
    "buttonLink": "/shop",
    "badge": "30% Off",
    "image": "banner-image.jpg",
    "order": 1,
    "isActive": true
  }
]
```

### 3. Run Import

1. Go to: `http://localhost:3000/admin/import`
2. Select "Products" or "Banners"
3. Click "Import" button
4. Watch the console (F12) for progress
5. Done! Images auto-upload to Firebase Storage

## Categories Available:
- Accessories
- Smartphones
- Computers
- Wearables
- Tablets
- Networking
- Electronics

## Notes:
- Images will be automatically uploaded to Firebase Storage
- Product images can have multiple images (array)
- Banner images only need one image
- SKU is optional (auto-generated if not provided)
- All prices should be numbers (not strings)
- Stock should be a number
