#!/usr/bin/env python3
"""
SELENIUM GOOGLE IMAGES SCRAPER
Uses REAL Chrome browser to scrape Google Images.
Gets images from THOUSANDS of websites across the internet!

REQUIREMENTS:
- pip3 install selenium
- Chrome browser (already installed)
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

# Check Selenium is installed
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
except ImportError:
    print("❌ ERROR: Selenium no está instalado!")
    print("\n📦 Instala con:")
    print("   pip3 install selenium")
    print("\nO lee: SELENIUM-SETUP.md")
    sys.exit(1)

# Configuration
OUTPUT_DIR = "downloaded_images"
IMAGES_PER_PRODUCT = 5
TIMEOUT = 15
SCROLL_PAUSE = 1.5

class SeleniumGoogleScraper:
    def __init__(self, output_dir=OUTPUT_DIR, headless=True):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.headless = headless
        self.driver = None
        self.domains = {}

    def init_driver(self):
        """Initialize Chrome with Selenium"""
        print("\n🌐 Inicializando Chrome...")

        chrome_options = Options()

        if self.headless:
            chrome_options.add_argument('--headless=new')
            print("   Modo: Headless (sin ventana)")
        else:
            print("   Modo: Visible (verás el navegador)")

        # Essential options
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')

        # Anti-detection
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)

        # User agent
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

        try:
            # Selenium 4.6+ auto-manages chromedriver
            self.driver = webdriver.Chrome(options=chrome_options)

            # Anti-detection script
            self.driver.execute_cdp_cmd('Network.setUserAgentOverride', {
                "userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            })
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

            print("   ✅ Chrome iniciado correctamente!")
            return True

        except Exception as e:
            print(f"   ❌ Error: {e}")
            print("\n💡 Soluciones:")
            print("   1. Verifica que Chrome esté instalado")
            print("   2. Actualiza Selenium: pip3 install --upgrade selenium")
            print("   3. Lee: SELENIUM-SETUP.md")
            return False

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

    def scrape_google_images(self, query, max_images=50):
        """Scrape Google Images using Selenium"""
        print(f"\n🔍 Buscando en Google Images: {query}")
        print(f"   (Esto scrapeará de miles de sitios web)")

        image_urls = []

        try:
            # Go to Google Images
            search_url = f"https://www.google.com/search?q={quote_plus(query)}&tbm=isch"
            self.driver.get(search_url)

            print(f"   📄 Página cargada, scrolling para cargar imágenes...")

            # Scroll to load more images
            last_height = self.driver.execute_script("return document.body.scrollHeight")

            for scroll in range(5):  # Scroll 5 times
                # Scroll down
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(SCROLL_PAUSE)

                # Calculate new scroll height
                new_height = self.driver.execute_script("return document.body.scrollHeight")

                # Click "Show more results" button if exists
                try:
                    more_button = self.driver.find_element(By.CSS_SELECTOR, ".mye4qd")
                    more_button.click()
                    time.sleep(2)
                except:
                    pass

                if new_height == last_height:
                    break
                last_height = new_height

            print(f"   📸 Extrayendo URLs de imágenes...")

            # Find all image elements
            images = self.driver.find_elements(By.CSS_SELECTOR, "img.rg_i")

            print(f"   🖼️  Encontrados {len(images)} elementos de imagen")

            # Click on each image to get full size URL
            for i, img in enumerate(images[:max_images * 2]):
                try:
                    img.click()
                    time.sleep(0.5)

                    # Wait for sidebar with full image
                    WebDriverWait(self.driver, 3).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "img.sFlh5c"))
                    )

                    # Get full size image URL
                    full_images = self.driver.find_elements(By.CSS_SELECTOR, "img.sFlh5c")

                    for full_img in full_images:
                        src = full_img.get_attribute('src')
                        if src and src.startswith('http') and 'gstatic' not in src and 'google' not in src:
                            if src not in image_urls:
                                image_urls.append(src)

                                if len(image_urls) >= max_images:
                                    break

                    if len(image_urls) >= max_images:
                        break

                except Exception as e:
                    continue

            print(f"   ✅ Extraídas {len(image_urls)} URLs únicas")

            # Show sample domains
            if image_urls:
                sample_domains = list(set([self.get_domain(url) for url in image_urls[:10]]))
                print(f"   📍 Fuentes ejemplo: {', '.join(sample_domains[:5])}")
                if len(sample_domains) > 5:
                    print(f"      ... y {len(sample_domains) - 5} más")

        except Exception as e:
            print(f"   ❌ Error: {e}")

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
        """Scrape images for a product"""
        print(f"\n{'='*60}")
        print(f"📦 Producto: {product_name}")
        print(f"{'='*60}")

        search_query = query or product_name
        folder_name = self.sanitize_filename(product_name)
        product_dir = self.output_dir / folder_name
        product_dir.mkdir(exist_ok=True)

        # Scrape Google Images
        image_urls = self.scrape_google_images(search_query, max_images * 4)

        if not image_urls:
            print(f"\n  ❌ No se encontraron imágenes")
            return 0

        # Download images
        print(f"\n📥 Descargando a: {product_dir}")

        downloaded = 0
        attempts = 0

        for url in image_urls:
            if downloaded >= max_images:
                break
            if attempts >= len(image_urls):
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

        print(f"\n✅ Descargadas {downloaded}/{max_images} imágenes")
        return downloaded

    def scrape_products_from_file(self, filepath):
        """Scrape all products from config"""
        with open(filepath, 'r', encoding='utf-8') as f:
            config = json.load(f)

        products = config.get('products', [])

        if not self.init_driver():
            return 0

        total = 0

        print(f"\n{'='*60}")
        print(f"🌍 SELENIUM GOOGLE IMAGES SCRAPER")
        print(f"{'='*60}")
        print(f"Productos: {len(products)}")
        print(f"Output: {self.output_dir.absolute()}")
        print(f"Fuente: Google Images → TODO EL INTERNET")
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
                    print(f"\n⏳ Esperando 3 segundos antes del siguiente producto...")
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
            for domain, count in sorted_domains[:20]:
                print(f"   {domain:35s}: {count:2d} imágenes")

            if len(self.domains) > 20:
                print(f"   ... y {len(self.domains) - 20} sitios más")

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
║        🌍 SELENIUM GOOGLE IMAGES SCRAPER 🌍               ║
║                                                           ║
║  Usa un navegador REAL para scrapear Google Images       ║
║  Obtiene imágenes de MILES de sitios web!                ║
║                                                           ║
║  ✓ Bypasses anti-bot protections                         ║
║  ✓ Imágenes de todo el internet                          ║
║  ✓ Múltiples fuentes diferentes                          ║
╚═══════════════════════════════════════════════════════════╝
    """)

    config_file = Path("scraper-config.json")
    if not config_file.exists():
        print("❌ Archivo de configuración no encontrado!")
        print(f"📝 Crea '{config_file}' primero")
        return

    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    # Ask user preference
    print("\n🤔 ¿Cómo quieres ejecutar Chrome?")
    print("   1. Headless (invisible, recomendado)")
    print("   2. Visible (verás el navegador trabajando)")

    try:
        choice = input("\nOpción (1 o 2) [default: 1]: ").strip()
        headless = choice != '2'
    except:
        headless = True

    scraper = SeleniumGoogleScraper(headless=headless)
    scraper.scrape_products_from_file(config_file)


if __name__ == "__main__":
    main()
