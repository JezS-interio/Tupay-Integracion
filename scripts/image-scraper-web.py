#!/usr/bin/env python3
"""
Web-Wide Product Image Scraper
Scrapes product images from ACROSS THE WEB using multiple search engines.
Gets images from: Bing, Yandex, Baidu, DuckDuckGo, and more.
"""

import os
import requests
import time
import json
from pathlib import Path
import re
from urllib.parse import quote_plus, urlparse
import random
import hashlib

# Configuration
OUTPUT_DIR = "downloaded_images"
IMAGES_PER_PRODUCT = 5
TIMEOUT = 10

class WebImageScraper:
    def __init__(self, output_dir=OUTPUT_DIR):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.session = requests.Session()

        # Rotate user agents to avoid detection
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]

        self.source_stats = {}

    def get_random_ua(self):
        return random.choice(self.user_agents)

    def sanitize_filename(self, text):
        """Convert text to safe filename"""
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-').lower()

    def get_domain(self, url):
        """Extract domain from URL for stats"""
        try:
            domain = urlparse(url).netloc
            domain = domain.replace('www.', '')
            return domain
        except:
            return 'unknown'

    def search_bing_images(self, query, max_images=5):
        """Scrape images from Bing Image Search"""
        print(f"  🔍 Bing...", end=" ", flush=True)

        image_urls = []
        try:
            headers = {
                'User-Agent': self.get_random_ua(),
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9',
            }

            search_url = f"https://www.bing.com/images/search?q={quote_plus(query)}&first=1&count=50"
            response = requests.get(search_url, headers=headers, timeout=TIMEOUT)
            response.raise_for_status()

            # Extract image URLs from Bing's HTML
            html = response.text

            # Bing stores image URLs in multiple formats
            patterns = [
                r'"murl":"([^"]+)"',
                r'"purl":"([^"]+)"',
                r'mediaurl=([^&"]+)',
            ]

            seen = set()
            for pattern in patterns:
                matches = re.findall(pattern, html)
                for match in matches:
                    # Decode URL
                    url = match.replace('\\u002f', '/').replace('\\/', '/')
                    if url.startswith('http') and url not in seen:
                        seen.add(url)
                        image_urls.append(url)
                        if len(image_urls) >= max_images * 3:
                            break
                if len(image_urls) >= max_images * 3:
                    break

            print(f"✅ {len(image_urls)}")
        except Exception as e:
            print(f"❌")

        return image_urls[:max_images * 3]

    def search_yandex_images(self, query, max_images=5):
        """Scrape images from Yandex (Russian search engine)"""
        print(f"  🔍 Yandex...", end=" ", flush=True)

        image_urls = []
        try:
            headers = {
                'User-Agent': self.get_random_ua(),
                'Accept': 'text/html,application/xhtml+xml',
            }

            search_url = f"https://yandex.com/images/search?text={quote_plus(query)}"
            response = requests.get(search_url, headers=headers, timeout=TIMEOUT)
            response.raise_for_status()

            html = response.text

            # Yandex embeds image URLs in JSON data
            pattern = r'"url":"(https?://[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"'
            matches = re.findall(pattern, html, re.IGNORECASE)

            seen = set()
            for match in matches:
                url = match.replace('\\/', '/')
                if url not in seen and 'yandex' not in url:  # Skip yandex's own images
                    seen.add(url)
                    image_urls.append(url)
                    if len(image_urls) >= max_images * 3:
                        break

            print(f"✅ {len(image_urls)}")
        except Exception as e:
            print(f"❌")

        return image_urls[:max_images * 3]

    def search_ecosia_images(self, query, max_images=5):
        """Scrape images from Ecosia (privacy-focused search)"""
        print(f"  🔍 Ecosia...", end=" ", flush=True)

        image_urls = []
        try:
            headers = {
                'User-Agent': self.get_random_ua(),
                'Accept': 'text/html,application/xhtml+xml',
            }

            search_url = f"https://www.ecosia.org/images?q={quote_plus(query)}"
            response = requests.get(search_url, headers=headers, timeout=TIMEOUT)
            response.raise_for_status()

            html = response.text

            # Extract image URLs
            pattern = r'"(https?://[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"'
            matches = re.findall(pattern, html, re.IGNORECASE)

            seen = set()
            for match in matches:
                if match not in seen and 'ecosia' not in match:
                    seen.add(match)
                    image_urls.append(match)
                    if len(image_urls) >= max_images * 2:
                        break

            print(f"✅ {len(image_urls)}")
        except Exception as e:
            print(f"❌")

        return image_urls[:max_images * 2]

    def search_unsplash(self, query, max_images=5):
        """Fallback: Unsplash stock photos"""
        print(f"  🔍 Unsplash...", end=" ", flush=True)

        image_urls = []
        try:
            search_url = f"https://unsplash.com/napi/search/photos"
            params = {'query': query, 'per_page': max_images, 'page': 1}

            response = self.session.get(search_url, params=params, timeout=TIMEOUT)
            response.raise_for_status()

            data = response.json()
            for result in data.get('results', []):
                url = result.get('urls', {}).get('regular', '')
                if url:
                    image_urls.append(url)

            print(f"✅ {len(image_urls)}")
        except:
            print(f"❌")

        return image_urls

    def download_image(self, url, save_path):
        """Download a single image"""
        try:
            headers = {
                'User-Agent': self.get_random_ua(),
                'Referer': 'https://www.google.com/',
                'Accept': 'image/*,*/*'
            }

            response = requests.get(url, headers=headers, timeout=TIMEOUT, stream=True, allow_redirects=True)
            response.raise_for_status()

            content_type = response.headers.get('content-type', '')
            if 'image' not in content_type.lower() and 'octet-stream' not in content_type.lower():
                return False, None

            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            # Check file size
            size = os.path.getsize(save_path)
            if size < 2048:  # Less than 2KB
                os.remove(save_path)
                return False, None

            # Track source domain
            domain = self.get_domain(url)
            return True, domain

        except Exception as e:
            if os.path.exists(save_path):
                os.remove(save_path)
            return False, None

    def scrape_product(self, product_name, query=None, max_images=IMAGES_PER_PRODUCT):
        """Scrape images for a product from multiple search engines"""
        print(f"\n{'='*60}")
        print(f"📦 Product: {product_name}")
        print(f"{'='*60}")

        search_query = query or product_name
        folder_name = self.sanitize_filename(product_name)
        product_dir = self.output_dir / folder_name
        product_dir.mkdir(exist_ok=True)

        print(f"\n🌐 Searching the web for: {search_query}")

        # Collect URLs from multiple search engines
        all_urls = []

        # Search engines in order of reliability
        all_urls.extend(self.search_bing_images(search_query, max_images))
        time.sleep(1)

        all_urls.extend(self.search_yandex_images(search_query, max_images))
        time.sleep(1)

        all_urls.extend(self.search_ecosia_images(search_query, max_images))
        time.sleep(1)

        # Fallback to Unsplash if needed
        if len(all_urls) < max_images:
            all_urls.extend(self.search_unsplash(search_query, max_images))

        # Remove duplicates while preserving order
        seen = set()
        unique_urls = []
        for url in all_urls:
            if url not in seen:
                seen.add(url)
                unique_urls.append(url)

        # Shuffle for variety
        random.shuffle(unique_urls)

        if not unique_urls:
            print(f"\n  ❌ No images found")
            return 0

        print(f"\n  📊 Found {len(unique_urls)} unique image URLs from web")

        # Download images
        print(f"\n📥 Downloading to: {product_dir}")
        downloaded = 0
        attempts = 0
        max_attempts = min(len(unique_urls), max_images * 3)  # Try up to 3x the needed amount

        for url in unique_urls:
            if downloaded >= max_images:
                break
            if attempts >= max_attempts:
                break

            attempts += 1

            # Determine extension
            ext = 'jpg'
            url_lower = url.lower()
            if '.png' in url_lower:
                ext = 'png'
            elif '.webp' in url_lower:
                ext = 'webp'

            # Create hash of URL to avoid duplicates
            url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
            filename = f"{folder_name}-{downloaded + 1}-{url_hash}.{ext}"
            save_path = product_dir / filename

            print(f"  [{downloaded + 1}/{max_images}] {filename[:40]:40s}...", end=" ", flush=True)

            success, domain = self.download_image(url, save_path)
            if success:
                print(f"✅ ({domain})")
                downloaded += 1

                # Track source
                if domain not in self.source_stats:
                    self.source_stats[domain] = 0
                self.source_stats[domain] += 1
            else:
                print("❌")

            time.sleep(0.3)

        print(f"\n✅ Downloaded {downloaded}/{max_images} images")
        return downloaded

    def scrape_products_from_file(self, filepath):
        """Scrape products from config file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            config = json.load(f)

        products = config.get('products', [])
        total = 0

        print(f"\n{'='*60}")
        print(f"🌍 Web-Wide Image Scraper")
        print(f"{'='*60}")
        print(f"Products: {len(products)}")
        print(f"Output: {self.output_dir.absolute()}")
        print(f"Search Engines: Bing, Yandex, Ecosia, Unsplash")
        print(f"{'='*60}")

        for product in products:
            name = product.get('name', '')
            query = product.get('query', name)
            max_images = product.get('max_images', IMAGES_PER_PRODUCT)

            downloaded = self.scrape_product(name, query, max_images)
            total += downloaded
            time.sleep(2)

        # Show stats
        print(f"\n{'='*60}")
        print(f"🎉 Complete!")
        print(f"{'='*60}")
        print(f"📊 Total: {total} images")
        print(f"📁 Location: {self.output_dir.absolute()}")

        if self.source_stats:
            print(f"\n🌐 Image sources:")
            for domain, count in sorted(self.source_stats.items(), key=lambda x: x[1], reverse=True)[:10]:
                print(f"   {domain:30s}: {count:3d}")

        print(f"{'='*60}\n")
        return total


def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║         IntiTech Web-Wide Image Scraper                  ║
║                                                           ║
║  Scrapes images from ACROSS THE WEB using multiple       ║
║  search engines: Bing, Yandex, Ecosia, and more!        ║
╚═══════════════════════════════════════════════════════════╝
    """)

    config_file = Path("scraper-config.json")
    if not config_file.exists():
        print("❌ Config file not found!")
        return

    scraper = WebImageScraper()
    scraper.scrape_products_from_file(config_file)


if __name__ == "__main__":
    main()
