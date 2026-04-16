#!/usr/bin/env python3
"""
Download product images from URLs and prepare product data
"""

import os
import requests
import hashlib
import json
from urllib.parse import urlparse
from pathlib import Path

# Read URLs from input file
INPUT_FILE = r"C:\Users\Napo\Desktop\New Text Document.txt"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "new_products")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def analyze_url_for_product(url):
    """Detect product type from URL and image analysis"""
    url_lower = url.lower()

    # Kitchen Appliances
    if 'blender' in url_lower:
        return {
            'type': 'Blender',
            'category': 'Kitchen Appliances',
            'brands': ['Oster', 'Ninja', 'Vitamix', 'Hamilton Beach', 'KitchenAid'],
            'price_range': (40, 120)
        }
    elif 'kettle' in url_lower:
        return {
            'type': 'Electric Kettle',
            'category': 'Kitchen Appliances',
            'brands': ['Cuisinart', 'Mueller', 'Cosori', 'Hamilton Beach', 'Chefman'],
            'price_range': (25, 70)
        }
    elif 'mixer' in url_lower:
        return {
            'type': 'Electric Mixer',
            'category': 'Kitchen Appliances',
            'brands': ['KitchenAid', 'Cuisinart', 'Hamilton Beach', 'Oster', 'Sunbeam'],
            'price_range': (30, 90)
        }
    elif 'coffee' in url_lower or 'machine' in url_lower:
        return {
            'type': 'Coffee Maker',
            'category': 'Kitchen Appliances',
            'brands': ['Keurig', 'Nespresso', 'Mr. Coffee', 'Cuisinart', 'Breville'],
            'price_range': (50, 200)
        }
    elif 'toaster' in url_lower or 'bread' in url_lower:
        return {
            'type': 'Toaster',
            'category': 'Kitchen Appliances',
            'brands': ['Cuisinart', 'Breville', 'KitchenAid', 'Black+Decker', 'Hamilton Beach'],
            'price_range': (25, 80)
        }

    # Home Appliances
    elif 'iron' in url_lower:
        return {
            'type': 'Steam Iron',
            'category': 'Home Appliances',
            'brands': ['Rowenta', 'Black+Decker', 'Sunbeam', 'Hamilton Beach', 'Shark'],
            'price_range': (20, 60)
        }
    elif 'fan' in url_lower or 'ventilator' in url_lower:
        return {
            'type': 'Electric Fan',
            'category': 'Home Appliances',
            'brands': ['Lasko', 'Honeywell', 'Vornado', 'Dyson', 'Rowenta'],
            'price_range': (30, 150)
        }
    elif 'dryer' in url_lower or 'hair' in url_lower:
        return {
            'type': 'Hair Dryer',
            'category': 'Personal Care',
            'brands': ['Conair', 'Revlon', 'BaByliss', 'Remington', 'Dyson'],
            'price_range': (25, 400)
        }
    elif 'lamp' in url_lower:
        return {
            'type': 'Table Lamp',
            'category': 'Home & Living',
            'brands': ['TaoTronics', 'BenQ', 'Philips', 'Anker', 'Brightech'],
            'price_range': (20, 100)
        }

    # Default fallback
    return {
        'type': 'Kitchen Appliance',
        'category': 'Kitchen Appliances',
        'brands': ['Generic', 'Premium', 'Elite'],
        'price_range': (30, 100)
    }

def generate_description(product_info, brand, model):
    """Generate product description based on type"""
    type_descriptions = {
        'Blender': f"The {brand} {model} is a powerful and versatile blender perfect for smoothies, soups, and more. Features multiple speed settings and a durable stainless steel blade for consistent blending results.",
        'Electric Kettle': f"Heat water quickly and efficiently with the {brand} {model}. This electric kettle features automatic shut-off, boil-dry protection, and a sleek modern design that complements any kitchen.",
        'Electric Mixer': f"The {brand} {model} electric mixer makes baking easier than ever. With multiple speed options and various attachments, it's perfect for mixing dough, beating eggs, and whipping cream.",
        'Coffee Maker': f"Start your morning right with the {brand} {model} coffee maker. Brews delicious coffee with programmable features and a thermal carafe to keep your coffee hot for hours.",
        'Toaster': f"Enjoy perfectly toasted bread every time with the {brand} {model}. Features adjustable browning controls, wide slots for different bread types, and a convenient crumb tray for easy cleaning.",
        'Steam Iron': f"The {brand} {model} steam iron delivers professional wrinkle removal with powerful steam output. Features a non-stick soleplate, adjustable temperature settings, and anti-drip technology.",
        'Electric Fan': f"Stay cool and comfortable with the {brand} {model} electric fan. Offers multiple speed settings, oscillating functionality, and whisper-quiet operation for home or office use.",
        'Hair Dryer': f"Achieve salon-quality results at home with the {brand} {model} hair dryer. Features ionic technology to reduce frizz, multiple heat settings, and a cool shot button for setting styles.",
        'Table Lamp': f"Illuminate your space with the {brand} {model} table lamp. Energy-efficient LED technology provides adjustable brightness levels and a modern design that enhances any room.",
        'Kitchen Appliance': f"The {brand} {model} is a high-quality kitchen appliance designed to make food preparation easier and more efficient. Built with durability and performance in mind."
    }

    return type_descriptions.get(product_info['type'], type_descriptions['Kitchen Appliance'])

