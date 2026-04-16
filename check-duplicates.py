#!/usr/bin/env python3
import json

with open('/tmp/products-new.json') as f:
    data = json.load(f)
products = data['products']

mr_coffee = [p for p in products if 'Mr. Coffee Coffee Maker Pro' in p['title']]

print('Mr. Coffee Duplicate Analysis:')
print('='*80)
for i, p in enumerate(mr_coffee, 1):
    print(f'\nProduct {i}:')
    print(f"  ID: {p['id']}")
    print(f"  DocID: {p['docId']}")
    print(f"  Price: ${p['price']}")
    print(f"  Discounted: ${p['discountedPrice']}")
    print(f"  Full Image URL: {p['imageUrl']}")

if len(mr_coffee) == 2:
    if mr_coffee[0]['imageUrl'] == mr_coffee[1]['imageUrl']:
        print('\n⚠️  SAME IMAGE URL - These are duplicate products, one should be deleted')
        print(f"\nRecommendation: Delete product with DocID: {mr_coffee[1]['docId']}")
    else:
        print('\n✓ Different image URLs - These might be different products')
