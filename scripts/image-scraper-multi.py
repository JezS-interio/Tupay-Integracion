#!/usr/bin/env python3
"""
Multi-Source Product Image Scraper
Downloads product images from MULTIPLE different sources for variety.
Mixes images from: Unsplash, Pixabay, Pexels, Flickr, and more.
"""

import os
import requests
import time
import json
from pathlib import Path
import re
from urllib.parse import quote_plus, urlencode
import random

# Configuration
OUTPUT_DIR = "downloaded_images"
IMAGES_PER_PRODUCT = 5
TIMEOUT = 10

class MultiSourceImageScraper:
    def __init__(self, output_dir=OUTPUT_DIR):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

        # Track which sources were used
        self.source_stats = {
            'unsplash': 0,
            'pixabay': 0,
            'pexels': 0,
            'flickr': 0,
            'wikimedia': 0
        }

    def sanitize_filename(self, text):
        """Convert text to safe filename"""
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-').lower()

    def search_unsplash(self, query, max_images=3):
        """Search Unsplash for product images"""
        print(f"  🔍 Unsplash...", end=" ")

        image_urls = []
        try:
            search_url = f"https://unsplash.com/napi/search/photos"
            params = {
                'query': query,
                'per_page': max_images * 2,
                'page': 1
            }

            response = self.session.get(search_url, params=params, timeout=TIMEOUT)
            response.raise_for_status()

            data = response.json()
            results = data.get('results', [])

            for result in results[:max_images]:
                urls = result.get('urls', {})
                img_url = urls.get('regular', urls.get('full', ''))
                if img_url:
                    image_urls.append(('unsplash', img_url))

            print(f"✅ {len(image_urls)}")

        except Exception as e:
            print(f"❌")

        return image_urls

    def search_pixabay(self, query, max_images=3):
        """Search Pixabay for product images (no API key needed for web scraping)"""
        print(f"  🔍 Pixabay...", end=" ")

        image_urls = []
        try:
            # Pixabay web search
            search_url = f"https://pixabay.com/images/search/{quote_plus(query)}/"

            response = self.session.get(search_url, timeout=TIMEOUT)
            response.raise_for_status()

            html = response.text

            # Extract image URLs from Pixabay's HTML
            # Pixabay stores images in data-lazy attributes
            patterns = [
                r'data-lazy="([^"]+\.jpg[^"]*)"',
                r'src="(https://pixabay\.com/get/[^"]+)"'
            ]

            for pattern in patterns:
                matches = re.findall(pattern, html)
                for match in matches:
                    if match.startswith('http') and match not in [url for _, url in image_urls]:
                        image_urls.append(('pixabay', match))
                        if len(image_urls) >= max_images:
                            break
                if len(image_urls) >= max_images:
                    break

            print(f"✅ {len(image_urls)}")

        except Exception as e:
            print(f"❌")

        return image_urls

    def search_flickr(self, query, max_images=3):
        """Search Flickr for Creative Commons licensed images"""
        print(f"  🔍 Flickr...", end=" ")

        image_urls = []
        try:
            # Flickr public feed (no API key needed)
            search_url = "https://www.flickr.com/services/feeds/photos_public.gne"
            params = {
                'tags': query.replace(' ', ','),
                'format': 'json',
                'nojsoncallback': 1
            }

            response = self.session.get(search_url, params=params, timeout=TIMEOUT)
            response.raise_for_status()

            data = response.json()
            items = data.get('items', [])

            for item in items[:max_images]:
                # Get the large version of the image
                media = item.get('media', {})
                img_url = media.get('m', '')
                if img_url:
                    # Convert to larger size
                    img_url = img_url.replace('_m.jpg', '_b.jpg')
                    image_urls.append(('flickr', img_url))

            print(f"✅ {len(image_urls)}")

        except Exception as e:
            print(f"❌")

        return image_urls

    def search_wikimedia(self, query, max_images=2):
        """Search Wikimedia Commons for free images"""
        print(f"  🔍 Wikimedia...", end=" ")

        image_urls = []
        try:
            search_url = "https://commons.wikimedia.org/w/api.php"
            params = {
                'action': 'query',
                'generator': 'search',
                'gsrnamespace': 6,  # File namespace
                'gsrsearch': query,
                'gsrlimit': max_images * 2,
                'prop': 'imageinfo',
                'iiprop': 'url',
                'format': 'json'
            }

            response = self.session.get(search_url, params=params, timeout=TIMEOUT)
            response.raise_for_status()

            data = response.json()
            pages = data.get('query', {}).get('pages', {})

            for page_id, page_data in pages.items():
                imageinfo = page_data.get('imageinfo', [])
                if imageinfo:
                    img_url = imageinfo[0].get('url', '')
                    if img_url and (img_url.endswith('.jpg') or img_url.endswith('.png')):
                        image_urls.append(('wikimedia', img_url))
                        if len(image_urls) >= max_images:
                            break

            print(f"✅ {len(image_urls)}")

        except Exception as e:
            print(f"❌")

        return image_urls

    def search_imgur(self, query, max_images=2):
        """Search Imgur for product images"""
        print(f"  🔍 Imgur...", end=" ")

        image_urls = []
        try:
            # Use Imgur search (public gallery)
            search_url = f"https://imgur.com/search"
            params = {
                'q': query
            }

            headers = self.session.headers.copy()
            headers['Accept'] = 'application/json'

            response = self.session.get(search_url, params=params, headers=headers, timeout=TIMEOUT)

            # Try to extract image URLs from HTML
            html = response.text

            # Imgur stores images with specific patterns
            pattern = r'https://i\.imgur\.com/[a-zA-Z0-9]+\.(jpg|png)'
            matches = re.findall(pattern, html)

            seen = set()
            for match in matches:
                url = f"https://i.imgur.com/{match[0]}.{match[1]}"
                if url not in seen:
                    seen.add(url)
                    image_urls.append(('imgur', url))
                    if len(image_urls) >= max_images:
                        break

            print(f"✅ {len(image_urls)}" if image_urls else "❌")

        except Exception as e:
            print(f"❌")

        return image_urls

    def download_image(self, url, save_path, source):
        """Download a single image"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://google.com'
            }
            response = self.session.get(url, headers=headers, timeout=TIMEOUT, stream=True)
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

            self.source_stats[source] += 1
            return True

        except Exception as e:
            if os.path.exists(save_path):
                os.remove(save_path)
            return False

    def scrape_product(self, product_name, query=None, max_images=IMAGES_PER_PRODUCT):
        """Scrape images for a single product from multiple sources"""
        print(f"\n{'='*60}")
        print(f"📦 Product: {product_name}")
        print(f"{'='*60}")

        search_query = query or product_name
        folder_name = self.sanitize_filename(product_name)
        product_dir = self.output_dir / folder_name
        product_dir.mkdir(exist_ok=True)

        # Collect images from ALL sources
        print(f"\n🔎 Searching multiple sources for: {search_query}")

        all_images = []

        # Search each source (distribute the load)
        images_per_source = max(1, max_images // 4)  # Divide among sources

        all_images.extend(self.search_unsplash(search_query, images_per_source + 1))
        time.sleep(0.5)

        all_images.extend(self.search_pixabay(search_query, images_per_source + 1))
        time.sleep(0.5)

        all_images.extend(self.search_flickr(search_query, images_per_source))
        time.sleep(0.5)

        all_images.extend(self.search_wikimedia(search_query, images_per_source))
        time.sleep(0.5)

        # Shuffle to mix sources
        random.shuffle(all_images)

        if not all_images:
            print(f"\n  ❌ No images found from any source")
            return 0

        print(f"\n  📊 Total found: {len(all_images)} images from {len(set(src for src, _ in all_images))} sources")

        # Download images
        print(f"\n📥 Downloading images to: {product_dir}")
        downloaded = 0

        for source, url in all_images:
            if downloaded >= max_images:
                break

            ext = 'jpg'
            if '.png' in url.lower():
                ext = 'png'
            elif '.webp' in url.lower():
                ext = 'webp'

            filename = f"{folder_name}-{downloaded + 1}-{source}.{ext}"
            save_path = product_dir / filename

            print(f"  [{downloaded + 1}/{max_images}] {source:10s} → {filename}...", end=" ")

            if self.download_image(url, save_path, source):
                print("✅")
                downloaded += 1
            else:
                print("❌")

            time.sleep(0.3)

        print(f"\n✅ Downloaded {downloaded} images")
        return downloaded

    def scrape_products_from_file(self, filepath):
        """Scrape products from configuration file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            config = json.load(f)

        products = config.get('products', [])
        total_downloaded = 0

        print(f"\n{'='*60}")
        print(f"🚀 Multi-Source Image Scraper")
        print(f"{'='*60}")
        print(f"Products to scrape: {len(products)}")
        print(f"Output directory: {self.output_dir.absolute()}")
        print(f"Sources: Unsplash, Pixabay, Flickr, Wikimedia")
        print(f"{'='*60}")

        for product in products:
            name = product.get('name', '')
            query = product.get('query', name)
            max_images = product.get('max_images', IMAGES_PER_PRODUCT)

            downloaded = self.scrape_product(name, query, max_images)
            total_downloaded += downloaded

            time.sleep(2)

        # Print statistics
        print(f"\n{'='*60}")
        print(f"🎉 Scraping complete!")
        print(f"{'='*60}")
        print(f"📊 Total images downloaded: {total_downloaded}")
        print(f"📁 Location: {self.output_dir.absolute()}")
        print(f"\n📈 Images by source:")
        for source, count in sorted(self.source_stats.items(), key=lambda x: x[1], reverse=True):
            if count > 0:
                percentage = (count / total_downloaded * 100) if total_downloaded > 0 else 0
                print(f"   {source.capitalize():12s}: {count:3d} ({percentage:.1f}%)")
        print(f"{'='*60}\n")

        return total_downloaded


def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║        IntiTech Multi-Source Image Scraper               ║
║                                                           ║
║  Downloads images from MULTIPLE sources for variety!     ║
║  Sources: Unsplash, Pixabay, Flickr, Wikimedia          ║
╚═══════════════════════════════════════════════════════════╝
    """)

    config_file = Path("scraper-config.json")

    if not config_file.exists():
        print("❌ Configuration file not found!")
        print(f"📝 Please create '{config_file}' first")
        return

    scraper = MultiSourceImageScraper()
    scraper.scrape_products_from_file(config_file)


if __name__ == "__main__":
    main()
