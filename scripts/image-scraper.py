#!/usr/bin/env python3
"""
Product Image Scraper
Downloads product images from various e-commerce sources for the IntiTech store.
Images are saved to the 'downloaded_images' folder organized by product.
"""

import os
import requests
import time
import json
from urllib.parse import quote_plus, urljoin
from pathlib import Path
import re

# Configuration
OUTPUT_DIR = "downloaded_images"
IMAGES_PER_PRODUCT = 5
TIMEOUT = 10
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

class ProductImageScraper:
    def __init__(self, output_dir=OUTPUT_DIR):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })

    def sanitize_filename(self, text):
        """Convert text to safe filename"""
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-').lower()

    def download_image(self, url, save_path):
        """Download a single image from URL"""
        try:
            response = self.session.get(url, timeout=TIMEOUT, stream=True)
            response.raise_for_status()

            # Check if it's actually an image
            content_type = response.headers.get('content-type', '')
            if 'image' not in content_type.lower():
                print(f"  ⚠️  Not an image: {content_type}")
                return False

            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            # Verify file size
            if os.path.getsize(save_path) < 1024:  # Less than 1KB
                os.remove(save_path)
                print(f"  ⚠️  Image too small, skipped")
                return False

            return True
        except Exception as e:
            print(f"  ❌ Error downloading: {e}")
            if os.path.exists(save_path):
                os.remove(save_path)
            return False

    def scrape_bing_images(self, query, max_images=IMAGES_PER_PRODUCT):
        """Scrape images from Bing Image Search (more lenient than Google)"""
        print(f"\n🔍 Searching Bing Images for: {query}")

        image_urls = []
        search_url = f"https://www.bing.com/images/search?q={quote_plus(query)}&form=HDRSC2&first=1"

        try:
            response = self.session.get(search_url, timeout=TIMEOUT)
            response.raise_for_status()

            # Extract image URLs from Bing's response
            # Bing includes images in the HTML with data attributes
            html = response.text

            # Find all image URLs in the page
            # Bing uses various patterns, we'll try multiple approaches
            patterns = [
                r'"murl":"([^"]+)"',  # Main URL pattern
                r'"turl":"([^"]+)"',  # Thumbnail URL pattern (fallback)
            ]

            for pattern in patterns:
                matches = re.findall(pattern, html)
                for match in matches:
                    # Decode the URL
                    url = match.replace('\\u002f', '/')
                    if url.startswith('http') and url not in image_urls:
                        image_urls.append(url)
                        if len(image_urls) >= max_images * 2:  # Get extra in case some fail
                            break
                if len(image_urls) >= max_images * 2:
                    break

            print(f"  ✅ Found {len(image_urls)} image URLs")

        except Exception as e:
            print(f"  ❌ Error searching Bing: {e}")

        return image_urls[:max_images * 2]  # Return extra URLs as backup

    def scrape_duckduckgo_images(self, query, max_images=IMAGES_PER_PRODUCT):
        """Scrape images from DuckDuckGo (no rate limiting)"""
        print(f"\n🦆 Searching DuckDuckGo Images for: {query}")

        image_urls = []

        try:
            # DuckDuckGo image search endpoint
            url = "https://duckduckgo.com/"
            params = {
                'q': query,
                'iax': 'images',
                'ia': 'images'
            }

            # Get the page first
            response = self.session.get(url, params=params, timeout=TIMEOUT)
            response.raise_for_status()

            # Get the vqd token (required for image API)
            vqd_match = re.search(r'vqd=([\d-]+)', response.text)
            if not vqd_match:
                print("  ⚠️  Could not find vqd token")
                return []

            vqd = vqd_match.group(1)

            # Now get the actual images
            api_url = "https://duckduckgo.com/i.js"
            params = {
                'l': 'us-en',
                'o': 'json',
                'q': query,
                'vqd': vqd,
                'f': ',,,',
                'p': '1',
                'v7exp': 'a'
            }

            response = self.session.get(api_url, params=params, timeout=TIMEOUT)
            response.raise_for_status()

            data = response.json()
            results = data.get('results', [])

            for result in results[:max_images * 2]:
                img_url = result.get('image')
                if img_url and img_url.startswith('http'):
                    image_urls.append(img_url)

            print(f"  ✅ Found {len(image_urls)} image URLs")

        except Exception as e:
            print(f"  ⚠️  DuckDuckGo error: {e}")

        return image_urls

    def scrape_product(self, product_name, max_images=IMAGES_PER_PRODUCT):
        """Scrape images for a single product"""
        print(f"\n{'='*60}")
        print(f"📦 Product: {product_name}")
        print(f"{'='*60}")

        # Create product folder
        folder_name = self.sanitize_filename(product_name)
        product_dir = self.output_dir / folder_name
        product_dir.mkdir(exist_ok=True)

        # Try DuckDuckGo first (more reliable)
        image_urls = self.scrape_duckduckgo_images(product_name, max_images)

        # If DuckDuckGo fails, try Bing
        if len(image_urls) < max_images:
            print("\n  Trying Bing as backup...")
            bing_urls = self.scrape_bing_images(product_name, max_images)
            image_urls.extend(bing_urls)

        if not image_urls:
            print(f"  ❌ No images found for {product_name}")
            return 0

        # Download images
        print(f"\n📥 Downloading images to: {product_dir}")
        downloaded = 0

        for i, url in enumerate(image_urls):
            if downloaded >= max_images:
                break

            # Determine file extension
            ext = 'jpg'
            if '.png' in url.lower():
                ext = 'png'
            elif '.webp' in url.lower():
                ext = 'webp'

            filename = f"{folder_name}-{downloaded + 1}.{ext}"
            save_path = product_dir / filename

            print(f"  [{downloaded + 1}/{max_images}] {filename}...", end=" ")

            if self.download_image(url, save_path):
                print("✅")
                downloaded += 1

            # Be polite, don't hammer the server
            time.sleep(0.5)

        print(f"\n✅ Downloaded {downloaded} images for {product_name}")
        return downloaded

    def scrape_products_from_file(self, filepath):
        """Scrape products from a JSON configuration file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            config = json.load(f)

        products = config.get('products', [])
        total_downloaded = 0

        print(f"\n🚀 Starting scrape for {len(products)} products...")
        print(f"📁 Output directory: {self.output_dir.absolute()}")

        for product in products:
            query = product.get('query', product.get('name', ''))
            max_images = product.get('max_images', IMAGES_PER_PRODUCT)

            downloaded = self.scrape_product(query, max_images)
            total_downloaded += downloaded

            # Rate limiting between products
            time.sleep(2)

        print(f"\n{'='*60}")
        print(f"🎉 Scraping complete!")
        print(f"📊 Total images downloaded: {total_downloaded}")
        print(f"📁 Location: {self.output_dir.absolute()}")
        print(f"{'='*60}\n")

        return total_downloaded


def main():
    """Main entry point"""
    print("""
╔═══════════════════════════════════════════════════════════╗
║           IntiTech Product Image Scraper                  ║
║                                                           ║
║  Downloads product images from the web for your store    ║
╚═══════════════════════════════════════════════════════════╝
    """)

    # Check if config file exists
    config_file = Path("scraper-config.json")

    if not config_file.exists():
        print("❌ Configuration file not found!")
        print(f"📝 Please create '{config_file}' first")
        print("\nExample format:")
        print("""
{
  "products": [
    {
      "name": "Samsung Galaxy S23",
      "query": "Samsung Galaxy S23 smartphone product image white background",
      "max_images": 5
    },
    {
      "name": "MacBook Pro M3",
      "query": "MacBook Pro M3 2024 laptop product image",
      "max_images": 5
    }
  ]
}
        """)
        return

    scraper = ProductImageScraper()
    scraper.scrape_products_from_file(config_file)


if __name__ == "__main__":
    main()
