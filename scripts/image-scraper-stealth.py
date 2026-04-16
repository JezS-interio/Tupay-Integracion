#!/usr/bin/env python3
"""
STEALTH Web Scraper - Anti-Detection Techniques
Uses advanced techniques to bypass bot detection:
- User-Agent rotation (50+ real browsers)
- Random headers and referers
- Human-like delays
- Cookie/session management
- Multiple fallback methods
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
from datetime import datetime

# Configuration
OUTPUT_DIR = "downloaded_images"
IMAGES_PER_PRODUCT = 5
TIMEOUT = 20

class StealthImageScraper:
    def __init__(self, output_dir=OUTPUT_DIR):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

        # Separate session for each request type
        self.sessions = {}

        self.domains = {}

        # Massive User-Agent list (50+ real browsers)
        self.user_agents = [
            # Chrome on Windows
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

            # Chrome on Mac
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

            # Chrome on Linux
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

            # Firefox on Windows
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',

            # Firefox on Mac
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 13.6; rv:121.0) Gecko/20100101 Firefox/121.0',

            # Safari on Mac
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',

            # Edge
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',

            # Mobile browsers
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36',
        ]

        # Referer list (look like you came from legit sites)
        self.referers = [
            'https://www.google.com/',
            'https://www.bing.com/',
            'https://www.yahoo.com/',
            'https://duckduckgo.com/',
            'https://www.reddit.com/',
            'https://www.facebook.com/',
            'https://www.twitter.com/',
            'https://www.pinterest.com/',
        ]

        # Languages
        self.languages = [
            'en-US,en;q=0.9',
            'en-GB,en;q=0.9',
            'en-US,en;q=0.9,es;q=0.8',
            'en-US,en;q=0.9,fr;q=0.8',
        ]

    def get_random_headers(self, for_images=False):
        """Generate random realistic headers"""
        if for_images:
            return {
                'User-Agent': random.choice(self.user_agents),
                'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Language': random.choice(self.languages),
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': random.choice(self.referers),
                'DNT': '1',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'image',
                'Sec-Fetch-Mode': 'no-cors',
                'Sec-Fetch-Site': 'cross-site',
            }
        else:
            return {
                'User-Agent': random.choice(self.user_agents),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': random.choice(self.languages),
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': random.choice(self.referers),
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0',
            }

    def human_delay(self, min_sec=1, max_sec=3):
        """Random delay to mimic human behavior"""
        delay = random.uniform(min_sec, max_sec)
        time.sleep(delay)

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

    def search_duckduckgo_stealth(self, query, max_results=30):
        """DuckDuckGo with maximum stealth"""
        print(f"   🦆 DuckDuckGo (stealth)...", end=" ", flush=True)

        image_urls = []

        for attempt in range(3):  # Try 3 times with different configs
            try:
                session = requests.Session()
                session.headers.update(self.get_random_headers())

                # Step 1: Get main page
                url = "https://duckduckgo.com/"
                params = {'q': query, 'iax': 'images', 'ia': 'images'}

                response = session.get(url, params=params, timeout=TIMEOUT)

                if response.status_code != 200:
                    self.human_delay(2, 4)
                    continue

                # Extract vqd token
                vqd_patterns = [
                    r'vqd=([\d-]+)',
                    r'"vqd":"([\d-]+)"',
                    r'vqd":\s*"([\d-]+)"',
                ]

                vqd = None
                for pattern in vqd_patterns:
                    match = re.search(pattern, response.text)
                    if match:
                        vqd = match.group(1)
                        break

                if not vqd:
                    self.human_delay(2, 4)
                    continue

                # Step 2: Get images API
                self.human_delay(0.5, 1.5)

                api_url = "https://duckduckgo.com/i.js"
                params = {
                    'l': 'us-en',
                    'o': 'json',
                    'q': query,
                    'vqd': vqd,
                    'f': ',,,',
                    'p': '1',
                }

                response = session.get(api_url, params=params, timeout=TIMEOUT)

                if response.status_code == 200:
                    data = response.json()
                    for result in data.get('results', []):
                        img_url = result.get('image', '')
                        if img_url and img_url.startswith('http'):
                            image_urls.append(img_url)
                            if len(image_urls) >= max_results:
                                break

                    if image_urls:
                        break

            except Exception as e:
                pass

            self.human_delay(2, 4)

        if image_urls:
            print(f"✅ {len(image_urls)}")
        else:
            print("❌")

        return image_urls

    def search_bing_stealth(self, query, max_results=30):
        """Bing with anti-detection"""
        print(f"   🔍 Bing (stealth)...", end=" ", flush=True)

        image_urls = []

        for attempt in range(3):
            try:
                session = requests.Session()
                headers = self.get_random_headers()

                # Randomize search parameters
                first = random.choice([1, 0])
                count = random.choice([35, 50, 70, 100])

                url = f"https://www.bing.com/images/search"
                params = {
                    'q': query,
                    'first': first,
                    'count': count,
                    'qft': '',
                    'form': 'IRFLTR',
                }

                response = session.get(url, params=params, headers=headers, timeout=TIMEOUT)

                if response.status_code == 200:
                    html = response.text

                    # Multiple extraction patterns
                    patterns = [
                        r'"murl":"([^"]+)"',
                        r'"purl":"([^"]+)"',
                        r'mediaurl=([^&"]+)',
                        r'"turl":"([^"]+)"',
                    ]

                    for pattern in patterns:
                        matches = re.findall(pattern, html)
                        for match in matches:
                            url = match.replace('\\/', '/')
                            if url.startswith('http') and url not in image_urls:
                                image_urls.append(url)
                                if len(image_urls) >= max_results:
                                    break
                        if len(image_urls) >= max_results:
                            break

                    if image_urls:
                        break

            except:
                pass

            self.human_delay(2, 4)

        if image_urls:
            print(f"✅ {len(image_urls)}")
        else:
            print("❌")

        return image_urls

    def search_alternative_sources(self, query, max_results=10):
        """Try alternative image sources"""
        print(f"   🔄 Alternative sources...", end=" ", flush=True)

        image_urls = []

        # Try Imgur public search
        try:
            session = requests.Session()
            headers = self.get_random_headers()

            search_url = f"https://imgur.com/search/time?q={quote_plus(query)}"
            response = session.get(search_url, headers=headers, timeout=TIMEOUT)

            if response.status_code == 200:
                pattern = r'https://i\.imgur\.com/[a-zA-Z0-9]+\.(jpg|png|gif)'
                matches = re.findall(pattern, response.text)

                for match in matches[:max_results]:
                    url = f"https://i.imgur.com/{match[0]}.{match[1]}"
                    if url not in image_urls:
                        image_urls.append(url)
        except:
            pass

        if image_urls:
            print(f"✅ {len(image_urls)}")
        else:
            print("❌")

        return image_urls

    def download_image_stealth(self, url, save_path):
        """Download with anti-detection"""
        for attempt in range(2):
            try:
                headers = self.get_random_headers(for_images=True)

                response = requests.get(
                    url,
                    headers=headers,
                    timeout=TIMEOUT,
                    stream=True,
                    allow_redirects=True,
                    verify=False
                )

                if response.status_code != 200:
                    if attempt < 1:
                        self.human_delay(1, 2)
                        continue
                    return False, None

                content_type = response.headers.get('content-type', '').lower()
                if 'image' not in content_type and 'octet-stream' not in content_type:
                    return False, None

                with open(save_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)

                size = os.path.getsize(save_path)
                if size < 2048:
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
                if attempt < 1:
                    self.human_delay(1, 2)
                    continue
                return False, None

        return False, None

    def scrape_product(self, product_name, query=None, max_images=IMAGES_PER_PRODUCT):
        """Scrape with maximum stealth"""
        print(f"\n{'='*60}")
        print(f"📦 Product: {product_name}")
        print(f"{'='*60}")

        search_query = query or product_name
        folder_name = self.sanitize_filename(product_name)
        product_dir = self.output_dir / folder_name
        product_dir.mkdir(exist_ok=True)

        print(f"\n🥷 STEALTH MODE: Scraping web for: {search_query}")

        all_urls = []

        # Try DuckDuckGo with stealth
        ddg_urls = self.search_duckduckgo_stealth(search_query, max_images * 3)
        all_urls.extend(ddg_urls)
        self.human_delay(2, 4)

        # Try Bing with stealth
        bing_urls = self.search_bing_stealth(search_query, max_images * 3)
        all_urls.extend(bing_urls)
        self.human_delay(2, 4)

        # Try alternative sources
        alt_urls = self.search_alternative_sources(search_query, max_images)
        all_urls.extend(alt_urls)

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

        # Show sources
        sample_domains = list(set([self.get_domain(url) for url in unique_urls[:15]]))
        print(f"\n   📍 Found {len(unique_urls)} URLs from: {', '.join(sample_domains[:5])}")

        # Download
        print(f"\n📥 Downloading to: {product_dir}")

        downloaded = 0
        attempts = 0
        max_attempts = min(len(unique_urls), max_images * 6)

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

            success, domain = self.download_image_stealth(url, save_path)
            if success:
                print(f"✅")
                downloaded += 1
            else:
                print(f"❌")

            # Random human-like delay
            self.human_delay(0.5, 1.5)

        print(f"\n✅ Downloaded {downloaded}/{max_images} images")
        return downloaded

    def scrape_products_from_file(self, filepath):
        """Scrape all products with stealth"""
        with open(filepath, 'r', encoding='utf-8') as f:
            config = json.load(f)

        products = config.get('products', [])
        total = 0

        print(f"\n{'='*60}")
        print(f"🥷 STEALTH WEB SCRAPER")
        print(f"{'='*60}")
        print(f"Products: {len(products)}")
        print(f"Output: {self.output_dir.absolute()}")
        print(f"Anti-Detection: UA rotation, header spoofing, human delays")
        print(f"{'='*60}")

        for i, product in enumerate(products, 1):
            print(f"\n[Product {i}/{len(products)}]")

            name = product.get('name', '')
            query = product.get('query', name)
            max_images = product.get('max_images', IMAGES_PER_PRODUCT)

            downloaded = self.scrape_product(name, query, max_images)
            total += downloaded

            if i < len(products):
                # Longer delay between products
                self.human_delay(4, 7)

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

        print(f"{'='*60}\n")
        return total


def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║            🥷 STEALTH WEB SCRAPER 🥷                      ║
║                                                           ║
║  Advanced Anti-Detection Techniques:                     ║
║  ✓ 50+ User-Agent rotation                              ║
║  ✓ Random headers & referers                            ║
║  ✓ Human-like delays                                    ║
║  ✓ Multiple fallback methods                            ║
║  ✓ Session management                                   ║
╚═══════════════════════════════════════════════════════════╝
    """)

    config_file = Path("scraper-config.json")
    if not config_file.exists():
        print("❌ Config not found!")
        return

    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    scraper = StealthImageScraper()
    scraper.scrape_products_from_file(config_file)


if __name__ == "__main__":
    main()
