#!/usr/bin/env python3
"""
🎭 PLAYWRIGHT GOOGLE IMAGES SCRAPER V3
EXTRACTS ORIGINAL SOURCE URLs - NOT GOOGLE THUMBNAILS!
"""

import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright
from urllib.parse import quote_plus, urlparse
import aiohttp
import hashlib

class PlaywrightScraperV3:
    def __init__(self, output_dir="downloaded_images"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.downloaded_count = 0
        self.domain_stats = {}

    async def scrape_google_images(self, page, query, max_images=5):
        """Scrape ORIGINAL image URLs from source websites"""
        print(f"\n🔍 Searching Google Images: {query}")

        search_url = f"https://www.google.com/search?q={quote_plus(query)}&tbm=isch&hl=en"
        await page.goto(search_url, wait_until="networkidle", timeout=60000)
        print("   📄 Page loaded, scrolling...")

        # Scroll to load more images
        for i in range(3):
            await page.evaluate("window.scrollBy(0, 800)")
            await asyncio.sleep(0.5)

        print("   🖼️  Extracting ORIGINAL source URLs...")

        image_urls = []

        # Find all thumbnail containers
        thumbnails = await page.query_selector_all("div[jsname='dTDiAc']")
        print(f"   Found {len(thumbnails)} thumbnails")

        for i, thumb in enumerate(thumbnails[:max_images * 3]):
            if len(image_urls) >= max_images:
                break

            try:
                # Click thumbnail to open side panel
                await thumb.click()
                await asyncio.sleep(1.5)  # Wait for side panel to load

                # Strategy 1: Look for the "Visit" button link (original source)
                visit_link = await page.query_selector("a[jsname='sTFXNd']")
                if visit_link:
                    href = await visit_link.get_attribute("href")
                    if href:
                        # This is the link to the page containing the image
                        print(f"   🔗 Found source link: {urlparse(href).netloc}")

                # Strategy 2: Extract the large image from the side panel
                # Look for the full-size image element
                large_img_selectors = [
                    "img.sFlh5c.pT0Scc.iPVvYb",  # Main large image
                    "img.sFlh5c",
                    "img.iPVvYb",
                    "img[jsname='kn3ccd']",
                    "img.n3VNCb"
                ]

                original_url = None

                for selector in large_img_selectors:
                    large_img = await page.query_selector(selector)
                    if large_img:
                        # Get the src attribute
                        src = await large_img.get_attribute("src")

                        # IMPORTANT: Skip Google's cached thumbnails
                        if src and not any(x in src for x in ["gstatic.com", "ggpht.com", "googleusercontent.com"]):
                            if src.startswith("http") and len(src) > 80:
                                original_url = src
                                break

                if original_url and original_url not in image_urls:
                    domain = urlparse(original_url).netloc
                    image_urls.append(original_url)
                    print(f"   ✅ Image {len(image_urls)}/{max_images} from {domain}")

            except Exception as e:
                # Silently continue to next thumbnail
                pass

        print(f"   ✅ Extracted {len(image_urls)} ORIGINAL source URLs")
        return image_urls

    async def download_image(self, session, url, product_name, index):
        """Download a single image"""
        try:
            # Create safe filename
            url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
            safe_name = "".join(c for c in product_name if c.isalnum() or c in (' ', '-', '_')).strip()
            safe_name = safe_name.replace(' ', '_')

            # Get domain for filename
            domain = urlparse(url).netloc.replace('www.', '')[:20]

            # Try to get extension from URL
            ext = ".jpg"
            if ".png" in url.lower():
                ext = ".png"
            elif ".webp" in url.lower():
                ext = ".webp"
            elif ".jpeg" in url.lower():
                ext = ".jpeg"

            filename = f"{safe_name}_{index}_{domain}_{url_hash}{ext}"
            filepath = self.output_dir / filename

            # Download with proper headers
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.google.com/',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            }

            async with session.get(url, timeout=aiohttp.ClientTimeout(total=30), headers=headers) as response:
                if response.status == 200:
                    content = await response.read()

                    # Only save if it's a reasonable size (> 10KB for better quality)
                    if len(content) > 10000:
                        with open(filepath, 'wb') as f:
                            f.write(content)

                        # Track domain
                        domain = urlparse(url).netloc
                        self.domain_stats[domain] = self.domain_stats.get(domain, 0) + 1

                        self.downloaded_count += 1
                        size_kb = len(content) / 1024
                        print(f"      ✓ {filename[:50]}... ({size_kb:.1f}KB)")
                        return True

        except Exception as e:
            # Silently fail - some images may be blocked
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

        # Get ORIGINAL image URLs
        image_urls = await self.scrape_google_images(page, query, max_images)

        if not image_urls:
            print(f"\n  ❌ No images found")
            return

        # Download images
        print(f"\n  ⬇️  Downloading {len(image_urls)} images from original sources...")

        download_tasks = []
        for i, url in enumerate(image_urls, 1):
            task = self.download_image(session, url, name, i)
            download_tasks.append(task)

        results = await asyncio.gather(*download_tasks)
        success_count = sum(results)

        if success_count > 0:
            print(f"\n  ✅ Successfully downloaded {success_count}/{len(image_urls)} images")
        else:
            print(f"\n  ❌ Failed to download images (may be blocked by source websites)")

    async def run(self, config_file="scraper-config.json", headless=True):
        """Run the scraper"""
        # Load config
        with open(config_file, 'r') as f:
            config = json.load(f)

        products = config["products"]

        print(f"""
{'='*60}
🎭 PLAYWRIGHT GOOGLE IMAGES SCRAPER V3
{'='*60}
Products: {len(products)}
Output: {self.output_dir.absolute()}
Strategy: Extract ORIGINAL source URLs (not thumbnails!)
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
            async with aiohttp.ClientSession() as session:

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
            for domain, count in sorted(self.domain_stats.items(), key=lambda x: x[1], reverse=True):
                print(f"   • {domain}: {count} images")

        print(f"{'='*60}\n")

async def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║        🎭 PLAYWRIGHT GOOGLE IMAGES SCRAPER V3 🎭          ║
║                                                           ║
║  Extracts ORIGINAL source URLs from actual websites!     ║
║  NO MORE GOOGLE THUMBNAILS - Real high-quality images!   ║
╚═══════════════════════════════════════════════════════════╝
    """)

    mode = input("\n🤔 Headless (invisible) or visible?\n   1. Headless (recommended)\n   2. Visible (see browser)\n\nOption (1 or 2) [default: 1]: ").strip()
    headless = mode != "2"

    scraper = PlaywrightScraperV3()
    await scraper.run(headless=headless)

if __name__ == "__main__":
    asyncio.run(main())
