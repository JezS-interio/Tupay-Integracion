#!/usr/bin/env python3
"""
GOOGLE IMAGES SCRAPER V2
Fixed selectors and better wait times for 2026 Google Images.
Actually works - gets images from across the web!
"""

import os
import sys
import time
import json
import random
import hashlib
from pathlib import Path
from urllib.parse import quote_plus, urlparse
import requests

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException
except ImportError:
    print("❌ Selenium not installed: pip install selenium")
    sys.exit(1)

OUTPUT_DIR = "downloaded_images"
IMAGES_PER_PRODUCT = 5
TIMEOUT = 30

class GoogleImagesScraper:
    def __init__(self, output_dir=OUTPUT_DIR, headless=True):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.headless = headless
        self.driver = None
        self.domains = {}

    def init_driver(self):
        """Initialize Chrome"""
        print("\n🌐 Starting Chrome...")

        options = Options()
        if self.headless:
            options.add_argument('--headless=new')

        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)

        try:
            self.driver = webdriver.Chrome(options=options)
            # Hide webdriver property
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            print("   ✅ Chrome started!")
            return True
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False

    def sanitize_filename(self, text):
        text = ''.join(c for c in text if c.isalnum() or c in (' ', '-', '_'))
        return text.replace(' ', '-').lower()

    def get_domain(self, url):
        try:
            return urlparse(url).netloc.replace('www.', '')
        except:
            return 'unknown'

    def scrape_google_images(self, query, max_images=50):
        """Scrape Google Images with updated 2026 selectors"""
        print(f"\n🔍 Searching Google Images: {query}")

        urls = []

        try:
            # Navigate to Google Images
            search_url = f"https://www.google.com/search?q={quote_plus(query)}&tbm=isch&hl=en"
            self.driver.get(search_url)

            print("   📄 Page loaded, waiting for images...")
            time.sleep(3)  # Initial load

            # Scroll multiple times to load more images
            last_height = self.driver.execute_script("return document.body.scrollHeight")

            for scroll_num in range(5):
                # Scroll down
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)

                # Try to click "Show more results" if it appears
                try:
                    show_more = self.driver.find_element(By.CSS_SELECTOR, ".LZ4I")
                    show_more.click()
                    time.sleep(2)
                except:
                    pass

                new_height = self.driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    break
                last_height = new_height

            print("   🖼️  Finding images...")

            # Method 1: Try to get thumbnails and click them
            thumbnails = self.driver.find_elements(By.CSS_SELECTOR, "img.rg_i")
            print(f"   Found {len(thumbnails)} thumbnail elements")

            if len(thumbnails) == 0:
                # Method 2: Try alternative selector
                thumbnails = self.driver.find_elements(By.CSS_SELECTOR, "div[data-id] img")
                print(f"   Alternative selector found {len(thumbnails)} elements")

            if len(thumbnails) == 0:
                # Method 3: Try any image in results
                thumbnails = self.driver.find_elements(By.CSS_SELECTOR, "#islrg img")
                print(f"   Generic selector found {len(thumbnails)} elements")

            # Click each thumbnail to get full resolution image
            for i, thumb in enumerate(thumbnails[:max_images * 2]):
                try:
                    # Scroll element into view
                    self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", thumb)
                    time.sleep(0.5)

                    # Click thumbnail
                    thumb.click()
                    time.sleep(1.5)  # Wait for full image to load

                    # Try multiple selectors for the full-size image
                    full_img = None
                    selectors = [
                        "img.sFlh5c.pT0Scc.iPVvYb",  # 2026 selector
                        "img.n3VNCb",                 # Alternative
                        "img.iPVvYb",                 # Another alternative
                        "a.wXeWr img",                # In link
                        "div.islrc img.iPVvYb"        # In container
                    ]

                    for selector in selectors:
                        try:
                            elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                            for elem in elements:
                                src = elem.get_attribute('src')
                                if src and src.startswith('http') and 'gstatic' not in src and 'encrypted' not in src:
                                    full_img = src
                                    break
                            if full_img:
                                break
                        except:
                            continue

                    if full_img and full_img not in urls:
                        urls.append(full_img)
                        if len(urls) >= max_images:
                            break

                except Exception as e:
                    continue

            print(f"   ✅ Extracted {len(urls)} image URLs")

            # Show sample sources
            if urls:
                domains = list(set([self.get_domain(u) for u in urls[:10]]))
                print(f"   📍 Sample sources: {', '.join(domains[:5])}")

        except Exception as e:
            print(f"   ❌ Error: {e}")

        return urls

    def download_image(self, url, save_path):
        """Download image"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.google.com/',
            }

            response = requests.get(url, headers=headers, timeout=20, stream=True, verify=False)

            if response.status_code != 200:
                return False, None

            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(8192):
                    if chunk:
                        f.write(chunk)

            if os.path.getsize(save_path) < 2048:
                os.remove(save_path)
                return False, None

            domain = self.get_domain(url)
            if domain not in self.domains:
                self.domains[domain] = 0
            self.domains[domain] += 1

            return True, domain

        except:
            if os.path.exists(save_path):
                os.remove(save_path)
            return False, None

    def scrape_product(self, name, query=None, max_images=IMAGES_PER_PRODUCT):
        """Scrape images for product"""
        print(f"\n{'='*60}")
        print(f"📦 Product: {name}")
        print(f"{'='*60}")

        search = query or name
        folder = self.sanitize_filename(name)
        product_dir = self.output_dir / folder
        product_dir.mkdir(exist_ok=True)

        # Get URLs
        urls = self.scrape_google_images(search, max_images * 4)

        if not urls:
            print("\n  ❌ No images found")
            return 0

        random.shuffle(urls)

        # Download
        print(f"\n📥 Downloading to: {product_dir}")

        downloaded = 0
        for url in urls:
            if downloaded >= max_images:
                break

            ext = 'jpg'
            if '.png' in url.lower():
                ext = 'png'
            elif '.webp' in url.lower():
                ext = 'webp'

            url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
            filename = f"{folder}-{downloaded + 1}-{url_hash}.{ext}"
            save_path = product_dir / filename

            domain = self.get_domain(url)
            print(f"   [{downloaded + 1}/{max_images}] {domain[:30]:30s} → ", end="", flush=True)

            success, _ = self.download_image(url, save_path)
            if success:
                print("✅")
                downloaded += 1
            else:
                print("❌")

            time.sleep(0.4)

        print(f"\n✅ Downloaded {downloaded}/{max_images} images")
        return downloaded

    def scrape_from_config(self, filepath):
        """Scrape all products"""
        with open(filepath) as f:
            config = json.load(f)

        products = config.get('products', [])

        if not self.init_driver():
            return 0

        total = 0

        print(f"\n{'='*60}")
        print(f"🌍 GOOGLE IMAGES SCRAPER V2")
        print(f"{'='*60}")
        print(f"Products: {len(products)}")
        print(f"Output: {self.output_dir.absolute()}")
        print(f"{'='*60}")

        try:
            for i, product in enumerate(products, 1):
                print(f"\n[Product {i}/{len(products)}]")

                name = product.get('name', '')
                query = product.get('query', name)
                max_imgs = product.get('max_images', IMAGES_PER_PRODUCT)

                downloaded = self.scrape_product(name, query, max_imgs)
                total += downloaded

                if i < len(products):
                    time.sleep(3)

        finally:
            if self.driver:
                print("\n🔒 Closing browser...")
                self.driver.quit()

        # Stats
        print(f"\n{'='*60}")
        print(f"🎉 COMPLETE!")
        print(f"{'='*60}")
        print(f"📊 Total: {total} images")
        print(f"📁 Location: {self.output_dir.absolute()}")

        if self.domains:
            print(f"\n🌐 Images from {len(self.domains)} different websites:")
            for domain, count in sorted(self.domains.items(), key=lambda x: x[1], reverse=True)[:20]:
                print(f"   {domain:35s}: {count:2d}")

        print(f"{'='*60}\n")
        return total


def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║        🌍 GOOGLE IMAGES SCRAPER V2 🌍                     ║
║                                                           ║
║  Updated for 2026 with better selectors                  ║
║  Gets images from across the entire web!                 ║
╚═══════════════════════════════════════════════════════════╝
    """)

    config = Path("scraper-config.json")
    if not config.exists():
        print("❌ Config not found!")
        return

    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    print("\n🤔 Headless (invisible) or visible?")
    print("   1. Headless (recommended)")
    print("   2. Visible (see browser)")

    try:
        choice = input("\nOption (1 or 2) [default: 1]: ").strip()
        headless = choice != '2'
    except:
        headless = True

    scraper = GoogleImagesScraper(headless=headless)
    scraper.scrape_from_config(config)


if __name__ == "__main__":
    main()
