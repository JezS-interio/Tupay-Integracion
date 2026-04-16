#!/usr/bin/env python3
"""
Prepare smartphone product data from local images
"""

import os
import shutil
import json
import hashlib
import re
from pathlib import Path

# Input/Output directories
INPUT_DIR = r"/mnt/c/Users/Napo/Downloads/drive-download-20260115T160824Z-3-001"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "phone_products")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def parse_phone_filename(filename):
    """Extract phone details from filename"""
    name_lower = filename.lower()
    base_name = os.path.splitext(filename)[0]

    # iPhone detection
    if 'iphone' in name_lower:
        brand = 'Apple'

        # Extract model
        if 'iphone-16' in name_lower:
            model = 'iPhone 16'
            base_price = 799
        elif 'iphone-15-pro' in name_lower:
            model = 'iPhone 15 Pro'
            base_price = 999
        elif 'iphone-15' in name_lower:
            model = 'iPhone 15'
            base_price = 799
        elif 'iphone-14-pro-max' in name_lower:
            model = 'iPhone 14 Pro Max'
            base_price = 1099
        elif 'iphone-11-pro' in name_lower:
            model = 'iPhone 11 Pro'
            base_price = 699
        elif 'iphone-11' in name_lower:
            model = 'iPhone 11'
            base_price = 599
        else:
            model = 'iPhone'
            base_price = 699

        # Extract color
        color_map = {
            'negro': 'Black',
            'negro-titanio': 'Titanium Black',
            'morado-profundo': 'Deep Purple',
            'rojo': 'Red',
            'product-red': 'Product RED',
            'plata': 'Silver',
            'azul-ultramar': 'Ultramarine Blue'
        }

        color = 'Black'
        for spanish, english in color_map.items():
            if spanish in name_lower:
                color = english
                break

        return {
            'brand': brand,
            'model': model,
            'color': color,
            'category': 'Smartphones',
            'type': 'Smartphone',
            'base_price': base_price
        }

    # Samsung detection
    elif 'samsung' in name_lower:
        brand = 'Samsung'

        if 's24-ultra' in name_lower:
            model = 'Galaxy S24 Ultra'
            base_price = 1199
        elif 's24' in name_lower:
            model = 'Galaxy S24'
            base_price = 799
        elif 'a-series' in name_lower or 'galaxy-a' in name_lower:
            model = 'Galaxy A54'
            base_price = 449
        else:
            model = 'Galaxy'
            base_price = 599

        # Extract color
        color = 'Black'
        if 'azul-titanio' in name_lower:
            color = 'Titanium Blue'
        elif 'negro' in name_lower:
            color = 'Black'

        return {
            'brand': brand,
            'model': model,
            'color': color,
            'category': 'Smartphones',
            'type': 'Smartphone',
            'base_price': base_price
        }

    # Google Pixel detection
    elif 'pixel' in name_lower:
        brand = 'Google'

        if 'pixel-7-pro' in name_lower:
            model = 'Pixel 7 Pro'
            base_price = 899
        elif 'pixel-7' in name_lower:
            model = 'Pixel 7'
            base_price = 599
        else:
            model = 'Pixel'
            base_price = 499

        # Extract color
        color = 'Black'
        if 'negro' in name_lower or 'obsidian' in name_lower:
            color = 'Obsidian'
        elif 'blanco' in name_lower or 'snow' in name_lower:
            color = 'Snow'

        return {
            'brand': brand,
            'model': model,
            'color': color,
            'category': 'Smartphones',
            'type': 'Smartphone',
            'base_price': base_price
        }

    # Fallback
    return {
        'brand': 'Generic',
        'model': 'Smartphone',
        'color': 'Black',
        'category': 'Smartphones',
        'type': 'Smartphone',
        'base_price': 499
    }

def generate_description(brand, model, color):
    """Generate product description for smartphones"""
    descriptions = {
        'Apple': f"The {brand} {model} in {color} delivers exceptional performance with cutting-edge technology. Features advanced camera systems, powerful processor, stunning display, and all-day battery life. Experience premium design and iOS ecosystem integration.",
        'Samsung': f"The {brand} {model} in {color} combines innovative technology with stunning design. Featuring a brilliant AMOLED display, versatile camera system, long-lasting battery, and the latest Android experience. Perfect for productivity and entertainment.",
        'Google': f"The {brand} {model} in {color} offers pure Android experience with Google's latest innovations. Features exceptional camera quality with computational photography, smooth performance, and guaranteed software updates. Designed by Google for the best of Google."
    }

    return descriptions.get(brand, f"Premium {brand} {model} smartphone in {color}. High-quality device with modern features.")

