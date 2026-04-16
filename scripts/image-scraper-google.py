#!/usr/bin/env python3
"""
Google Images Web Scraper - TRUE WEB-WIDE SCRAPING
Scrapes Google Images which indexes the ENTIRE INTERNET.
Images come from thousands of different websites.
No API - pure web scraping.
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
from base64 import b64decode

# Configuration
OUTPUT_DIR = "downloaded_images"
IMAGES_PER_PRODUCT = 5
TIMEOUT = 15

class GoogleImageScraper:
    def __init__(self, output_dir=OUTPUT_DIR):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

        # Track source domains
        self.domains = {}

        # Rotate user agents
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        ]

    def get_headers(self):
        """Get random headers to avoid detection"""
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        }

    def sanitize_filename(self, text):
        """Convert text to safe filename"""
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-').lower()

    def get_domain(self, url):
        """Extract domain from URL"""
        try:
            domain = urlparse(url).netloc
            domain = domain.replace('www.', '')
            # Remove subdomains for common sites
            parts = domain.split('.')
            if len(parts) > 2:
                domain = '.'.join(parts[-2:])
            return domain
        except:
            return 'unknown'

    def search_google_images(self, query, max_results=50):
        """Scrape Google Images - gets images from ENTIRE WEB"""
        print(f"\n🌍 Scraping Google Images for: {query}")
        print(f"   (Google indexes millions of websites)")

        image_urls = []

        try:
            # Google Images search URL
            search_url = f"https://www.google.com/search?tbm=isch&q={quote_plus(query)}&ijn=0"

            headers = self.get_headers()

            # Request Google Images page
            response = requests.get(search_url, headers=headers, timeout=TIMEOUT)
            response.raise_for_status()

            html = response.text

            # Google Images stores data in JavaScript variables
            # Extract image URLs from the page source

            # Method 1: Find direct image URLs in thumbnails
            pattern1 = r'"(https?://[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"'
            matches1 = re.findall(pattern1, html, re.IGNORECASE)

            # Method 2: Find URLs in data attributes
            pattern2 = r'data-src="(https?://[^"]+)"'
            matches2 = re.findall(pattern2, html)

            # Method 3: Find URLs in ou= parameters (original URL)
            pattern3 = r'"ou":"(https?://[^"]+)"'
            matches3 = re.findall(pattern3, html)

            # Method 4: Find base64 encoded thumbnails and their source URLs
            pattern4 = r'\["(https?://[^"]+)",\d+,\d+\]'
            matches4 = re.findall(pattern4, html)

            # Combine all matches
            all_matches = matches1 + matches2 + matches3 + matches4

            # Filter and clean URLs
            seen = set()
            for url in all_matches:
                # Decode URL encoding
                url = unquote(url)

                # Skip Google's own URLs
                if 'google' in url.lower():
                    continue
                if 'gstatic' in url.lower():
                    continue

                # Skip very small images (likely icons)
                if any(x in url.lower() for x in ['icon', 'logo', 'avatar', 'thumb']):
                    continue

                # Must be http/https
                if not url.startswith('http'):
                    continue

                # Clean the URL
                url = url.split('?')[0] if '?' in url else url
                url = url.strip()

                if url and url not in seen:
                    seen.add(url)
                    image_urls.append(url)

                    if len(image_urls) >= max_results:
                        break

            print(f"   ✅ Found {len(image_urls)} image URLs from across the web")

            # Show some domains
            if image_urls:
                sample_domains = [self.get_domain(url) for url in image_urls[:10]]
                unique_domains = list(set(sample_domains))
                print(f"   📍 Sample sources: {', '.join(unique_domains[:5])}")

        except Exception as e:
            print(f"   ❌ Error: {e}")

        return image_urls

    def download_image(self, url, save_path):
        """Download image from URL"""
        try:
            headers = {
                'User-Agent': random.choice(self.user_agents),
                'Referer': 'https://www.google.com/',
                'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            }

            # Try to download
            response = requests.get(
                url,
                headers=headers,
                timeout=TIMEOUT,
                stream=True,
                allow_redirects=True,
                verify=False  # Some sites have SSL issues
            )

            # Check if successful
            if response.status_code != 200:
                return False, None

            # Check content type
            content_type = response.headers.get('content-type', '').lower()
            if 'image' not in content_type and 'octet-stream' not in content_type:
                return False, None

            # Download
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

            # Verify file size
            size = os.path.getsize(save_path)
            if size < 3072:  # Less than 3KB - likely too small
                os.remove(save_path)
                return False, None

            # Track domain
            domain = self.get_domain(url)
            if domain not in self.domains:
                self.domains[domain] = 0
            self.domains[domain] += 1

            return True, domain

        except Exception as e:
            if os.path.exists(save_path):
                os.remove(save_path)
            return False, None

    def scrape_product(self, product_name, query=None, max_images=IMAGES_PER_PRODUCT):
        """Scrape images for a product from across the web"""
        print(f"\n{'='*60}")
        print(f"📦 Product: {product_name}")
        print(f"{'='*60}")

        search_query = query or product_name
        folder_name = self.sanitize_filename(product_name)
        product_dir = self.output_dir / folder_name
        product_dir.mkdir(exist_ok=True)

        # Search Google Images (which indexes the entire web)
        image_urls = self.search_google_images(search_query, max_images * 5)

        # Shuffle for variety
        random.shuffle(image_urls)

        if not image_urls:
            print(f"\n  ❌ No images found")
            return 0

        # Download images
        print(f"\n📥 Downloading to: {product_dir}")
        print(f"   Trying to download {max_images} images from different websites...")

        downloaded = 0
        attempts = 0
        max_attempts = min(len(image_urls), max_images * 4)

        for url in image_urls:
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

            # Create filename with hash to avoid duplicates
            url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
            filename = f"{folder_name}-{downloaded + 1}-{url_hash}.{ext}"
            save_path = product_dir / filename

            # Get domain for display
            domain = self.get_domain(url)

            print(f"   [{downloaded + 1}/{max_images}] {domain[:25]:25s} → ", end="", flush=True)

            success, domain = self.download_image(url, save_path)
            if success:
                print(f"✅ {filename}")
                downloaded += 1
            else:
                print(f"❌")

            # Small delay to be respectful
            time.sleep(0.5)

        print(f"\n✅ Downloaded {downloaded}/{max_images} images from {len(set(self.domains.keys()))} different websites")
        return downloaded

    def scrape_products_from_file(self, filepath):
        """Scrape all products from config file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            config = json.load(f)

        products = config.get('products', [])
        total = 0

        print(f"\n{'='*60}")
        print(f"🌍 GOOGLE IMAGES WEB SCRAPER")
        print(f"{'='*60}")
        print(f"Products to scrape: {len(products)}")
        print(f"Output directory: {self.output_dir.absolute()}")
        print(f"Source: Google Images (indexes ENTIRE INTERNET)")
        print(f"{'='*60}")

        for i, product in enumerate(products, 1):
            print(f"\n[{i}/{len(products)}]", end=" ")

            name = product.get('name', '')
            query = product.get('query', name)
            max_images = product.get('max_images', IMAGES_PER_PRODUCT)

            downloaded = self.scrape_product(name, query, max_images)
            total += downloaded

            # Delay between products to avoid rate limiting
            if i < len(products):
                time.sleep(3)

        # Final statistics
        print(f"\n{'='*60}")
        print(f"🎉 SCRAPING COMPLETE!")
        print(f"{'='*60}")
        print(f"📊 Total images downloaded: {total}")
        print(f"📁 Saved to: {self.output_dir.absolute()}")

        if self.domains:
            print(f"\n🌐 Images downloaded from {len(self.domains)} different websites:")
            sorted_domains = sorted(self.domains.items(), key=lambda x: x[1], reverse=True)
            for domain, count in sorted_domains[:15]:
                print(f"   {domain:30s}: {count:2d} images")

            if len(self.domains) > 15:
                print(f"   ... and {len(self.domains) - 15} more websites")

        print(f"{'='*60}\n")
        return total


def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║       🌍 GOOGLE IMAGES WEB SCRAPER 🌍                     ║
║                                                           ║
║  Scrapes images from ACROSS THE ENTIRE INTERNET!         ║
║  Uses Google Images which indexes millions of sites      ║
║                                                           ║
║  Images come from: e-commerce sites, blogs, reviews,     ║
║  manufacturer sites, tech sites, and more!               ║
╚═══════════════════════════════════════════════════════════╝
    """)

    config_file = Path("scraper-config.json")
    if not config_file.exists():
        print("❌ Configuration file not found!")
        print(f"📝 Create '{config_file}' first")
        return

    # Disable SSL warnings
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    scraper = GoogleImageScraper()
    scraper.scrape_products_from_file(config_file)


if __name__ == "__main__":
    main()
