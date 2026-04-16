#!/usr/bin/env python3
"""
Simple Product Image Scraper
Downloads product images from Unsplash (free stock photos) based on keywords.
No authentication required, no rate limits.
"""

import os
import requests
import time
import json
from pathlib import Path
import re

# Configuration
OUTPUT_DIR = "downloaded_images"
IMAGES_PER_PRODUCT = 5
TIMEOUT = 10

class SimpleImageScraper:
    def __init__(self, output_dir=OUTPUT_DIR):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def sanitize_filename(self, text):
        """Convert text to safe filename"""
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-').lower()

    def search_unsplash(self, query, max_images=IMAGES_PER_PRODUCT):
        """Search Unsplash for product images (no API key needed for basic search)"""
        print(f"\n🔍 Searching Unsplash for: {query}")

        image_urls = []

        try:
            # Unsplash photos page
            search_url = f"https://unsplash.com/napi/search/photos"
            params = {
                'query': query,
                'per_page': max_images * 2,
                'page': 1
            }

            response = self.session.get(search_url, params=params, timeout=TIMEOUT)
            response.raise_for_status()

            data = response.json()
            results = data.get('results', [])

            for result in results:
                urls = result.get('urls', {})
                # Get regular size (good quality, not too large)
                img_url = urls.get('regular', urls.get('full', ''))
                if img_url:
                    image_urls.append(img_url)

            print(f"  ✅ Found {len(image_urls)} images")

        except Exception as e:
            print(f"  ⚠️  Error: {e}")

        return image_urls

    def search_pexels(self, query, max_images=IMAGES_PER_PRODUCT):
        """Search Pexels for product images"""
        print(f"\n🔍 Searching Pexels for: {query}")

        image_urls = []

        try:
            # Pexels search (web scraping, no API key)
            search_url = f"https://www.pexels.com/search/{query}/"

            response = self.session.get(search_url, timeout=TIMEOUT)
            response.raise_for_status()

            # Extract image URLs from HTML
            html = response.text

            # Pexels stores images in specific patterns
            pattern = r'srcset="([^"]+\.jpg[^"]*?)"'
            matches = re.findall(pattern, html)

            for match in matches:
                # Get the highest quality URL from srcset
                urls = match.split(',')
                if urls:
                    img_url = urls[-1].strip().split()[0]
                    if img_url not in image_urls:
                        image_urls.append(img_url)
                        if len(image_urls) >= max_images * 2:
                            break

            print(f"  ✅ Found {len(image_urls)} images")

        except Exception as e:
            print(f"  ⚠️  Error: {e}")

        return image_urls

    def download_image(self, url, save_path):
        """Download a single image"""
        try:
            response = self.session.get(url, timeout=TIMEOUT, stream=True)
            response.raise_for_status()

            content_type = response.headers.get('content-type', '')
            if 'image' not in content_type.lower():
                return False

            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            if os.path.getsize(save_path) < 1024:
                os.remove(save_path)
                return False

            return True
        except Exception as e:
            if os.path.exists(save_path):
                os.remove(save_path)
            return False

    def scrape_product(self, product_name, query=None, max_images=IMAGES_PER_PRODUCT):
        """Scrape images for a single product"""
        print(f"\n{'='*60}")
        print(f"📦 Product: {product_name}")
        print(f"{'='*60}")

        search_query = query or product_name
        folder_name = self.sanitize_filename(product_name)
        product_dir = self.output_dir / folder_name
        product_dir.mkdir(exist_ok=True)

        # Try multiple sources
        image_urls = []

        # Try Unsplash first
        unsplash_urls = self.search_unsplash(search_query, max_images)
        image_urls.extend(unsplash_urls)

        # If not enough, try Pexels
        if len(image_urls) < max_images:
            pexels_urls = self.search_pexels(search_query, max_images)
            image_urls.extend(pexels_urls)

        if not image_urls:
            print(f"  ❌ No images found")
            return 0

        # Download images
        print(f"\n📥 Downloading images to: {product_dir}")
        downloaded = 0

        for url in image_urls:
            if downloaded >= max_images:
                break

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
            else:
                print("❌")

            time.sleep(0.5)

        print(f"\n✅ Downloaded {downloaded} images")
        return downloaded

    def scrape_products_from_file(self, filepath):
        """Scrape products from configuration file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            config = json.load(f)

        products = config.get('products', [])
        total_downloaded = 0

        print(f"\n🚀 Starting scrape for {len(products)} products...")
        print(f"📁 Output directory: {self.output_dir.absolute()}")

        for product in products:
            name = product.get('name', '')
            query = product.get('query', name)
            max_images = product.get('max_images', IMAGES_PER_PRODUCT)

            downloaded = self.scrape_product(name, query, max_images)
            total_downloaded += downloaded

            time.sleep(2)

        print(f"\n{'='*60}")
        print(f"🎉 Scraping complete!")
        print(f"📊 Total images downloaded: {total_downloaded}")
        print(f"📁 Location: {self.output_dir.absolute()}")
        print(f"{'='*60}\n")

        return total_downloaded


def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║     IntiTech Simple Image Scraper (Stock Photos)         ║
║                                                           ║
║  Downloads free stock photos from Unsplash & Pexels      ║
║  ⚠️  Note: These are stock photos, not exact products     ║
╚═══════════════════════════════════════════════════════════╝
    """)

    config_file = Path("scraper-config.json")

    if not config_file.exists():
        print("❌ Configuration file not found!")
        print(f"📝 Please create '{config_file}' first")
        return

    scraper = SimpleImageScraper()
    scraper.scrape_products_from_file(config_file)


if __name__ == "__main__":
    main()
