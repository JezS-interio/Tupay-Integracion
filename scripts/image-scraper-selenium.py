#!/usr/bin/env python3
"""
Product Image Scraper with Selenium
Downloads product images using a real browser to avoid blocking.
More reliable than simple HTTP requests.
"""

import os
import requests
import time
import json
from pathlib import Path
import re
from urllib.parse import quote_plus

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

# Configuration
OUTPUT_DIR = "downloaded_images"
IMAGES_PER_PRODUCT = 5
TIMEOUT = 10

class ProductImageScraperSelenium:
    def __init__(self, output_dir=OUTPUT_DIR, headless=True):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.headless = headless
        self.driver = None

    def init_driver(self):
        """Initialize Selenium WebDriver"""
        if not SELENIUM_AVAILABLE:
            raise ImportError(
                "Selenium is not installed. Install with:\n"
                "  pip install selenium\n\n"
                "You'll also need Chrome/Chromium browser installed."
            )

        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

        try:
            self.driver = webdriver.Chrome(options=chrome_options)
        except Exception as e:
            print(f"\n❌ Failed to initialize Chrome driver: {e}")
            print("\nTrying with default webdriver...")
            self.driver = webdriver.Chrome(options=chrome_options)

    def sanitize_filename(self, text):
        """Convert text to safe filename"""
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-').lower()

    def download_image(self, url, save_path):
        """Download a single image from URL"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=TIMEOUT, stream=True)
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

    def scrape_google_images(self, query, max_images=IMAGES_PER_PRODUCT):
        """Scrape images from Google Images using Selenium"""
        print(f"\n🔍 Searching Google Images for: {query}")

        search_url = f"https://www.google.com/search?q={quote_plus(query)}&tbm=isch"

        try:
            self.driver.get(search_url)
            time.sleep(2)  # Wait for page load

            # Scroll to load more images
            for _ in range(3):
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)

            # Find image elements
            image_urls = []
            images = self.driver.find_elements(By.CSS_SELECTOR, "img")

            for img in images:
                try:
                    src = img.get_attribute('src')
                    if src and src.startswith('http') and 'base64' not in src:
                        if src not in image_urls:
                            image_urls.append(src)
                            if len(image_urls) >= max_images * 2:
                                break
                except:
                    continue

            print(f"  ✅ Found {len(image_urls)} image URLs")
            return image_urls

        except Exception as e:
            print(f"  ❌ Error: {e}")
            return []

    def scrape_product(self, product_name, max_images=IMAGES_PER_PRODUCT):
        """Scrape images for a single product"""
        print(f"\n{'='*60}")
        print(f"📦 Product: {product_name}")
        print(f"{'='*60}")

        folder_name = self.sanitize_filename(product_name)
        product_dir = self.output_dir / folder_name
        product_dir.mkdir(exist_ok=True)

        image_urls = self.scrape_google_images(product_name, max_images)

        if not image_urls:
            print(f"  ❌ No images found")
            return 0

        print(f"\n📥 Downloading images to: {product_dir}")
        downloaded = 0

        for i, url in enumerate(image_urls):
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

        print(f"\n✅ Downloaded {downloaded} images for {product_name}")
        return downloaded

    def scrape_products_from_file(self, filepath):
        """Scrape products from configuration file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            config = json.load(f)

        products = config.get('products', [])
        total_downloaded = 0

        print(f"\n🚀 Starting scrape for {len(products)} products...")
        print(f"📁 Output directory: {self.output_dir.absolute()}")

        # Initialize driver
        print("\n🌐 Initializing browser...")
        self.init_driver()

        try:
            for product in products:
                query = product.get('query', product.get('name', ''))
                max_images = product.get('max_images', IMAGES_PER_PRODUCT)

                downloaded = self.scrape_product(query, max_images)
                total_downloaded += downloaded

                time.sleep(2)

        finally:
            if self.driver:
                self.driver.quit()

        print(f"\n{'='*60}")
        print(f"🎉 Scraping complete!")
        print(f"📊 Total images downloaded: {total_downloaded}")
        print(f"📁 Location: {self.output_dir.absolute()}")
        print(f"{'='*60}\n")

        return total_downloaded

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.driver:
            self.driver.quit()


def main():
    """Main entry point"""
    print("""
╔═══════════════════════════════════════════════════════════╗
║      IntiTech Product Image Scraper (Selenium)            ║
║                                                           ║
║  Downloads product images using browser automation       ║
╚═══════════════════════════════════════════════════════════╝
    """)

    if not SELENIUM_AVAILABLE:
        print("❌ Selenium is not installed!")
        print("\n📦 Install dependencies:")
        print("  pip install selenium")
        print("\n🌐 You also need Chrome or Chromium browser installed")
        return

    config_file = Path("scraper-config.json")

    if not config_file.exists():
        print("❌ Configuration file not found!")
        print(f"📝 Please create '{config_file}' first")
        return

    scraper = ProductImageScraperSelenium()
    scraper.scrape_products_from_file(config_file)


if __name__ == "__main__":
    main()
