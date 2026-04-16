#!/usr/bin/env python3
"""
PLAYWRIGHT GOOGLE IMAGES SCRAPER
Uses Playwright - much better at avoiding detection than Selenium.
Modern browser automation that actually works!

INSTALL:
pip install playwright
playwright install chromium
"""

import os
import sys
import time
import json
import random
import hashlib
import asyncio
from pathlib import Path
from urllib.parse import quote_plus, urlparse
import requests

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("❌ Playwright not installed!")
    print("\n📦 Install with:")
    print("   pip install playwright")
    print("   playwright install chromium")
    sys.exit(1)

OUTPUT_DIR = "downloaded_images"
IMAGES_PER_PRODUCT = 5
TIMEOUT = 30000  # milliseconds

class PlaywrightImageScraper:
    def __init__(self, output_dir=OUTPUT_DIR, headless=True):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.headless = headless
        self.domains = {}

    def sanitize_filename(self, text):
        text = ''.join(c for c in text if c.isalnum() or c in (' ', '-', '_'))
        return text.replace(' ', '-').lower()

    def get_domain(self, url):
        try:
            return urlparse(url).netloc.replace('www.', '')
        except:
            return 'unknown'

    async def scrape_google_images(self, page, query, max_images=50):
        """Scrape Google Images with Playwright"""
        print(f"\n🔍 Searching Google Images: {query}")

        urls = []

        try:
            # Navigate to Google Images
            search_url = f"https://www.google.com/search?q={quote_plus(query)}&tbm=isch&hl=en"
            await page.goto(search_url, wait_until="networkidle")

            print("   📄 Page loaded, scrolling...")

            # Scroll and load images
            for i in range(5):
                await page.evaluate("window.scrollBy(0, window.innerHeight)")
                await asyncio.sleep(1.5)

                # Try to click "Show more results"
                try:
                    show_more = await page.query_selector(".mye4qd")
                    if show_more:
                        await show_more.click()
                        await asyncio.sleep(2)
                except:
                    pass

            print("   🖼️  Extracting image URLs...")

            # Get all image containers
            image_containers = await page.query_selector_all("div.isv-r")
            print(f"   Found {len(image_containers)} image containers")

            for container in image_containers[:max_images * 2]:
                try:
                    # Click the container to open full image
                    await container.click()
                    await asyncio.sleep(1)

                    # Wait for full-size image to load
                    try:
                        # Try multiple selectors
                        full_img = None

                        # Selector 1: Standard full-size image
                        img = await page.query_selector("img.n3VNCb")
                        if img:
                            src = await img.get_attribute("src")
                            if src and src.startswith("http") and "gstatic" not in src:
                                full_img = src

                        # Selector 2: Alternative
                        if not full_img:
                            img = await page.query_selector("img.sFlh5c")
                            if img:
                                src = await img.get_attribute("src")
                                if src and src.startswith("http") and "gstatic" not in src:
                                    full_img = src

                        # Selector 3: Another alternative
                        if not full_img:
                            img = await page.query_selector("a.wXeWr.islir img")
                            if img:
                                src = await img.get_attribute("src")
                                if src and src.startswith("http") and "gstatic" not in src:
                                    full_img = src

                        if full_img and full_img not in urls:
                            urls.append(full_img)
                            if len(urls) >= max_images:
                                break

                    except:
                        continue

                except:
                    continue

            print(f"   ✅ Extracted {len(urls)} image URLs")

            # Show sample sources
            if urls:
                domains = list(set([self.get_domain(u) for u in urls[:10]]))
                print(f"   📍 Sources: {', '.join(domains[:5])}")

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

    async def scrape_product(self, page, name, query=None, max_images=IMAGES_PER_PRODUCT):
        """Scrape images for product"""
        print(f"\n{'='*60}")
        print(f"📦 Product: {name}")
        print(f"{'='*60}")

        search = query or name
        folder = self.sanitize_filename(name)
        product_dir = self.output_dir / folder
        product_dir.mkdir(exist_ok=True)

        # Get URLs
        urls = await self.scrape_google_images(page, search, max_images * 4)

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

            await asyncio.sleep(0.4)

        print(f"\n✅ Downloaded {downloaded}/{max_images} images")
        return downloaded

    async def run(self, config_path):
        """Run the scraper"""
        with open(config_path) as f:
            config = json.load(f)

        products = config.get('products', [])

        print(f"\n{'='*60}")
        print(f"🎭 PLAYWRIGHT GOOGLE IMAGES SCRAPER")
        print(f"{'='*60}")
        print(f"Products: {len(products)}")
        print(f"Output: {self.output_dir.absolute()}")
        print(f"Engine: Playwright (better than Selenium)")
        print(f"{'='*60}")

        async with async_playwright() as p:
            print("\n🌐 Launching browser...")

            browser = await p.chromium.launch(
                headless=self.headless,
                args=[
                    '--no-sandbox',
                    '--disable-blink-features=AutomationControlled',
                ]
            )

            # Create context with real user-agent
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport={'width': 1920, 'height': 1080},
            )

            # Add extra stealth
            await context.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
            """)

            page = await context.new_page()

            print("   ✅ Browser launched!")

            total = 0

            try:
                for i, product in enumerate(products, 1):
                    print(f"\n[Product {i}/{len(products)}]")

                    name = product.get('name', '')
                    query = product.get('query', name)
                    max_imgs = product.get('max_images', IMAGES_PER_PRODUCT)

                    downloaded = await self.scrape_product(page, name, query, max_imgs)
                    total += downloaded

                    if i < len(products):
                        await asyncio.sleep(3)

            finally:
                print("\n🔒 Closing browser...")
                await browser.close()

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


def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║        🎭 PLAYWRIGHT GOOGLE IMAGES SCRAPER 🎭             ║
║                                                           ║
║  Modern browser automation (better than Selenium!)       ║
║  Better stealth, better selectors, better results        ║
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

    scraper = PlaywrightImageScraper(headless=headless)
    asyncio.run(scraper.run(config))


if __name__ == "__main__":
    main()
