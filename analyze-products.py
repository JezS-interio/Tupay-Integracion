#!/usr/bin/env python3
import json
import re
import urllib.request

# Fetch products from API
with urllib.request.urlopen('http://localhost:3000/api/verify-products') as response:
    data = json.loads(response.read())
    products = data['products']

print(f"Total products: {len(products)}\n")
print("="*80)
print("TITLE VS FILENAME ANALYSIS")
print("="*80)

issues = []
correct = []

for p in products:
    title = p['title']
    image_url = p['imageUrl']

    # Extract filename from URL
    filename = image_url.split('/')[-1]
    # Remove file extension and source suffix
    clean_filename = re.sub(r'_\d+_[^_]+_[a-z0-9]+\.(jpg|png|webp)$', '', filename)
    # Replace underscores with spaces
    clean_filename = clean_filename.replace('_', ' ')

    # Extract product folder name (more accurate than filename)
    if '/products/' in image_url:
        folder = image_url.split('/products/')[1].split('/')[0]
        folder_name = folder.replace('-', ' ').title()
    else:
        folder_name = ""

    # Check for obvious mismatches
    title_normalized = title.lower().replace('-', ' ').strip()
    filename_normalized = clean_filename.lower().strip()
    folder_normalized = folder_name.lower().strip()

    # Check if title is significantly shorter than what's in the filename/folder
    if folder_normalized and title_normalized != folder_normalized:
        if not all(word in folder_normalized for word in title_normalized.split()):
            issues.append({
                'id': p['id'],
                'docId': p['docId'],
                'title': title,
                'folder': folder_name,
                'filename': clean_filename,
                'category': p.get('category', 'N/A')
            })
    else:
        correct.append(title)

print(f"\n🔴 FOUND {len(issues)} POTENTIAL ISSUES:\n")
for i, item in enumerate(issues, 1):
    print(f"{i}. ID {item['id']}")
    print(f"   Current Title: {item['title']}")
    print(f"   Folder Name: {item['folder']}")
    print(f"   Filename: {item['filename']}")
    print(f"   Category: {item['category']}")
    print()

print(f"\n✅ {len(correct)} products appear to have correct titles\n")

# Save issues to JSON for easy updating
with open('/mnt/c/Users/Napo/Desktop/front/intitech-main/products-to-fix.json', 'w') as f:
    json.dump(issues, f, indent=2)

print("Saved issues to: products-to-fix.json")