def download_image(url, output_path):
    """Download image from URL"""
    try:
        print(f"  📥 Downloading from {url[:60]}...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        with open(output_path, 'wb') as f:
            f.write(response.content)

        file_size = len(response.content) / 1024  # KB
        print(f"  ✅ Downloaded ({file_size:.1f}KB)")
        return True
    except Exception as e:
        print(f"  ❌ Failed: {e}")
        return False

def main():
    print("🔧 Product Image Downloader & Data Preparer\n")
    print("=" * 60)

    # Read URLs from file
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Error: Input file not found: {INPUT_FILE}")
        return

    with open(INPUT_FILE, 'r') as f:
        urls = [line.strip() for line in f if line.strip()]

    print(f"📋 Found {len(urls)} URLs to process\n")

    products_data = []

    for idx, url in enumerate(urls, 1):
        print(f"[{idx}/{len(urls)}] Processing...")

        # Analyze URL to determine product type
        product_info = analyze_url_for_product(url)

        # Generate product details
        import random
        brand = random.choice(product_info['brands'])
        model_suffix = random.choice(['Pro', 'Plus', 'Elite', 'Premium', 'Deluxe', 'Classic'])
        model_number = f"{random.randint(100, 999)}{random.choice(['X', 'S', 'H', 'Pro', ''])}"

        product_name = f"{brand} {product_info['type']} {model_suffix}"

        # Generate pricing
        min_price, max_price = product_info['price_range']
        base_price = random.randint(min_price, max_price)
        discount = random.randint(5, 25)
        discounted_price = round(base_price * (1 - discount / 100))

        # Create filename
        slug = product_name.lower().replace(' ', '-').replace('+', 'plus')
        url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
        extension = '.jpg'  # Default to jpg
        filename = f"{slug}_{url_hash}{extension}"
        output_path = os.path.join(OUTPUT_DIR, filename)

        # Download image
        success = download_image(url, output_path)

        if success:
            # Create product data
            description = generate_description(product_info, brand, f"{model_suffix} {model_number}")

            product_data = {
                'name': product_name,
                'slug': slug,
                'category': product_info['category'],
                'type': product_info['type'],
                'brand': brand,
                'model': f"{model_suffix} {model_number}",
                'price': base_price,
                'discountedPrice': discounted_price,
                'discount': discount,
                'description': description,
                'image_file': filename,
                'image_url': url,
                'stock': random.randint(10, 50),
                'rating': round(random.uniform(3.5, 5.0), 1),
                'reviews': random.randint(50, 500),
                'featured': random.choice([True, False, False, False]),  # 25% chance
                'isActive': True,
                'specifications': {
                    'Brand': brand,
                    'Model': f"{model_suffix} {model_number}",
                    'Power': f"{random.choice([800, 1000, 1200, 1500])}W",
                    'Warranty': f"{random.choice([1, 2, 3])} Year Limited Warranty",
                    'Color': random.choice(['Black', 'White', 'Stainless Steel', 'Silver', 'Red'])
                }
            }

            products_data.append(product_data)
            print(f"  📦 {product_name}")
            print(f"  💰 ${discounted_price} (was ${base_price} - {discount}% off)")
            print()
        else:
            print()

    # Save products data to JSON
    json_path = os.path.join(OUTPUT_DIR, 'products_data.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(products_data, f, indent=2, ensure_ascii=False)

    print("=" * 60)
    print(f"🎉 COMPLETE!")
    print(f"✅ Downloaded: {len(products_data)}/{len(urls)} images")
    print(f"📁 Images saved to: {OUTPUT_DIR}")
    print(f"📄 Product data: {json_path}")
    print()
    print("📌 Next steps:")
    print("1. Review the images in the output folder")
    print("2. Upload images to Cloudflare R2 using upload-to-r2.js")
    print("3. Use the products_data.json to import to Firestore")

if __name__ == "__main__":
    main()
