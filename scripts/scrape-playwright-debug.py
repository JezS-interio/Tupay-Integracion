#!/usr/bin/env python3
"""
🔍 PLAYWRIGHT DEBUG SCRAPER
Save screenshots and HTML to see what Google Images actually looks like
"""

import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright
from urllib.parse import quote_plus

class PlaywrightDebugScraper:
    def __init__(self):
        self.output_dir = Path("debug_output")
        self.output_dir.mkdir(exist_ok=True)

    async def debug_google_images(self, query):
        """Open Google Images and save HTML/screenshots for debugging"""
        print(f"\n{'='*60}")
        print(f"🔍 DEBUG: {query}")
        print(f"{'='*60}\n")

        async with async_playwright() as p:
            # Launch browser in VISIBLE mode so you can see what's happening
            browser = await p.chromium.launch(
                headless=False,  # VISIBLE!
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--disable-dev-shm-usage',
                    '--no-sandbox',
                    '--disable-web-security',
                ]
            )

            # Create context with stealth settings
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )

            # Add stealth script
            await context.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5]
                });
            """)

            page = await context.new_page()

            # Go to Google Images
            search_url = f"https://www.google.com/search?q={quote_plus(query)}&tbm=isch&hl=en"
            print(f"🌐 Loading: {search_url}")

            await page.goto(search_url, wait_until="networkidle", timeout=60000)
            print("✅ Page loaded!")

            # Wait a bit for images to load
            await asyncio.sleep(3)

            # Scroll down
            print("📜 Scrolling...")
            for i in range(3):
                await page.evaluate("window.scrollBy(0, 1000)")
                await asyncio.sleep(1)

            # Save screenshot
            screenshot_path = self.output_dir / f"screenshot_{query[:30].replace(' ', '_')}.png"
            await page.screenshot(path=str(screenshot_path), full_page=True)
            print(f"📸 Screenshot saved: {screenshot_path}")

            # Save HTML
            html_content = await page.content()
            html_path = self.output_dir / f"html_{query[:30].replace(' ', '_')}.html"
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"📄 HTML saved: {html_path}")

            # Try different selectors and count elements
            selectors_to_try = [
                "div.isv-r",
                "div[data-id]",
                "img.rg_i",
                "div.ivg-i",
                "a[jsname]",
                "img[data-src]",
                "img[src]",
                "div.eA0Zlc",
                "div[jsname='dTDiAc']",
                "h3.ob5Hkd",
                "div[role='listitem']",
                "div[data-ri]",
            ]

            print("\n🔍 Testing selectors:")
            for selector in selectors_to_try:
                try:
                    elements = await page.query_selector_all(selector)
                    count = len(elements)
                    print(f"   {selector:30s} → {count:4d} elements")

                    if count > 0 and count < 100:
                        # Save info about first few elements
                        sample_info = []
                        for elem in elements[:3]:
                            html = await elem.inner_html()
                            sample_info.append(html[:200])

                        info_path = self.output_dir / f"selector_{selector.replace('[', '_').replace(']', '_').replace('=', '_')}.txt"
                        with open(info_path, 'w', encoding='utf-8') as f:
                            f.write(f"Selector: {selector}\n")
                            f.write(f"Count: {count}\n\n")
                            for i, info in enumerate(sample_info):
                                f.write(f"Element {i+1}:\n{info}\n\n")
                except Exception as e:
                    print(f"   {selector:30s} → ERROR: {str(e)[:50]}")

            print("\n⏸️  Browser will stay open for 30 seconds so you can inspect...")
            print("   Look at the page and check what the image elements look like!")
            await asyncio.sleep(30)

            await browser.close()
            print("✅ Debug complete!")

async def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║        🔍 PLAYWRIGHT DEBUG SCRAPER 🔍                     ║
║                                                           ║
║  This will show you what Google Images looks like        ║
║  and save HTML/screenshots for analysis                  ║
╚═══════════════════════════════════════════════════════════╝
    """)

    scraper = PlaywrightDebugScraper()

    # Test with just one product
    test_query = "iPhone 15 Pro Max smartphone product image"

    await scraper.debug_google_images(test_query)

    print(f"\n{'='*60}")
    print("📁 Check the 'debug_output' folder for:")
    print("   - screenshot_*.png (what Google looks like)")
    print("   - html_*.html (full page HTML)")
    print("   - selector_*.txt (info about matching elements)")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    asyncio.run(main())