def generate_specs(phone_info):
    """Generate realistic specifications"""
    brand = phone_info['brand']
    model = phone_info['model']

    specs = {
        'Brand': brand,
        'Model': model,
        'Color': phone_info['color'],
        'Condition': 'Brand New',
        'Warranty': '1 Year Manufacturer Warranty'
    }

    # Add brand-specific specs
    if brand == 'Apple':
        if 'Pro' in model:
            specs['Display'] = '6.1" Super Retina XDR'
            specs['Storage'] = '256GB'
            specs['Chip'] = 'A16 Bionic'
            specs['Camera'] = 'Triple 48MP Camera System'
        else:
            specs['Display'] = '6.1" Super Retina XDR'
            specs['Storage'] = '128GB'
            specs['Chip'] = 'A15 Bionic'
            specs['Camera'] = 'Dual Camera System'

    elif brand == 'Samsung':
        if 'Ultra' in model:
            specs['Display'] = '6.8" Dynamic AMOLED 2X'
            specs['Storage'] = '256GB'
            specs['Processor'] = 'Snapdragon 8 Gen 3'
            specs['Camera'] = 'Quad Camera with 200MP'
        elif 'A' in model:
            specs['Display'] = '6.4" Super AMOLED'
            specs['Storage'] = '128GB'
            specs['Processor'] = 'Exynos 1380'
            specs['Camera'] = 'Triple Camera 50MP'
        else:
            specs['Display'] = '6.2" Dynamic AMOLED'
            specs['Storage'] = '128GB'
            specs['Processor'] = 'Snapdragon 8 Gen 2'
            specs['Camera'] = 'Triple Camera 50MP'

    elif brand == 'Google':
        specs['Display'] = '6.3" OLED'
        specs['Storage'] = '128GB'
        specs['Processor'] = 'Google Tensor G2'
        specs['Camera'] = 'Dual Camera with AI'

    return specs

def main():
    print("📱 Smartphone Product Preparer\n")
    print("=" * 60)

    # Check input directory
    if not os.path.exists(INPUT_DIR):
        print(f"❌ Error: Input directory not found: {INPUT_DIR}")
        return

    # Get all image files
    image_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    files = [f for f in os.listdir(INPUT_DIR)
             if os.path.splitext(f)[1].lower() in image_extensions]

    print(f"📋 Found {len(files)} smartphone images\n")

    products_data = []

    for idx, filename in enumerate(files, 1):
        print(f"[{idx}/{len(files)}] Processing: {filename}")

        # Parse phone details from filename
        phone_info = parse_phone_filename(filename)

        # Generate product name
        product_name = f"{phone_info['brand']} {phone_info['model']} - {phone_info['color']}"

        # Generate pricing with some variation
        import random
        base_price = phone_info['base_price']
        # Smartphones typically have smaller discounts (5-15%)
        discount = random.randint(5, 15)
        discounted_price = round(base_price * (1 - discount / 100))

        # Create slug
        slug = product_name.lower().replace(' ', '-').replace('--', '-')
        slug = re.sub(r'[^a-z0-9-]', '', slug)

        # Create new filename (keep original extension)
        extension = os.path.splitext(filename)[1]
        new_filename = f"{slug}{extension}"

        # Copy image to output directory
        src_path = os.path.join(INPUT_DIR, filename)
        dst_path = os.path.join(OUTPUT_DIR, new_filename)
        shutil.copy2(src_path, dst_path)

        # Generate description
        description = generate_description(
            phone_info['brand'],
            phone_info['model'],
            phone_info['color']
        )

        # Generate specifications
        specifications = generate_specs(phone_info)

        # Create product data
        product_data = {
            'id': 2000 + idx,  # Start from 2000 to avoid conflicts
            'name': product_name,
            'slug': slug,
            'category': phone_info['category'],
            'type': phone_info['type'],
            'brand': phone_info['brand'],
            'model': phone_info['model'],
            'price': base_price,
            'discountedPrice': discounted_price,
            'discount': discount,
            'description': description,
            'image_file': new_filename,
            'original_file': filename,
            'stock': random.randint(5, 30),
            'rating': round(random.uniform(4.0, 5.0), 1),
            'reviews': random.randint(100, 1000),
            'featured': random.choice([True, False, False]),  # 33% chance
            'isActive': True,
            'specifications': specifications
        }

        products_data.append(product_data)
        print(f"  📱 {product_name}")
        print(f"  💰 ${discounted_price} (was ${base_price} - {discount}% off)")
        print()

    # Save products data to JSON
    json_path = os.path.join(OUTPUT_DIR, 'products_data.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(products_data, f, indent=2, ensure_ascii=False)

    print("=" * 60)
    print(f"🎉 COMPLETE!")
    print(f"✅ Prepared: {len(products_data)} smartphone products")
    print(f"📁 Images copied to: {OUTPUT_DIR}")
    print(f"📄 Product data: {json_path}")
    print()
    print("📌 Next steps:")
    print("1. Review the images in the output folder")
    print("2. Run: node scripts/upload-phone-products-to-r2.js")
    print("3. Go to: http://localhost:3000/admin/import-phone-products")

if __name__ == "__main__":
    main()
