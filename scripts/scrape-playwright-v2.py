#!/usr/bin/env python3
"""
🎭 PLAYWRIGHT GOOGLE IMAGES SCRAPER V2
Updated with correct selectors from debug analysis
"""

import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright
from urllib.parse import quote_plus
import aiohttp
import hashlib

class PlaywrightScraperV2:
    def __init__(self, output_dir="downloaded_images"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.downloaded_count = 0
        self.domain_stats = {}

    async def scrape_google_images(self, page, query, max_images=5):
        """Scrape Google Images with WORKING selectors"""
        print(f"\n🔍 Searching Google Images: {query}")

        search_url = f"https://www.google.com/search?q={quote_plus(query)}&tbm=isch&hl=en"
        await page.goto(search_url, wait_until="networkidle", timeout=60000)
        print("   📄 Page loaded, scrolling...")

        # Scroll to load more images
        for i in range(5):
            await page.evaluate("window.scrollBy(0, 1000)")
            await asyncio.sleep(0.5)

        print("   🖼️  Extracting image URLs...")

        # Try multiple strategies
        image_urls = []

        # Strategy 1: Find all img tags and extract src
        try:
            img_elements = await page.query_selector_all("img[src]")
            print(f"   Found {len(img_elements)} img elements")

            for img in img_elements[:max_images * 3]:  # Check more than we need
                src = await img.get_attribute("src")

                # Filter out tiny icons, data URLs, and Google's own images
                if src and not src.startswith("data:") and "gstatic" not in src:
                    # Look for actual product images (usually HTTPS URLs)
                    if src.startswith("http") and len(src) > 50:
                        image_urls.append(src)
                        if len(image_urls) >= max_images:
                            break

        except Exception as e:
            print(f"   ⚠️  Strategy 1 error: {e}")

        # Strategy 2: Click on thumbnails to reveal full-size images
        if len(image_urls) < max_images:
            print("   🔍 Trying click strategy...")
            try:
                # Find thumbnail containers
                thumbnails = await page.query_selector_all("div[jsname='dTDiAc']")
                print(f"   Found {len(thumbnails)} thumbnail containers")

                for i, thumb in enumerate(thumbnails[:max_images * 2]):
                    if len(image_urls) >= max_images:
                        break

                    try:
                        # Click thumbnail
                        await thumb.click()
                        await asyncio.sleep(0.5)

                        # Look for the full-size image
                        full_img = await page.query_selector("img.sFlh5c, img.iPVvYb, img[jsname='kn3ccd']")

                        if full_img:
                            full_src = await full_img.get_attribute("src")
                            if full_src and full_src.startswith("http") and full_src not in image_urls:
                                image_urls.append(full_src)
                                print(f"   ✅ Extracted image {len(image_urls)}/{max_images}")

                    except Exception as e:
                        continue

            except Exception as e:
                print(f"   ⚠️  Strategy 2 error: {e}")

        print(f"   ✅ Extracted {len(image_urls)} image URLs")
        return image_urls

    async def download_image(self, session, url, product_name, index):
        """Download a single image"""
        try:
            # Create safe filename
            url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
            safe_name = "".join(c for c in product_name if c.isalnum() or c in (' ', '-', '_')).strip()
            safe_name = safe_name.replace(' ', '_')

            # Try to get extension from URL
            ext = ".jpg"
            if ".png" in url.lower():
                ext = ".png"
            elif ".webp" in url.lower():
                ext = ".webp"
            elif ".jpeg" in url.lower():
                ext = ".jpeg"

            filename = f"{safe_name}_{index}_{url_hash}{ext}"
            filepath = self.output_dir / filename

            # Download
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                if response.status == 200:
                    content = await response.read()

                    # Only save if it's a reasonable size (> 5KB)
                    if len(content) > 5000:
                        with open(filepath, 'wb') as f:
                            f.write(content)

                        # Track domain
                        from urllib.parse import urlparse
                        domain = urlparse(url).netloc
                        self.domain_stats[domain] = self.domain_stats.get(domain, 0) + 1

                        self.downloaded_count += 1
                        return True

        except Exception as e:
            pass

        return False

    async def scrape_product(self, page, session, product, index, total):
        """Scrape images for one product"""
        name = product["name"]
        query = product["query"]
        max_images = product.get("max_images", 5)

        print(f"\n[Product {index}/{total}]")
        print(f"\n{'='*60}")
        print(f"📦 Product: {name}")
        print(f"{'='*60}")

        # Get image URLs
        image_urls = await self.scrape_google_images(page, query, max_images)

        if not image_urls:
            print(f"\n  ❌ No images found")
            return

        # Download images
        print(f"\n  ⬇️  Downloading {len(image_urls)} images...")

        download_tasks = []
        for i, url in enumerate(image_urls, 1):
            task = self.download_image(session, url, name, i)
            download_tasks.append(task)

        results = await asyncio.gather(*download_tasks)
        success_count = sum(results)

        print(f"  ✅ Downloaded {success_count}/{len(image_urls)} images")

    async def run(self, config_file="scraper-config.json", headless=True):
        """Run the scraper"""
        # Load config
        with open(config_file, 'r') as f:
            config = json.load(f)

        products = config["products"]

        print(f"""
{'='*60}
🎭 PLAYWRIGHT GOOGLE IMAGES SCRAPER V2
{'='*60}
Products: {len(products)}
Output: {self.output_dir.absolute()}
Engine: Playwright with WORKING selectors
{'='*60}
""")

        async with async_playwright() as p:
            # Launch browser
            print("🌐 Launching browser...")
            browser = await p.chromium.launch(
                headless=headless,
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--disable-dev-shm-usage',
                    '--no-sandbox',
                ]
            )

            # Create context with stealth
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )

            await context.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
            """)

            page = await context.new_page()
            print("   ✅ Browser launched!")

            # Create HTTP session for downloading
            async with aiohttp.ClientSession(headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }) as session:

                # Process each product
                for i, product in enumerate(products, 1):
                    await self.scrape_product(page, session, product, i, len(products))
                    await asyncio.sleep(2)  # Be nice to Google

            print("\n🔒 Closing browser...")
            await browser.close()

        # Print summary
        print(f"\n{'='*60}")
        print(f"🎉 COMPLETE!")
        print(f"{'='*60}")
        print(f"📊 Total: {self.downloaded_count} images")
        print(f"📁 Location: {self.output_dir.absolute()}")

        if self.domain_stats:
            print(f"\n🌐 Images from {len(self.domain_stats)} different domains:")
            for domain, count in sorted(self.domain_stats.items(), key=lambda x: x[1], reverse=True)[:10]:
                print(f"   • {domain}: {count} images")

        print(f"{'='*60}\n")

async def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║        🎭 PLAYWRIGHT GOOGLE IMAGES SCRAPER V2 🎭          ║
║                                                           ║
║  Fixed with correct selectors from debug analysis!       ║
╚═══════════════════════════════════════════════════════════╝
    """)

    mode = input("\n🤔 Headless (invisible) or visible?\n   1. Headless (recommended)\n   2. Visible (see browser)\n\nOption (1 or 2) [default: 1]: ").strip()
    headless = mode != "2"

    scraper = PlaywrightScraperV2()
    await scraper.run(headless=headless)

if __name__ == "__main__":
    asyncio.run(main())
