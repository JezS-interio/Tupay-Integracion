"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

interface ProductData {
  name: string;
  category: string;
  type: string;
  brand: string;
  description: string;
  price: number;
  discountedPrice: number;
  stock: number;
  rating: number;
  reviews: number;
  featured: boolean;
  specifications: Record<string, string>;
}

export default function AddAppliancesPage() {
  const [urls, setUrls] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
    console.log(message);
  };

  const analyzeUrlForProduct = (url: string) => {
    const urlLower = url.toLowerCase();

    // Kitchen Appliances
    if (urlLower.includes("blender")) {
      return {
        type: "Blender",
        category: "Kitchen Appliances",
        brands: ["Oster", "Ninja", "Vitamix", "Hamilton Beach", "KitchenAid"],
        priceRange: [40, 120],
      };
    } else if (urlLower.includes("kettle")) {
      return {
        type: "Electric Kettle",
        category: "Kitchen Appliances",
        brands: ["Cuisinart", "Mueller", "Cosori", "Hamilton Beach", "Chefman"],
        priceRange: [25, 70],
      };
    } else if (urlLower.includes("mixer")) {
      return {
        type: "Electric Mixer",
        category: "Kitchen Appliances",
        brands: ["KitchenAid", "Cuisinart", "Hamilton Beach", "Oster", "Sunbeam"],
        priceRange: [30, 90],
      };
    } else if (urlLower.includes("coffee") || urlLower.includes("machine")) {
      return {
        type: "Coffee Maker",
        category: "Kitchen Appliances",
        brands: ["Keurig", "Nespresso", "Mr. Coffee", "Cuisinart", "Breville"],
        priceRange: [50, 200],
      };
    } else if (urlLower.includes("toaster") || urlLower.includes("bread")) {
      return {
        type: "Toaster",
        category: "Kitchen Appliances",
        brands: ["Cuisinart", "Breville", "KitchenAid", "Black+Decker", "Hamilton Beach"],
        priceRange: [25, 80],
      };
    } else if (urlLower.includes("iron")) {
      return {
        type: "Steam Iron",
        category: "Home Appliances",
        brands: ["Rowenta", "Black+Decker", "Sunbeam", "Hamilton Beach", "Shark"],
        priceRange: [20, 60],
      };
    } else if (urlLower.includes("fan") || urlLower.includes("ventilator")) {
      return {
        type: "Electric Fan",
        category: "Home Appliances",
        brands: ["Lasko", "Honeywell", "Vornado", "Dyson", "Rowenta"],
        priceRange: [30, 150],
      };
    } else if (urlLower.includes("dryer") || urlLower.includes("hair")) {
      return {
        type: "Hair Dryer",
        category: "Personal Care",
        brands: ["Conair", "Revlon", "BaByliss", "Remington", "Dyson"],
        priceRange: [25, 400],
      };
    } else if (urlLower.includes("lamp")) {
      return {
        type: "Table Lamp",
        category: "Home & Living",
        brands: ["TaoTronics", "BenQ", "Philips", "Anker", "Brightech"],
        priceRange: [20, 100],
      };
    }

    // Default
    return {
      type: "Kitchen Appliance",
      category: "Kitchen Appliances",
      brands: ["Generic", "Premium", "Elite"],
      priceRange: [30, 100],
    };
  };

  const generateDescription = (type: string, brand: string, model: string) => {
    const descriptions: Record<string, string> = {
      "Blender": `The ${brand} ${model} is a powerful and versatile blender perfect for smoothies, soups, and more. Features multiple speed settings and a durable stainless steel blade for consistent blending results.`,
      "Electric Kettle": `Heat water quickly and efficiently with the ${brand} ${model}. This electric kettle features automatic shut-off, boil-dry protection, and a sleek modern design that complements any kitchen.`,
      "Electric Mixer": `The ${brand} ${model} electric mixer makes baking easier than ever. With multiple speed options and various attachments, it's perfect for mixing dough, beating eggs, and whipping cream.`,
      "Coffee Maker": `Start your morning right with the ${brand} ${model} coffee maker. Brews delicious coffee with programmable features and a thermal carafe to keep your coffee hot for hours.`,
      "Toaster": `Enjoy perfectly toasted bread every time with the ${brand} ${model}. Features adjustable browning controls, wide slots for different bread types, and a convenient crumb tray for easy cleaning.`,
      "Steam Iron": `The ${brand} ${model} steam iron delivers professional wrinkle removal with powerful steam output. Features a non-stick soleplate, adjustable temperature settings, and anti-drip technology.`,
      "Electric Fan": `Stay cool and comfortable with the ${brand} ${model} electric fan. Offers multiple speed settings, oscillating functionality, and whisper-quiet operation for home or office use.`,
      "Hair Dryer": `Achieve salon-quality results at home with the ${brand} ${model} hair dryer. Features ionic technology to reduce frizz, multiple heat settings, and a cool shot button for setting styles.`,
      "Table Lamp": `Illuminate your space with the ${brand} ${model} table lamp. Energy-efficient LED technology provides adjustable brightness levels and a modern design that enhances any room.`,
    };

    return descriptions[type] || `The ${brand} ${model} is a high-quality appliance designed to make your life easier and more efficient. Built with durability and performance in mind.`;
  };

  const downloadImage = async (url: string): Promise<Blob> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
    return await response.blob();
  };

  const uploadToR2 = async (blob: Blob, filename: string): Promise<string> => {
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY!,
      },
    });

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME!,
      Key: `products/${filename}`,
      Body: buffer,
      ContentType: blob.type || "image/jpeg",
    });

    await s3Client.send(command);

    return `https://pub-2abf1fca1a994517beb3fb17c83b3094.r2.dev/products/${filename}`;
  };

  const handleProcess = async () => {
    if (!urls.trim()) {
      alert("Please paste image URLs");
      return;
    }

    setProcessing(true);
    setLogs([]);
    setCompleted(0);

    const urlList = urls.split("\n").filter((u) => u.trim());
    setTotal(urlList.length);

    addLog(`🔧 Starting processing of ${urlList.length} products...`);

    for (let i = 0; i < urlList.length; i++) {
      const url = urlList[i].trim();
      const productNum = i + 1;

      try {
        setProgress(`[${productNum}/${urlList.length}] Processing...`);
        addLog(`\n[${productNum}/${urlList.length}] Processing: ${url.substring(0, 60)}...`);

        // Analyze URL
        const productInfo = analyzeUrlForProduct(url);

        // Generate product details
        const brand = productInfo.brands[Math.floor(Math.random() * productInfo.brands.length)];
        const modelSuffix = ["Pro", "Plus", "Elite", "Premium", "Deluxe", "Classic"][Math.floor(Math.random() * 6)];
        const modelNumber = `${Math.floor(Math.random() * 900) + 100}${["X", "S", "H", "Pro", ""][Math.floor(Math.random() * 5)]}`;
        const model = `${modelSuffix} ${modelNumber}`;

        const productName = `${brand} ${productInfo.type} ${modelSuffix}`;

        // Generate pricing
        const [minPrice, maxPrice] = productInfo.priceRange;
        const basePrice = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
        const discount = Math.floor(Math.random() * 21) + 5;
        const discountedPrice = Math.round(basePrice * (1 - discount / 100));

        // Create filename
        const slug = productName.toLowerCase().replace(/\s+/g, "-").replace(/\+/g, "plus");
        const urlHash = Array.from(new TextEncoder().encode(url))
          .reduce((acc, byte) => acc + byte, 0)
          .toString(16)
          .substring(0, 8);
        const filename = `${slug}_${urlHash}.jpg`;

        // Download image
        addLog(`  📥 Downloading image...`);
        const imageBlob = await downloadImage(url);
        addLog(`  ✅ Downloaded (${(imageBlob.size / 1024).toFixed(1)}KB)`);

        // Upload to R2
        addLog(`  ☁️ Uploading to R2...`);
        const r2Url = await uploadToR2(imageBlob, filename);
        addLog(`  ✅ Uploaded to R2`);

        // Generate description
        const description = generateDescription(productInfo.type, brand, model);

        // Create product data
        const productData = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          title: productName,
          slug: slug,
          category: productInfo.category,
          brand: brand,
          price: basePrice,
          discountedPrice: discountedPrice,
          description: description,
          imgs: {
            previews: [r2Url],
          },
          stock: Math.floor(Math.random() * 41) + 10,
          rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
          reviews: Math.floor(Math.random() * 451) + 50,
          featured: Math.random() > 0.75,
          isActive: true,
          specifications: {
            Brand: brand,
            Model: model,
            Power: `${[800, 1000, 1200, 1500][Math.floor(Math.random() * 4)]}W`,
            Warranty: `${[1, 2, 3][Math.floor(Math.random() * 3)]} Year Limited Warranty`,
            Color: ["Black", "White", "Stainless Steel", "Silver", "Red"][Math.floor(Math.random() * 5)],
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // Save to Firestore
        addLog(`  💾 Saving to Firestore...`);
        await addDoc(collection(db, "products"), productData);
        addLog(`  ✅ Saved: ${productName} - $${discountedPrice}`);

        setCompleted((prev) => prev + 1);
      } catch (error: any) {
        addLog(`  ❌ Error: ${error.message}`);
      }
    }

    setProgress("Complete!");
    addLog(`\n🎉 COMPLETE! Processed ${urlList.length} products`);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">🏠 Add Kitchen & Home Appliances</h1>
          <p className="text-gray-600 mb-6">
            Paste image URLs - products will be auto-detected and uploaded
          </p>

          <div className="space-y-6">
            {/* URL Input */}
            <div>
              <label className="block font-semibold mb-2">
                Image URLs (one per line):
              </label>
              <textarea
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder="https://example.com/blender.jpg
https://example.com/kettle.jpg
https://example.com/mixer.jpg"
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm"
                disabled={processing}
              />
              <p className="text-sm text-gray-500 mt-2">
                Supports: Blenders, Kettles, Mixers, Coffee Makers, Toasters, Irons, Fans, Hair Dryers, Lamps
              </p>
            </div>

            {/* Process Button */}
            <button
              onClick={handleProcess}
              disabled={processing || !urls.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold
                hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                transition-colors"
            >
              {processing ? progress : "Process & Upload All Products"}
            </button>

            {/* Progress */}
            {total > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Progress:</span>
                  <span className="text-blue-600 font-bold">
                    {completed}/{total} products
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(completed / total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Logs */}
            {logs.length > 0 && (
              <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            )}

            {/* Success Message */}
            {completed > 0 && !processing && (
              <div className="bg-green-100 border border-green-400 rounded-lg p-4">
                <p className="text-green-800 font-semibold">
                  🎉 Successfully added {completed} products!
                </p>
                <p className="text-sm text-green-700 mt-2">
                  View them at: <a href="/shop" className="underline">Shop Page</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
