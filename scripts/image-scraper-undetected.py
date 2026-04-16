#!/usr/bin/env python3
"""
UNDETECTED SELENIUM SCRAPER
Uses undetected-chromedriver to bypass anti-bot detection.
Scrapes from MULTIPLE sources: Bing, DuckDuckGo, Yandex.

INSTALL FIRST:
pip install undetected-chromedriver
"""

import os
import sys
import requests
import time
import json
from pathlib import Path
import re
from urllib.parse import quote_plus, urlparse
import random
import hashlib

# Check for undetected-chromedriver
try:
    import undetected_chromedriver as uc
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
except ImportError:
    print("❌ ERROR: undetected-chromedriver no está instalado!")
    print("\n📦 Instala con:")
    print("   pip install undetected-chromedriver")
    print("\nEsto bypasses detección de bots de Google/Bing/etc.")
    sys.exit(1)

# Configuration
OUTPUT_DIR = "downloaded_images"
IMAGES_PER_PRODUCT = 5
TIMEOUT = 20

class UndetectedScraper:
    def __init__(self, output_dir=OUTPUT_DIR, headless=False):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.headless = headless
        self.driver = None
        self.domains = {}

    def init_driver(self):
        """Initialize undetected Chrome"""
        print("\n🥷 Inicializando Chrome STEALTH MODE...")

        try:
            options = uc.ChromeOptions()

            if self.headless:
                options.add_argument('--headless=new')
                print("   Modo: Headless")
            else:
                print("   Modo: Visible")

            # Anti-detection options
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--no-sandbox')
            options.add_argument('--start-maximized')

            # Create undetected Chrome instance
            self.driver = uc.Chrome(options=options, version_main=120)

            print("   ✅ Chrome STEALTH iniciado!")
            return True

        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False

    def human_delay(self, min_sec=1, max_sec=3):
        """Random human-like delay"""
        time.sleep(random.uniform(min_sec, max_sec))

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

    def scrape_bing_images(self, query, max_images=30):
        """Scrape Bing Images with Selenium"""
        print(f"\n   🔍 Bing Images...", end=" ", flush=True)

        image_urls = []

        try:
            url = f"https://www.bing.com/images/search?q={quote_plus(query)}&first=1"
            self.driver.get(url)

            self.human_delay(2, 3)

            # Scroll to load images
            for _ in range(3):
                self.driver.execute_script("window.scrollBy(0, 1000);")
                self.human_delay(1, 2)

            # Find images
            images = self.driver.find_elements(By.CSS_SELECTOR, "a.iusc")

            for img in images[:max_images]:
                try:
                    # Get the 'm' attribute which contains image data
                    m_attr = img.get_attribute('m')
                    if m_attr:
                        # Parse JSON
                        data = json.loads(m_attr)
                        img_url = data.get('murl', '')
                        if img_url and img_url.startswith('http'):
                            image_urls.append(img_url)
                except:
                    continue

            print(f"✅ {len(image_urls)}")

        except Exception as e:
            print(f"❌ ({str(e)[:30]})")

        return image_urls

    def scrape_yandex_images(self, query, max_images=30):
        """Scrape Yandex Images with Selenium"""
        print(f"   🔍 Yandex Images...", end=" ", flush=True)

        image_urls = []

        try:
            url = f"https://yandex.com/images/search?text={quote_plus(query)}"
            self.driver.get(url)

            self.human_delay(2, 3)

            # Scroll to load images
            for _ in range(3):
                self.driver.execute_script("window.scrollBy(0, 1000);")
                self.human_delay(1, 2)

            # Find images
            images = self.driver.find_elements(By.CSS_SELECTOR, "img.serp-item__thumb")

            for img in images[:max_images]:
                try:
                    src = img.get_attribute('src')
                    if not src:
                        src = img.get_attribute('data-src')

                    if src and src.startswith('http'):
                        # Get original URL from parent
                        parent = img.find_element(By.XPATH, "./../..")
                        href = parent.get_attribute('href')
                        if href and 'img_url=' in href:
                            # Extract actual image URL
                            img_url = href.split('img_url=')[1].split('&')[0]
                            from urllib.parse import unquote
                            img_url = unquote(img_url)
                            if img_url.startswith('http'):
                                image_urls.append(img_url)
                except:
                    continue

            print(f"✅ {len(image_urls)}")

        except Exception as e:
            print(f"❌")

        return image_urls

    def scrape_duckduckgo_images(self, query, max_images=30):
        """Scrape DuckDuckGo Images with Selenium"""
        print(f"   🦆 DuckDuckGo Images...", end=" ", flush=True)

        image_urls = []

        try:
            url = f"https://duckduckgo.com/?q={quote_plus(query)}&iax=images&ia=images"
            self.driver.get(url)

            self.human_delay(3, 4)

            # Scroll to load images
            for _ in range(3):
                self.driver.execute_script("window.scrollBy(0, 1000);")
                self.human_delay(1, 2)

            # Click on images to get full URLs
            images = self.driver.find_elements(By.CSS_SELECTOR, "img.tile--img__img")

            for i, img in enumerate(images[:max_images]):
                try:
                    # Click image
                    img.click()
                    self.human_delay(0.5, 1)

                    # Get full image URL from detail view
                    detail_img = self.driver.find_element(By.CSS_SELECTOR, "img.detail__media__img")
                    src = detail_img.get_attribute('src')

                    if src and src.startswith('http') and 'duckduckgo' not in src:
                        image_urls.append(src)

                except:
                    continue

            print(f"✅ {len(image_urls)}")

        except Exception as e:
            print(f"❌")

        return image_urls

    def download_image(self, url, save_path):
        """Download image from URL"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
            return False, None

    def scrape_product(self, product_name, query=None, max_images=IMAGES_PER_PRODUCT):
        """Scrape images for a product from multiple sources"""
        print(f"\n{'='*60}")
        print(f"📦 Producto: {product_name}")
        print(f"{'='*60}")

        search_query = query or product_name
        folder_name = self.sanitize_filename(product_name)
        product_dir = self.output_dir / folder_name
        product_dir.mkdir(exist_ok=True)

        print(f"\n🌍 Buscando en MÚLTIPLES fuentes: {search_query}")

        all_urls = []

        # Try Bing (usually most reliable)
        bing_urls = self.scrape_bing_images(search_query, max_images * 2)
        all_urls.extend(bing_urls)
        self.human_delay(2, 3)

        # Try Yandex
        yandex_urls = self.scrape_yandex_images(search_query, max_images * 2)
        all_urls.extend(yandex_urls)
        self.human_delay(2, 3)

        # Try DuckDuckGo
        ddg_urls = self.scrape_duckduckgo_images(search_query, max_images)
        all_urls.extend(ddg_urls)

        # Remove duplicates
        seen = set()
        unique_urls = []
        for url in all_urls:
            if url not in seen:
                seen.add(url)
                unique_urls.append(url)

        random.shuffle(unique_urls)

        if not unique_urls:
            print(f"\n  ❌ No se encontraron imágenes")
            return 0

        # Show sample domains
        sample_domains = list(set([self.get_domain(url) for url in unique_urls[:15]]))
        print(f"\n   📍 Encontradas {len(unique_urls)} URLs de: {', '.join(sample_domains[:5])}")
        if len(sample_domains) > 5:
            print(f"      ... y {len(sample_domains) - 5} más")

        # Download
        print(f"\n📥 Descargando a: {product_dir}")

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

            success, domain = self.download_image(url, save_path)
            if success:
                print(f"✅")
                downloaded += 1
            else:
                print(f"❌")

            time.sleep(0.3)

        print(f"\n✅ Descargadas {downloaded}/{max_images} imágenes de múltiples fuentes")
        return downloaded

    def scrape_products_from_file(self, filepath):
        """Scrape all products"""
        with open(filepath, 'r', encoding='utf-8') as f:
            config = json.load(f)

        products = config.get('products', [])

        if not self.init_driver():
            return 0

        total = 0

        print(f"\n{'='*60}")
        print(f"🥷 UNDETECTED MULTI-SOURCE SCRAPER")
        print(f"{'='*60}")
        print(f"Productos: {len(products)}")
        print(f"Output: {self.output_dir.absolute()}")
        print(f"Fuentes: Bing, Yandex, DuckDuckGo (Selenium)")
        print(f"Anti-detección: undetected-chromedriver")
        print(f"{'='*60}")

        try:
            for i, product in enumerate(products, 1):
                print(f"\n[Producto {i}/{len(products)}]")

                name = product.get('name', '')
                query = product.get('query', name)
                max_images = product.get('max_images', IMAGES_PER_PRODUCT)

                downloaded = self.scrape_product(name, query, max_images)
                total += downloaded

                if i < len(products):
                    print(f"\n⏳ Esperando 3 segundos...")
                    time.sleep(3)

        finally:
            if self.driver:
                print(f"\n🔒 Cerrando navegador...")
                self.driver.quit()

        # Stats
        print(f"\n{'='*60}")
        print(f"🎉 ¡COMPLETADO!")
        print(f"{'='*60}")
        print(f"📊 Total: {total} imágenes")
        print(f"📁 Ubicación: {self.output_dir.absolute()}")

        if self.domains:
            print(f"\n🌐 Imágenes de {len(self.domains)} sitios web diferentes:")
            sorted_domains = sorted(self.domains.items(), key=lambda x: x[1], reverse=True)
            for domain, count in sorted_domains[:25]:
                print(f"   {domain:35s}: {count:2d} imágenes")

            if len(self.domains) > 25:
                print(f"   ... y {len(self.domains) - 25} sitios más")

        print(f"{'='*60}\n")
        return total

    def __del__(self):
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass


def main():
    print("""
╔═══════════════════════════════════════════════════════════╗
║     🥷 UNDETECTED MULTI-SOURCE SCRAPER 🥷                 ║
║                                                           ║
║  Bypasses anti-bot detection!                            ║
║  Múltiples fuentes: Bing, Yandex, DuckDuckGo            ║
║  Usa undetected-chromedriver                             ║
╚═══════════════════════════════════════════════════════════╝
    """)

    config_file = Path("scraper-config.json")
    if not config_file.exists():
        print("❌ Config no encontrado!")
        return

    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    # Ask user
    print("\n🤔 ¿Modo headless (invisible) o visible?")
    print("   1. Headless (recomendado, más rápido)")
    print("   2. Visible (verás el navegador)")

    try:
        choice = input("\nOpción (1 o 2) [default: 1]: ").strip()
        headless = choice != '2'
    except:
        headless = True

    scraper = UndetectedScraper(headless=headless)
    scraper.scrape_products_from_file(config_file)


if __name__ == "__main__":
    main()
