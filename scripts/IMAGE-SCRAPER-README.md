# Product Image Scraper for IntiTech

A collection of Python scripts to download product images from various sources for your eCommerce store.

## 📦 What's Included

### 1. **image-scraper-simple.py** (RECOMMENDED - WORKING ✅)
Downloads high-quality stock photos from **Unsplash**.
- ✅ **Most reliable** - No rate limits
- ✅ **No authentication** required
- ✅ **High quality** product photos
- ⚠️ Note: These are stock photos, not exact product photos

### 2. **image-scraper-selenium.py** (Advanced)
Uses browser automation to scrape Google Images.
- Requires Selenium and Chrome browser
- More complex setup
- Better for finding exact product matches
- May be rate-limited

### 3. **image-scraper.py** (Basic)
Basic HTTP scraper for DuckDuckGo and Bing.
- Currently blocked by anti-bot measures
- Kept for reference only

---

## 🚀 Quick Start (Recommended Method)

### Step 1: Configuration

Edit `scraper-config.json` to add your products:

```json
{
  "products": [
    {
      "name": "iPhone 15 Pro Max",
      "query": "iPhone 15 Pro Max smartphone product image white background",
      "max_images": 5
    },
    {
      "name": "MacBook Pro M3",
      "query": "MacBook Pro M3 laptop product photography",
      "max_images": 5
    }
  ]
}
```

**Tips for better results:**
- Include keywords like "product image", "white background", "product photography"
- Be specific with model numbers
- Add "professional" or "studio" for better quality

### Step 2: Run the Scraper

```bash
cd scripts
python3 image-scraper-simple.py
```

### Step 3: Find Your Images

Images will be in: `scripts/downloaded_images/`

Each product gets its own folder:
```
downloaded_images/
├── iphone-15-pro-max/
│   ├── iphone-15-pro-max-1.jpg
│   ├── iphone-15-pro-max-2.jpg
│   └── ...
├── macbook-pro-m3/
│   └── ...
```

---

## 🔧 Advanced: Selenium Scraper

For more exact product matches, use the Selenium scraper:

### Prerequisites

```bash
# Install Selenium
pip install selenium

# Install Chrome/Chromium browser (if not already installed)
# Ubuntu/Debian:
sudo apt install chromium-browser

# Or download Chrome from google.com/chrome
```

### Usage

```bash
python3 image-scraper-selenium.py
```

This will:
- Open a real browser (headless mode)
- Search Google Images for each product
- Download the images automatically

---

## 📝 Configuration Reference

### Product Object

```json
{
  "name": "Product Name",           // Used for folder name
  "query": "search keywords",       // What to search for
  "max_images": 5                   // How many images to download
}
```

### Example Queries

**For Electronics:**
```json
"query": "Samsung Galaxy S24 product photo white background"
"query": "Dell XPS 15 laptop professional photography"
"query": "Sony WH-1000XM5 headphones studio shot"
```

**For Accessories:**
```json
"query": "wireless mouse product image clean background"
"query": "USB-C cable product photography"
```

---

## 📊 Sample Output

When you run the scraper, you'll see:

```
🚀 Starting scrape for 15 products...
📁 Output directory: /path/to/downloaded_images

============================================================
📦 Product: iPhone 15 Pro Max
============================================================

🔍 Searching Unsplash for: iPhone 15 Pro Max...
  ✅ Found 20 images

📥 Downloading images to: downloaded_images/iphone-15-pro-max
  [1/5] iphone-15-pro-max-1.jpg... ✅
  [2/5] iphone-15-pro-max-2.jpg... ✅
  [3/5] iphone-15-pro-max-3.jpg... ✅
  [4/5] iphone-15-pro-max-4.jpg... ✅
  [5/5] iphone-15-pro-max-5.jpg... ✅

✅ Downloaded 5 images
```

---

## 🎯 Next Steps After Downloading

1. **Review Images**: Check the `downloaded_images/` folder
2. **Select Best Images**: Pick the ones you want to use
3. **Upload to R2**: Use the admin panel or upload script
4. **Add to Products**: Link images in product entries

### Upload Images to R2

Option 1: **Using the Admin Panel** (Browser-based)
- Go to: `https://your-site.com/admin/bulk-import`
- Upload images there

Option 2: **Manual Upload Script** (if available)
```bash
# Use your existing R2 upload script
node scripts/uploadToR2.js downloaded_images/
```

---

## ⚙️ Customization

### Change Output Directory

Edit the script's `OUTPUT_DIR` variable:

```python
OUTPUT_DIR = "my_custom_folder"
```

### Change Images Per Product

In the config file:

```json
{
  "name": "Product",
  "query": "search term",
  "max_images": 10  // Download 10 images instead of 5
}
```

### Add More Products

Just add more objects to the `products` array in `scraper-config.json`.

---

## 🐛 Troubleshooting

### "No images found"
- Try different search keywords
- Make the query more generic
- Check internet connection

### "Forbidden" or "403" errors
- Switch to `image-scraper-simple.py` (most reliable)
- Add delays between products (already included)

### Images are not exact product photos
- Stock photos from Unsplash are generic
- Use `image-scraper-selenium.py` for exact matches
- Or manually download from manufacturer websites

### Selenium errors
- Make sure Chrome/Chromium is installed
- Check if `chromium-browser` or `google-chrome` is in PATH
- Try updating Selenium: `pip install --upgrade selenium`

---

## 📜 Dependencies

### For Simple Scraper (Recommended)
- Python 3.6+
- `requests` library (usually pre-installed)

### For Selenium Scraper
- Python 3.6+
- `selenium` library
- Chrome or Chromium browser

### Install Dependencies

```bash
# If needed:
pip install requests

# For Selenium scraper:
pip install selenium
```

---

## 🔗 Image Sources

- **Unsplash**: Free high-quality stock photos (CC0 license)
- **Pexels**: Free stock photos (fallback)
- **Google Images**: Via Selenium (various licenses)

**Important**: Always check image licenses before commercial use. Unsplash images are free for commercial use without attribution (but appreciated).

---

## 💡 Tips for Best Results

1. **Be Specific**: "iPhone 15 Pro Max titanium blue" is better than "phone"
2. **Include Context**: Add "product photography" or "white background"
3. **Try Variations**: If results aren't good, tweak the query
4. **Quality Over Quantity**: 3 good images beat 10 mediocre ones
5. **Review Before Upload**: Always check images before adding to store

---

## 📞 Need Help?

If you encounter issues:
1. Check this README's troubleshooting section
2. Try the simple scraper first (`image-scraper-simple.py`)
3. Verify your `scraper-config.json` syntax
4. Check that Python and dependencies are installed

---

## ✨ Example Config

Here's a complete example configuration:

```json
{
  "products": [
    {
      "name": "iPhone 15 Pro",
      "query": "iPhone 15 Pro smartphone product image white background",
      "max_images": 5
    },
    {
      "name": "AirPods Pro 2",
      "query": "AirPods Pro 2nd generation product photography",
      "max_images": 5
    },
    {
      "name": "MacBook Air M3",
      "query": "MacBook Air M3 2024 laptop professional photo",
      "max_images": 5
    }
  ]
}
```

Save this as `scraper-config.json` and run:
```bash
python3 image-scraper-simple.py
```

Happy scraping! 🎉
