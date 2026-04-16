"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, query, where, getDocs, updateDoc, serverTimestamp } from "firebase/firestore";

interface ProductData {
  id: number;
  title: string;
  slug: string;
  price: number;
  discountedPrice: number;
  description: string;
  category: string;
  imgs: {
    previews: string[];
  };
  stock: number;
  rating: number;
  reviews: number;
  featured: boolean;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export default function AddScrapedImagesPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ created: 0, updated: 0, failed: 0 });

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  const getCategory = (productName: string): string => {
    const lower = productName.toLowerCase();

    // Smartphones
    if (lower.includes("iphone") || lower.includes("galaxy s") || lower.includes("pixel") || lower.includes("oneplus")) {
      return "Smartphones";
    }

    // Computers (Laptops)
    if (lower.includes("macbook") || lower.includes("laptop") || lower.includes("xps") || lower.includes("thinkpad") ||
        lower.includes("spectre") || lower.includes("zephyrus") || lower.includes("blade") || lower.includes("rog")) {
      return "Computers";
    }

    // Tablets
    if (lower.includes("ipad") || lower.includes("galaxy tab") || lower.includes("surface pro")) {
      return "Tablets";
    }

    // Wearables (Watches & Fitness)
    if (lower.includes("watch") || lower.includes("fitbit") || lower.includes("garmin")) {
      return "Wearables";
    }

    // Accessories (Peripherals, Storage, Cables)
    if (lower.includes("mouse") || lower.includes("keyboard") || lower.includes("mx master") ||
        lower.includes("powercore") || lower.includes("charger") || lower.includes("ssd") ||
        lower.includes("sandisk") || lower.includes("hard drive") || lower.includes("backup plus") ||
        lower.includes("my passport") || lower.includes("webcam") || lower.includes("monitor") ||
        lower.includes("keychron") || lower.includes("deathadder") || lower.includes("corsair") ||
        lower.includes("steelseries") || lower.includes("logitech g") || lower.includes("razer viper") ||
        lower.includes("glorious model")) {
      return "Accessories";
    }

    // Electronics (Everything else - TVs, Cameras, Gaming, Audio, Home Appliances, Personal Care)
    // Audio
    if (lower.includes("airpods") || lower.includes("headphones") || lower.includes("buds") ||
        lower.includes("wh-") || lower.includes("quietcomfort") || lower.includes("sonos")) {
      return "Electronics";
    }

    // Cameras & Drones
    if (lower.includes("camera") || lower.includes("eos") || lower.includes("nikon") ||
        lower.includes("sony a7") || lower.includes("gopro") || lower.includes("drone") || lower.includes("dji")) {
      return "Electronics";
    }

    // Gaming
    if (lower.includes("switch") || lower.includes("playstation") || lower.includes("xbox") ||
        lower.includes("steam deck")) {
      return "Electronics";
    }

    // TVs & Smart Home
    if (lower.includes("tv") || lower.includes("soundbar") || lower.includes("echo") ||
        lower.includes("nest") || lower.includes("ring") || lower.includes("hue")) {
      return "Electronics";
    }

    // Kitchen Appliances
    if (lower.includes("air fryer") || lower.includes("microwave") || lower.includes("blender") ||
        lower.includes("coffee") || lower.includes("keurig") || lower.includes("nespresso") ||
        lower.includes("toaster") || lower.includes("food processor") || lower.includes("vitamix") ||
        lower.includes("ninja") && (lower.includes("blender") || lower.includes("fryer") || lower.includes("foodi"))) {
      return "Electronics";
    }

    // Vacuum & Cleaning
    if (lower.includes("vacuum") || lower.includes("roomba") || lower.includes("roborock") ||
        lower.includes("dyson") && lower.includes("v1") || lower.includes("shark") ||
        lower.includes("bissell") || lower.includes("hoover")) {
      return "Electronics";
    }

    // Air Quality & Climate
    if (lower.includes("air purifier") || lower.includes("fan") || lower.includes("heater") ||
        lower.includes("humidifier") || lower.includes("dehumidifier") || lower.includes("levoit") ||
        lower.includes("vornado") || lower.includes("lasko") || lower.includes("honeywell") &&
        (lower.includes("fan") || lower.includes("heater") || lower.includes("purifier"))) {
      return "Electronics";
    }

    // Personal Care
    if (lower.includes("hair dryer") || lower.includes("shaver") || lower.includes("razor") ||
        lower.includes("trimmer") || lower.includes("toothbrush") || lower.includes("straightener") ||
        lower.includes("sonicare") || lower.includes("oral-b") || lower.includes("braun") ||
        lower.includes("philips norelco") || lower.includes("remington") || lower.includes("conair")) {
      return "Electronics";
    }

    // Printers
    if (lower.includes("printer") || lower.includes("officejet") || lower.includes("pixma") ||
        lower.includes("ecotank") || lower.includes("laserjet")) {
      return "Electronics";
    }

    return "Electronics";
  };

  const generatePrice = (productName: string, category: string): number => {
    const lower = productName.toLowerCase();

    // Premium products
    if (lower.includes("pro max") || lower.includes("ultra") || lower.includes("mark ii")) {
      return Math.floor(Math.random() * 300) + 700;
    }
    if (lower.includes("pro") || lower.includes("m3") || lower.includes("m2")) {
      return Math.floor(Math.random() * 200) + 600;
    }

    // High-end appliances
    if (lower.includes("dyson") || lower.includes("vitamix") || lower.includes("breville")) {
      return Math.floor(Math.random() * 200) + 300;
    }

    // By category
    if (category === "Smartphones") return Math.floor(Math.random() * 300) + 500;
    if (category === "Computers") return Math.floor(Math.random() * 300) + 600;
    if (category === "Tablets") return Math.floor(Math.random() * 300) + 400;
    if (category === "Wearables") return Math.floor(Math.random() * 200) + 250;

    // Electronics by type
    // Cameras & Drones
    if (lower.includes("camera") || lower.includes("drone") || lower.includes("gopro")) {
      return Math.floor(Math.random() * 400) + 400;
    }

    // Gaming Consoles
    if (lower.includes("playstation") || lower.includes("xbox") || lower.includes("switch") || lower.includes("steam deck")) {
      return Math.floor(Math.random() * 200) + 300;
    }

    // TVs & Monitors
    if (lower.includes("tv") || lower.includes("monitor")) {
      return Math.floor(Math.random() * 400) + 400;
    }

    // Audio
    if (lower.includes("headphones") || lower.includes("airpods") || lower.includes("buds") || lower.includes("soundbar")) {
      return Math.floor(Math.random() * 200) + 150;
    }

    // Kitchen Appliances
    if (lower.includes("air fryer") || lower.includes("microwave") || lower.includes("coffee") || lower.includes("blender")) {
      return Math.floor(Math.random() * 150) + 80;
    }

    // Vacuum Cleaners
    if (lower.includes("vacuum") || lower.includes("roomba")) {
      return Math.floor(Math.random() * 250) + 150;
    }

    // Fans, Heaters, Air Purifiers
    if (lower.includes("fan") || lower.includes("heater") || lower.includes("air purifier") || lower.includes("humidifier")) {
      return Math.floor(Math.random() * 150) + 80;
    }

    // Personal Care
    if (lower.includes("hair dryer") || lower.includes("shaver") || lower.includes("toothbrush") || lower.includes("trimmer")) {
      return Math.floor(Math.random() * 150) + 50;
    }

    // Printers & Office
    if (lower.includes("printer")) {
      return Math.floor(Math.random() * 200) + 150;
    }

    // Default Electronics
    return Math.floor(Math.random() * 200) + 100;
  };

  const generateDescription = (productName: string, category: string): string => {
    return `${productName} - High-quality ${category.toLowerCase()} with cutting-edge technology and premium design. Experience superior performance and reliability.`;
  };

  const addProductToFirestore = async (productName: string, imageUrls: string[]): Promise<string> => {
    try {
      const category = getCategory(productName);
      const price = generatePrice(productName, category);
      const discountedPrice = Math.floor(price * 0.85);

      const slug = productName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      // Check if product exists
      const q = query(collection(db, "products"), where("title", "==", productName));
      const querySnapshot = await getDocs(q);

      const productData: ProductData = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        title: productName,
        slug: slug,
        price: price,
        discountedPrice: discountedPrice,
        description: generateDescription(productName, category),
        category: category,
        imgs: {
          previews: imageUrls,
        },
        stock: Math.floor(Math.random() * 50) + 10,
        rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 500) + 50,
        featured: Math.random() > 0.7,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (!querySnapshot.empty) {
        // Update existing
        const doc = querySnapshot.docs[0];
        const existingData = doc.data();
        await updateDoc(doc.ref, {
          id: existingData.id || Date.now() + Math.floor(Math.random() * 1000),
          imgs: {
            previews: imageUrls,
          },
          category: category,
          rating: typeof existingData.rating === 'string' ? parseFloat(existingData.rating) : existingData.rating,
          isActive: true,
          updatedAt: serverTimestamp(),
        });
        return `updated:${doc.id}`;
      } else {
        // Create new
        const docRef = await addDoc(collection(db, "products"), productData);
        return `created:${docRef.id}`;
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setLogs([]);
    setStats({ created: 0, updated: 0, failed: 0 });

    addLog("🔥 Starting import...");
    addLog("📥 Loading image mapping...");

    try {
      // Load the mapping file
      const response = await fetch("/r2-image-mapping.json");
      const imageMapping: Record<string, string[]> = await response.json();

      const products = Object.entries(imageMapping);
      addLog(`📦 Found ${products.length} products with images\n`);

      let created = 0;
      let updated = 0;
      let failed = 0;

      for (let i = 0; i < products.length; i++) {
        const [productName, imageUrls] = products[i];

        addLog(`[${i + 1}/${products.length}] Processing: ${productName}`);
        addLog(`   Images: ${imageUrls.length}`);

        try {
          const result = await addProductToFirestore(productName, imageUrls);

          if (result.startsWith("created")) {
            const id = result.split(":")[1];
            addLog(`   ✅ Created new product (ID: ${id})`);
            created++;
          } else if (result.startsWith("updated")) {
            const id = result.split(":")[1];
            addLog(`   ✅ Updated existing product (ID: ${id})`);
            updated++;
          }

          setStats({ created, updated, failed });

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (error: any) {
          addLog(`   ❌ Failed: ${error.message}`);
          failed++;
          setStats({ created, updated, failed });
        }
      }

      addLog("\n" + "=".repeat(60));
      addLog("🎉 COMPLETE!");
      addLog("=".repeat(60));
      addLog(`✅ Created: ${created} products`);
      addLog(`✅ Updated: ${updated} products`);
      if (failed > 0) {
        addLog(`❌ Failed: ${failed} products`);
      }
      addLog(`📊 Total: ${created + updated} products in database`);
      addLog("=".repeat(60));
      addLog("\n🌐 All products now have R2 image URLs!");
      addLog("🔍 Check your Firestore console to verify");
    } catch (error: any) {
      addLog(`\n❌ Fatal error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Add Scraped Images to Products</h1>
        <p className="text-gray-600 mb-6">
          Import all 162 scraped images from R2 and create/update products in Firestore
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What this does:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Reads r2-image-mapping.json with 162 images</li>
            <li>• Creates 64 new products (or updates existing ones)</li>
            <li>• Sets reasonable prices based on product category</li>
            <li>• Assigns categories automatically</li>
            <li>• Links all R2 image URLs to each product</li>
          </ul>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.created}</div>
            <div className="text-sm text-gray-600">Created</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.updated}</div>
            <div className="text-sm text-gray-600">Updated</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleImport}
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          }`}
        >
          {loading ? "Importing... Please wait" : "Start Import"}
        </button>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Import Log:</h3>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
