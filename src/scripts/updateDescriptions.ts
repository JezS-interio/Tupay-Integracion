// src/scripts/updateDescriptions.ts
// Run this script ONCE to update product descriptions in Firestore

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';

const productDescriptions: { [key: string]: string } = {
  '1': 'Experience ultimate gaming precision with the Havit HV-G69 USB Gamepad. Featuring responsive controls, ergonomic design, and plug-and-play compatibility. Perfect for PC gaming with comfortable grip for extended gameplay sessions.',

  '2': 'The iPhone 14 Plus features a stunning 6.7-inch Super Retina XDR display, advanced dual-camera system, and all-day battery life. Powered by the A15 Bionic chip with 128GB storage. Capture incredible photos and enjoy smooth performance for all your daily tasks.',

  '3': 'The 24-inch iMac M1 delivers powerful performance in a sleek, colorful design. With the revolutionary M1 chip, 8GB RAM, and vibrant 4.5K Retina display. Perfect for creative professionals and productivity enthusiasts. Includes Magic Keyboard and Magic Mouse.',

  '4': 'Experience the power of Apple Silicon with the MacBook Air M1. Ultra-thin, lightweight design with 8-core CPU, 8-core GPU, and 256GB SSD storage. Enjoy up to 18 hours of battery life and a stunning Retina display. Ideal for students and professionals on the go.',

  '5': 'The Apple Watch Ultra is built for extreme adventures with rugged titanium case, precision dual-frequency GPS, and up to 36 hours of battery life. Features advanced health monitoring, water resistance to 100m, and customizable Action button. Your ultimate outdoor companion.',

  '6': 'The Logitech MX Master 3 is the ultimate wireless mouse for power users. Features ultra-fast scrolling, ergonomic design, and precise tracking on any surface. Connect up to 3 devices and switch seamlessly. Rechargeable battery lasts up to 70 days on a full charge.',

  '7': 'The iPad Air 5th Gen combines powerful performance with a portable design. Featuring the M1 chip, 10.9-inch Liquid Retina display, and 64GB storage. Compatible with Apple Pencil 2nd Gen and Magic Keyboard. Perfect for creativity, productivity, and entertainment.',

  '8': 'The ASUS RT Dual Band Router delivers fast, reliable WiFi throughout your home. Dual-band connectivity with speeds up to 1900 Mbps, advanced QoS for smooth gaming and streaming, and easy setup. Covers up to 3000 sq ft with stable connections for all your devices.',
};

export const updateProductDescriptions = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🚀 Starting description updates...');

    for (const [productId, description] of Object.entries(productDescriptions)) {
      const productRef = doc(db, 'products', productId);

      await updateDoc(productRef, {
        description: description,
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ Updated product ${productId}: ${description.substring(0, 50)}...`);
    }

    console.log('🎉 All descriptions updated successfully!');
    return {
      success: true,
      message: 'Successfully updated all product descriptions!',
    };
  } catch (error: any) {
    console.error('❌ Update failed:', error);
    return {
      success: false,
      message: `Update failed: ${error.message}`,
    };
  }
};
