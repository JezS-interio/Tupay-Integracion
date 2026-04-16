#!/usr/bin/env python3
import json
import urllib.request

# Products to fix based on analysis
fixes = [
    {
        "docId": "6d3UNHl1na01wXyynvde",
        "id": 1768495853529,
        "current_title": "Cuisinart Automatic Bread Maker",
        "new_title": "Cuisinart Electric Mixer Pro",
        "reason": "Title doesn't match image (shows Electric Mixer, not Bread Maker)"
    }
]

print("Product Title Fixes")
print("="*80)

for fix in fixes:
    print(f"\nID {fix['id']}")
    print(f"  Current: {fix['current_title']}")
    print(f"  New:     {fix['new_title']}")
    print(f"  Reason:  {fix['reason']}")

    # Prepare the update
    updates = {"title": fix['new_title']}

    # Make POST request to update
    data = json.dumps({
        "docId": fix['docId'],
        "updates": updates
    }).encode('utf-8')

    req = urllib.request.Request(
        'http://localhost:3000/api/verify-products',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read())
            if result.get('success'):
                print(f"  ✅ FIXED")
            else:
                print(f"  ❌ FAILED: {result.get('error')}")
    except Exception as e:
        print(f"  ❌ ERROR: {str(e)}")

print("\n" + "="*80)
print("Fix complete!")
