// Simple script to download product images from Unsplash
// Run: node download-product-images.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create images directory
const imagesDir = path.join(__dirname, 'product-images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Image mappings with Unsplash photo IDs (free to use)
const images = [
  { filename: 'iphone-15-pro-1.jpg', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80' },
  { filename: 'iphone-15-pro-2.jpg', url: 'https://images.unsplash.com/photo-1696446702832-2630f6ced6df?w=800&q=80' },
  { filename: 'samsung-s24-ultra-1.jpg', url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80' },
  { filename: 'samsung-s24-ultra-2.jpg', url: 'https://images.unsplash.com/photo-1583573607873-4eb6e86c8c7e?w=800&q=80' },
  { filename: 'pixel-8-pro-1.jpg', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80' },
  { filename: 'pixel-8-pro-2.jpg', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80' },
  { filename: 'macbook-air-m3-1.jpg', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80' },
  { filename: 'macbook-air-m3-2.jpg', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80' },
  { filename: 'dell-xps-13-1.jpg', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80' },
  { filename: 'dell-xps-13-2.jpg', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80' },
  { filename: 'surface-laptop-5-1.jpg', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80' },
  { filename: 'surface-laptop-5-2.jpg', url: 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&q=80' },
  { filename: 'sony-wh1000xm5-1.jpg', url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80' },
  { filename: 'sony-wh1000xm5-2.jpg', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80' },
  { filename: 'airpods-pro-2-1.jpg', url: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&q=80' },
  { filename: 'airpods-pro-2-2.jpg', url: 'https://images.unsplash.com/photo-1607236783146-1a815d8a02e5?w=800&q=80' },
  { filename: 'apple-watch-9-1.jpg', url: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80' },
  { filename: 'apple-watch-9-2.jpg', url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80' },
  { filename: 'galaxy-watch-6-1.jpg', url: 'https://images.unsplash.com/photo-1579721840641-7d0e67f1204e?w=800&q=80' },
  { filename: 'galaxy-watch-6-2.jpg', url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80' },
  { filename: 'ipad-pro-11-1.jpg', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80' },
  { filename: 'ipad-pro-11-2.jpg', url: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=80' },
  { filename: 'galaxy-tab-s9-1.jpg', url: 'https://images.unsplash.com/photo-1585789575657-f63f7c0e3c2f?w=800&q=80' },
  { filename: 'galaxy-tab-s9-2.jpg', url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80' },
  { filename: 'logitech-mx-master-3s-1.jpg', url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80' },
  { filename: 'logitech-mx-master-3s-2.jpg', url: 'https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=800&q=80' },
  { filename: 'anker-powercore-1.jpg', url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80' },
  { filename: 'anker-powercore-2.jpg', url: 'https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=800&q=80' },
  { filename: 'lg-27-4k-monitor-1.jpg', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80' },
  { filename: 'lg-27-4k-monitor-2.jpg', url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80' },
  { filename: 'bose-qc-earbuds-2-1.jpg', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80' },
  { filename: 'bose-qc-earbuds-2-2.jpg', url: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&q=80' },
  { filename: 'kindle-paperwhite-1.jpg', url: 'https://images.unsplash.com/photo-1592500595497-d1f7bad9c915?w=800&q=80' },
  { filename: 'kindle-paperwhite-2.jpg', url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80' },
  { filename: 'gopro-hero12-1.jpg', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80' },
  { filename: 'gopro-hero12-2.jpg', url: 'https://images.unsplash.com/photo-1610056494071-cda5579a2d66?w=800&q=80' }
];

console.log('📥 Downloading product images from Unsplash...\n');

let completed = 0;

images.forEach(({ filename, url }) => {
  const filePath = path.join(imagesDir, filename);
  const file = fs.createWriteStream(filePath);

  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      completed++;
      console.log(`✓ Downloaded: ${filename} (${completed}/${images.length})`);

      if (completed === images.length) {
        console.log(`\n✅ All ${images.length} images downloaded to: ${imagesDir}`);
        console.log('\n📋 Next steps:');
        console.log('1. Go to http://localhost:3000/admin/import');
        console.log('2. Drag "products-import.json" into the drop zone');
        console.log('3. Drag all images from "product-images" folder into the drop zone');
        console.log('4. Click the import button');
        console.log('5. Everything will upload to Firebase! 🚀');
      }
    });
  }).on('error', (err) => {
    fs.unlink(filePath, () => {});
    console.error(`✗ Failed to download ${filename}:`, err.message);
  });
});
