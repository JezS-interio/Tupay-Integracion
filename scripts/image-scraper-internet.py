#!/usr/bin/env python3
"""
TRUE Internet-Wide Image Scraper
Scrapes from DuckDuckGo and Bing which index THE ENTIRE WEB.
These search engines are easier to scrape than Google.
Gets images from thousands of different websites!
"""

import os
import requests
import time
import json
from pathlib import Path
import re
from urllib.parse import quote_plus, unquote, urlparse
import random
import hashlib

# Configuration
OUTPUT_DIR = "downloaded_images"
IMAGES_PER_PRODUCT = 5
TIMEOUT = 15

class InternetImageScraper:
    def __init__(self, output_dir=OUTPUT_DIR):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.session = requests.Session()

        # Track domains
        self.domains = {}

        # User agents
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]

    def get_headers(self):
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }

    def sanitize_filename(self, text):
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-').lower()

    def get_domain(self, url):
        try:
            domain = urlparse(url).netloc.replace('www.', '')
            parts = domain.split('.')
            if len(parts) > 2:
                domain = '.'.join(parts[-2:])
            return domain
        except:
            return 'unknown'

    def search_duckduckgo(self, query, max_results=30):
        """DuckDuckGo - indexes the entire web, easier to scrape"""
        print(f"   🦆 DuckDuckGo...", end=" ", flush=True)

        image_urls = []
        try:
            # Step 1: Get the page to extract vqd token
            url = "https://duckduckgo.com/"
            params = {'q': query, 'iax': 'images', 'ia': 'images'}

            response = self.session.get(url, params=params, headers=self.get_headers(), timeout=TIMEOUT)
            response.raise_for_status()

            # Extract vqd token
            vqd_match = re.search(r'vqd=([\d-]+)&', response.text)
            if not vqd_match:
                vqd_match = re.search(r'"vqd":"([\d-]+)"', response.text)

            if not vqd_match:
                print("❌ (no token)")
                return []

            vqd = vqd_match.group(1)

            # Step 2: Get actual images from API
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

            response = self.session.get(api_url, params=params, headers=self.get_headers(), timeout=TIMEOUT)
            response.raise_for_status()

            data = response.json()
            results = data.get('results', [])

            for result in results:
                img_url = result.get('image', '')
                if img_url and img_url.startswith('http'):
                    image_urls.append(img_url)
                    if len(image_urls) >= max_results:
                        break

            print(f"✅ {len(image_urls)}")

        except Exception as e:
            print(f"❌ ({str(e)[:20]})")

        return image_urls

    def search_bing(self, query, max_results=30):
        """Bing - indexes the entire web"""
        print(f"   🔍 Bing...", end=" ", flush=True)

        image_urls = []
        try:
            url = f"https://www.bing.com/images/search?q={quote_plus(query)}&first=1&count=150"

            response = self.session.get(url, headers=self.get_headers(), timeout=TIMEOUT)
            response.raise_for_status()

            html = response.text

            # Extract image URLs from Bing's JSON data
            pattern = r'"murl":"([^"]+)"'
            matches = re.findall(pattern, html)

            for match in matches:
                url = match.replace('\\/', '/')
                if url.startswith('http'):
                    image_urls.append(url)
                    if len(image_urls) >= max_results:
                        break

            print(f"✅ {len(image_urls)}")

        except Exception as e:
            print(f"❌")

        return image_urls

    def download_image(self, url, save_path):
        """Download image from any website"""
        try:
            headers = {
                'User-Agent': random.choice(self.user_agents),
                'Referer': 'https://www.google.com/',
                'Accept': 'image/*,*/*;q=0.8',
            }

            response = requests.get(
                url,
                headers=headers,
                timeout=TIMEOUT,
                stream=True,
                allow_redirects=True,
                verify=False
            )

            if response.status_code != 200:
                return False, None

            content_type = response.headers.get('content-type', '').lower()
            if 'image' not in content_type and 'octet-stream' not in content_type:
                return False, None

            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

            size = os.path.getsize(save_path)
            if size < 3072:  # Too small
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

    def scrape_product(self, product_name, query=None, max_images=IMAGES_PER_PRODUCT):
        """Scrape images from across the internet"""
        print(f"\n{'='*60}")
        print(f"📦 Product: {product_name}")
        print(f"{'='*60}")

        search_query = query or product_name
        folder_name = self.sanitize_filename(product_name)
        product_dir = self.output_dir / folder_name
        product_dir.mkdir(exist_ok=True)

        print(f"\n🌍 Searching the ENTIRE INTERNET for: {search_query}")

        # Collect URLs from multiple search engines
        all_urls = []

        all_urls.extend(self.search_duckduckgo(search_query, max_images * 3))
        time.sleep(1)

        all_urls.extend(self.search_bing(search_query, max_images * 3))
        time.sleep(1)

        # Remove duplicates
        seen = set()
        unique_urls = []
        for url in all_urls:
            if url not in seen:
                seen.add(url)
                unique_urls.append(url)

        random.shuffle(unique_urls)

        if not unique_urls:
            print(f"\n  ❌ No images found")
            return 0

        # Show sample domains
        sample_domains = list(set([self.get_domain(url) for url in unique_urls[:15]]))
        print(f"\n   📍 Sample sources: {', '.join(sample_domains[:5])}")
        if len(sample_domains) > 5:
            print(f"      ... and {len(sample_domains) - 5} more websites")

        # Download
        print(f"\n📥 Downloading to: {product_dir}")

        downloaded = 0
        attempts = 0
        max_attempts = min(len(unique_urls), max_images * 5)

        for url in unique_urls:
            if downloaded >= max_images:
                break
            if attempts >= max_attempts:
                break

            attempts += 1

            ext = 'jpg'
            if '.png' in url.lower():
                ext = 'png'
            elif '.webp' in url.lower():
                ext = 'webp'

            url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
            filename = f"{folder_name}-{downloaded + 1}-{url_hash}.{ext}"
            save_path = product_dir / filename

            domain = self.get_domain(url)
            print(f"   [{downloaded + 1}/{max_images}] {domain[:30]:30s} → ", end="", flush=True)

            success, domain = self.download_image(url, save_path)
            if success:
                print(f"✅")
                downloaded += 1
            else:
                print(f"❌")

            time.sleep(0.6)

        print(f"\n✅ Downloaded {downloaded}/{max_images} images from across the web")
        return downloaded

    def scrape_products_from_file(self, filepath):
        """Scrape all products"""
        with open(filepath, 'r', encoding='utf-8') as f:
            config = json.load(f)

        products = config.get('products', [])
        total = 0

        print(f"\n{'='*60}")
        print(f"🌍 INTERNET-WIDE IMAGE SCRAPER")
        print(f"{'='*60}")
        print(f"Products: {len(products)}")
        print(f"Output: {self.output_dir.absolute()}")
        print(f"Sources: DuckDuckGo + Bing (both index entire web)")
        print(f"{'='*60}")

        for i, product in enumerate(products, 1):
            print(f"\n[Product {i}/{len(products)}]")

            name = product.get('name', '')
            query = product.get('query', name)
            max_images = product.get('max_images', IMAGES_PER_PRODUCT)

            downloaded = self.scrape_product(name, query, max_images)
            total += downloaded

            if i < len(products):
                time.sleep(3)

        # Stats
        print(f"\n{'='*60}")
        print(f"🎉 COMPLETE!")
        print(f"{'='*60}")
        print(f"📊 Total: {total} images")
        print(f"📁 Location: {self.output_dir.absolute()}")

        if self.domains:
            print(f"\n🌐 Downloaded from {len(self.domains)} different websites:")
            sorted_domains = sorted(self.domains.items(), key=lambda x: x[1], reverse=True)
            for domain, count in sorted_domains[:20]:
                print(f"   {domain:35s}: {count:2d} images")

            if len(self.domains) > 20:
                print(f"   ... and {len(self.domains) - 20} more websites")

        print(f"{'='*60}\n")
        return total


def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║      🌍 INTERNET-WIDE IMAGE SCRAPER 🌍                    ║
║                                                           ║
║  Scrapes from DuckDuckGo + Bing = ENTIRE INTERNET!       ║
║  Images from e-commerce, blogs, reviews, tech sites...   ║
║  Thousands of different sources!                         ║
╚═══════════════════════════════════════════════════════════╝
    """)

    config_file = Path("scraper-config.json")
    if not config_file.exists():
        print("❌ Config not found!")
        return

    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    scraper = InternetImageScraper()
    scraper.scrape_products_from_file(config_file)


if __name__ == "__main__":
    main()
