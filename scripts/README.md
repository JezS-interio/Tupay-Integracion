# Product Import Scripts

Complete workflows for adding new products with images to your eCommerce site.

---

## 🔧 Two Import Workflows Available

### Workflow A: Kitchen/Home Appliances (from URLs)
For downloading images from URLs and preparing product data.

### Workflow B: Smartphones (from local files)
For preparing smartphone products from existing image files.

---

## 📋 Workflow A: Kitchen/Home Appliances

### Step 1: Download Images and Prepare Data
```bash
python download-and-prepare-products.py
```

**Input:** `C:\Users\Napo\Desktop\New Text Document.txt` (list of image URLs)

**Output:**
- `new_products/*.jpg` - Downloaded images
- `new_products/products_data.json` - Product details (names, descriptions, pricing)

**What it does:**
- Downloads all images from URLs
- Analyzes URLs to detect product types
- Auto-generates realistic product names, brands, models
- Creates detailed descriptions
- Generates appropriate pricing with discounts
- Adds specifications, ratings, reviews

---

### Step 2: Upload Images to Cloudflare R2
```bash
node upload-new-products-to-r2.js
```

**Requirements:** `.env.local` must contain:
```
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
```

**Output:**
- Images uploaded to R2 at `products/[filename].jpg`
- `new_products/r2-urls.json` - Mapping of filenames to R2 URLs

---

### Step 3: Import Products to Firestore

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:3000/admin/import-new-products

3. Upload files:
   - `scripts/new_products/products_data.json`
   - `scripts/new_products/r2-urls.json`

4. Click "Import to Firestore"

**Result:** All products will be added to your Firestore database with:
- R2 image URLs
- Complete product details
- `isActive: true` flag
- Proper structure for your shop pages

---

## 📁 File Structure

```
scripts/
├── download-and-prepare-products.py  # Step 1: Download images
├── upload-new-products-to-r2.js      # Step 2: Upload to R2
├── new_products/                      # Output directory
│   ├── *.jpg                          # Downloaded images
│   ├── products_data.json             # Product details
│   └── r2-urls.json                   # R2 URL mapping
└── README.md                          # This file
```

---

## ⚙️ Configuration

### Input File Format
Text file with one image URL per line:
```
https://example.com/image1.jpg
https://example.com/image2.jpg
```

### Supported Product Types
The script auto-detects these types from URLs:
- Blenders
- Electric Kettles
- Electric Mixers
- Coffee Makers
- Toasters
- Steam Irons
- Electric Fans
- Hair Dryers
- Table Lamps

---

## 🔧 Troubleshooting

### "Input file not found"
- Check that `C:\Users\Napo\Desktop\New Text Document.txt` exists
- Update `INPUT_FILE` variable in download script if needed

### "Missing R2 credentials"
- Verify `.env.local` exists in project root
- Check all R2 variables are set correctly

### "Failed to upload"
- Check R2 credentials are valid
- Ensure R2 bucket exists
- Verify network connection

### Images not showing on site
- Clear browser cache (Ctrl+Shift+R)
- Check R2 public URL is accessible
- Verify `next.config.js` includes R2 domain

---

## 📊 Expected Results

After completing all steps:
- 20 new products in Firestore
- Images hosted on Cloudflare R2
- Products visible on shop pages
- Proper categorization and pricing
- Professional descriptions

---

---

## 📋 Workflow B: Smartphones (Local Files)

### Step 1: Prepare Product Data from Local Images
```bash
python prepare-phone-products.py
```

**Input:** Local image files in `/mnt/c/Users/Napo/Downloads/drive-download-20260115T160824Z-3-001/`

**Output:**
- `phone_products/*.webp` / `*.jpg` - Processed images
- `phone_products/products_data.json` - Product details

**What it does:**
- Analyzes filenames to extract brand, model, color
- Auto-detects iPhone, Samsung Galaxy, Google Pixel models
- Creates detailed smartphone descriptions
- Generates realistic specifications (display, storage, processor, camera)
- Generates appropriate pricing for each model

### Step 2: Upload Images to Cloudflare R2
```bash
node upload-phone-products-to-r2.js
```

**Requirements:** `.env.local` with R2 credentials (same as Workflow A)

**Output:**
- Images uploaded to R2 at `products/phones/[filename]`
- `phone_products/r2-urls.json` - Mapping of filenames to R2 URLs

### Step 3: Import Products to Firestore

1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/admin/import-phone-products
3. Upload both JSON files from `scripts/phone_products/`
4. Click "Import to Firestore"

**Result:** Smartphone products added with:
- Apple iPhones (11, 14 Pro Max, 15, 15 Pro, 16)
- Samsung Galaxy (S24 Ultra, A Series)
- Google Pixel (7, 7 Pro)
- Accurate pricing ($449-$1199)
- Realistic specs and descriptions

---

## 🎯 Quick Start

### For Appliances (Workflow A):
```bash
python download-and-prepare-products.py
node upload-new-products-to-r2.js
# Then go to: http://localhost:3000/admin/import-new-products
```

### For Smartphones (Workflow B):
```bash
python prepare-phone-products.py
node upload-phone-products-to-r2.js
# Then go to: http://localhost:3000/admin/import-phone-products
```
