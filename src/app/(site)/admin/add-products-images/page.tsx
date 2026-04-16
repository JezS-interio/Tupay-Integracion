"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddProductsFromImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
    console.log(message);
  };

  const analyzeFilename = (filename: string) => {
    const nameLower = filename.toLowerCase();

    // SMARTPHONES - iPhone
    if (nameLower.includes("iphone")) {
      let brand = "Apple";
      let model = "iPhone";
      let basePrice = 699;
      let type = "Smartphone";
      let category = "Smartphones";

      if (nameLower.includes("iphone-16")) {
        model = "iPhone 16";
        basePrice = 799;
      } else if (nameLower.includes("iphone-15-pro")) {
        model = "iPhone 15 Pro";
        basePrice = 999;
      } else if (nameLower.includes("iphone-15")) {
        model = "iPhone 15";
        basePrice = 799;
      } else if (nameLower.includes("iphone-14-pro-max")) {
        model = "iPhone 14 Pro Max";
        basePrice = 1099;
      } else if (nameLower.includes("iphone-11-pro")) {
        model = "iPhone 11 Pro";
        basePrice = 699;
      } else if (nameLower.includes("iphone-11")) {
        model = "iPhone 11";
        basePrice = 599;
      }

      let color = "Black";
      const colorMap: Record<string, string> = {
        "negro-titanio": "Titanium Black",
        "negro": "Black",
        "morado-profundo": "Deep Purple",
        "rojo": "Red",
        "product-red": "Product RED",
        "plata": "Silver",
        "azul-ultramar": "Ultramarine Blue",
      };

      for (const [spanish, english] of Object.entries(colorMap)) {
        if (nameLower.includes(spanish)) {
          color = english;
          break;
        }
      }

      return { brand, model, color, category, type, basePrice, isPhone: true };
    }

    // SMARTPHONES - Samsung
    if (nameLower.includes("samsung") || nameLower.includes("galaxy")) {
      let brand = "Samsung";
      let model = "Galaxy";
      let basePrice = 599;

      if (nameLower.includes("s24-ultra")) {
        model = "Galaxy S24 Ultra";
        basePrice = 1199;
      } else if (nameLower.includes("s24")) {
        model = "Galaxy S24";
        basePrice = 799;
      } else if (nameLower.includes("a-series") || nameLower.includes("galaxy-a")) {
        model = "Galaxy A54";
        basePrice = 449;
      }

      let color = "Black";
      if (nameLower.includes("azul-titanio")) color = "Titanium Blue";
      else if (nameLower.includes("negro")) color = "Black";

      return { brand, model, color, category: "Smartphones", type: "Smartphone", basePrice, isPhone: true };
    }

    // SMARTPHONES - Google Pixel
    if (nameLower.includes("pixel")) {
      let brand = "Google";
      let model = "Pixel";
      let basePrice = 499;

      if (nameLower.includes("pixel-7-pro")) {
        model = "Pixel 7 Pro";
        basePrice = 899;
      } else if (nameLower.includes("pixel-7")) {
        model = "Pixel 7";
        basePrice = 599;
      }

      let color = "Black";
      if (nameLower.includes("negro") || nameLower.includes("obsidian")) color = "Obsidian";
      else if (nameLower.includes("blanco") || nameLower.includes("snow")) color = "Snow";

      return { brand, model, color, category: "Smartphones", type: "Smartphone", basePrice, isPhone: true };
    }

    // APPLIANCES - Blender
    if (nameLower.includes("blender")) {
      const brands = ["Oster", "Ninja", "Vitamix", "Hamilton Beach", "KitchenAid"];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      return {
        brand,
        model: "",
        color: "",
        category: "Kitchen Appliances",
        type: "Blender",
        basePrice: Math.floor(Math.random() * 81) + 40,
        isPhone: false,
      };
    }

    // APPLIANCES - Kettle
    if (nameLower.includes("kettle")) {
      const brands = ["Cuisinart", "Mueller", "Cosori", "Hamilton Beach", "Chefman"];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      return {
        brand,
        model: "",
        color: "",
        category: "Kitchen Appliances",
        type: "Electric Kettle",
        basePrice: Math.floor(Math.random() * 46) + 25,
        isPhone: false,
      };
    }

    // APPLIANCES - Mixer
    if (nameLower.includes("mixer")) {
      const brands = ["KitchenAid", "Cuisinart", "Hamilton Beach", "Oster", "Sunbeam"];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      return {
        brand,
        model: "",
        color: "",
        category: "Kitchen Appliances",
        type: "Electric Mixer",
        basePrice: Math.floor(Math.random() * 61) + 30,
        isPhone: false,
      };
    }

    // APPLIANCES - Coffee
    if (nameLower.includes("coffee") || nameLower.includes("machine")) {
      const brands = ["Keurig", "Nespresso", "Mr. Coffee", "Cuisinart", "Breville"];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      return {
        brand,
        model: "",
        color: "",
        category: "Kitchen Appliances",
        type: "Coffee Maker",
        basePrice: Math.floor(Math.random() * 151) + 50,
        isPhone: false,
      };
    }

    // APPLIANCES - Bread Maker (check before toaster)
    if (nameLower.includes("bread-maker") || nameLower.includes("bread") && nameLower.includes("maker")) {
      const brands = ["Cuisinart", "Hamilton Beach", "Oster", "Zojirushi", "Panasonic"];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      return {
        brand,
        model: "",
        color: "",
        category: "Kitchen Appliances",
        type: "Bread Maker",
        basePrice: Math.floor(Math.random() * 81) + 60,
        isPhone: false,
      };
    }

    // APPLIANCES - Toaster
    if (nameLower.includes("toaster")) {
      const brands = ["Cuisinart", "Breville", "KitchenAid", "Black+Decker", "Hamilton Beach"];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      return {
        brand,
        model: "",
        color: "",
        category: "Kitchen Appliances",
        type: "Toaster",
        basePrice: Math.floor(Math.random() * 56) + 25,
        isPhone: false,
      };
    }

    // APPLIANCES - Iron
    if (nameLower.includes("iron")) {
      const brands = ["Rowenta", "Black+Decker", "Sunbeam", "Hamilton Beach", "Shark"];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      return {
        brand,
        model: "",
        color: "",
        category: "Home Appliances",
        type: "Steam Iron",
        basePrice: Math.floor(Math.random() * 41) + 20,
        isPhone: false,
      };
    }

    // APPLIANCES - Fan
    if (nameLower.includes("fan") || nameLower.includes("ventilator")) {
      const brands = ["Lasko", "Honeywell", "Vornado", "Dyson", "Rowenta"];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      return {
        brand,
        model: "",
        color: "",
        category: "Home Appliances",
        type: "Electric Fan",
        basePrice: Math.floor(Math.random() * 121) + 30,
        isPhone: false,
      };
    }

    // APPLIANCES - Hair Dryer
    if (nameLower.includes("dryer") || nameLower.includes("hair")) {
      const brands = ["Conair", "Revlon", "BaByliss", "Remington", "Dyson"];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      return {
        brand,
        model: "",
        color: "",
        category: "Personal Care",
        type: "Hair Dryer",
        basePrice: Math.floor(Math.random() * 376) + 25,
        isPhone: false,
      };
    }

    // APPLIANCES - Lamp
    if (nameLower.includes("lamp")) {
      const brands = ["TaoTronics", "BenQ", "Philips", "Anker", "Brightech"];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      return {
        brand,
        model: "",
        color: "",
        category: "Home & Living",
        type: "Table Lamp",
        basePrice: Math.floor(Math.random() * 81) + 20,
        isPhone: false,
      };
    }

    // Default fallback
    return {
      brand: "Generic",
      model: "",
      color: "",
      category: "Electronics",
      type: "Product",
      basePrice: 50,
      isPhone: false,
    };
  };

  const generateDescription = (info: any) => {
    if (info.isPhone) {
      const phoneDescriptions: Record<string, string> = {
        Apple: `The ${info.brand} ${info.model} in ${info.color} delivers exceptional performance with cutting-edge technology. Features advanced camera systems, powerful processor, stunning display, and all-day battery life. Experience premium design and iOS ecosystem integration.`,
        Samsung: `The ${info.brand} ${info.model} in ${info.color} combines innovative technology with stunning design. Featuring a brilliant AMOLED display, versatile camera system, long-lasting battery, and the latest Android experience. Perfect for productivity and entertainment.`,
        Google: `The ${info.brand} ${info.model} in ${info.color} offers pure Android experience with Google's latest innovations. Features exceptional camera quality with computational photography, smooth performance, and guaranteed software updates. Designed by Google for the best of Google.`,
      };
      return phoneDescriptions[info.brand] || `Premium ${info.brand} ${info.model} smartphone in ${info.color}.`;
    }

    const modelSuffix = ["Pro", "Plus", "Elite", "Premium", "Deluxe", "Classic"][Math.floor(Math.random() * 6)];
    const modelNumber = `${Math.floor(Math.random() * 900) + 100}${["X", "S", "H", "Pro", ""][Math.floor(Math.random() * 5)]}`;
    const fullModel = `${modelSuffix} ${modelNumber}`;

    const applianceDescriptions: Record<string, string> = {
      "Blender": `The ${info.brand} ${fullModel} is a powerful and versatile blender perfect for smoothies, soups, and more. Features multiple speed settings and a durable stainless steel blade for consistent blending results.`,
      "Electric Kettle": `Heat water quickly and efficiently with the ${info.brand} ${fullModel}. This electric kettle features automatic shut-off, boil-dry protection, and a sleek modern design that complements any kitchen.`,
      "Electric Mixer": `The ${info.brand} ${fullModel} electric mixer makes baking easier than ever. With multiple speed options and various attachments, it's perfect for mixing dough, beating eggs, and whipping cream.`,
      "Bread Maker": `The ${info.brand} ${fullModel} automatic bread maker makes fresh homemade bread effortless. Features programmable settings, multiple loaf sizes, and crust color options. Perfect for baking bread, dough, jam, and more with one-touch convenience.`,
      "Coffee Maker": `Start your morning right with the ${info.brand} ${fullModel} coffee maker. Brews delicious coffee with programmable features and a thermal carafe to keep your coffee hot for hours.`,
      "Toaster": `Enjoy perfectly toasted bread every time with the ${info.brand} ${fullModel}. Features adjustable browning controls, wide slots for different bread types, and a convenient crumb tray for easy cleaning.`,
      "Steam Iron": `The ${info.brand} ${fullModel} steam iron delivers professional wrinkle removal with powerful steam output. Features a non-stick soleplate, adjustable temperature settings, and anti-drip technology.`,
      "Electric Fan": `Stay cool and comfortable with the ${info.brand} ${fullModel} electric fan. Offers multiple speed settings, oscillating functionality, and whisper-quiet operation for home or office use.`,
      "Hair Dryer": `Achieve salon-quality results at home with the ${info.brand} ${fullModel} hair dryer. Features ionic technology to reduce frizz, multiple heat settings, and a cool shot button for setting styles.`,
      "Table Lamp": `Illuminate your space with the ${info.brand} ${fullModel} table lamp. Energy-efficient LED technology provides adjustable brightness levels and a modern design that enhances any room.`,
    };

    return applianceDescriptions[info.type] || `High-quality ${info.brand} ${info.type} designed for performance and reliability.`;
  };

  const generateSpecs = (info: any) => {
    const specs: Record<string, string> = {
      Brand: info.brand,
      Condition: "Brand New",
      Warranty: "1 Year Limited Warranty",
    };

    if (info.isPhone) {
      specs.Model = info.model;
      specs.Color = info.color;

      if (info.brand === "Apple") {
        if (info.model.includes("Pro")) {
          specs["Display"] = "6.1\" Super Retina XDR";
          specs["Storage"] = "256GB";
          specs["Chip"] = "A16 Bionic";
          specs["Camera"] = "Triple 48MP Camera System";
        } else {
          specs["Display"] = "6.1\" Super Retina XDR";
          specs["Storage"] = "128GB";
          specs["Chip"] = "A15 Bionic";
          specs["Camera"] = "Dual Camera System";
        }
      } else if (info.brand === "Samsung") {
        if (info.model.includes("Ultra")) {
          specs["Display"] = "6.8\" Dynamic AMOLED 2X";
          specs["Storage"] = "256GB";
          specs["Processor"] = "Snapdragon 8 Gen 3";
          specs["Camera"] = "Quad Camera with 200MP";
        } else if (info.model.includes("A")) {
          specs["Display"] = "6.4\" Super AMOLED";
          specs["Storage"] = "128GB";
          specs["Processor"] = "Exynos 1380";
          specs["Camera"] = "Triple Camera 50MP";
        } else {
          specs["Display"] = "6.2\" Dynamic AMOLED";
          specs["Storage"] = "128GB";
          specs["Processor"] = "Snapdragon 8 Gen 2";
          specs["Camera"] = "Triple Camera 50MP";
        }
      } else if (info.brand === "Google") {
        specs["Display"] = "6.3\" OLED";
        specs["Storage"] = "128GB";
        specs["Processor"] = "Google Tensor G2";
        specs["Camera"] = "Dual Camera with AI";
      }
    } else {
      // Appliances
      const modelSuffix = ["Pro", "Plus", "Elite", "Premium", "Deluxe", "Classic"][Math.floor(Math.random() * 6)];
      const modelNumber = `${Math.floor(Math.random() * 900) + 100}${["X", "S", "H", "Pro", ""][Math.floor(Math.random() * 5)]}`;
      specs.Model = `${modelSuffix} ${modelNumber}`;
      specs.Power = `${[800, 1000, 1200, 1500][Math.floor(Math.random() * 4)]}W`;
      specs.Color = ["Black", "White", "Stainless Steel", "Silver", "Red"][Math.floor(Math.random() * 5)];
    }

    return specs;
  };

  const uploadToR2 = async (file: File, filename: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", filename);

    const response = await fetch("/api/upload-product-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const data = await response.json();
    return data.url;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      alert("Please select image files");
      return;
    }

    setProcessing(true);
    setLogs([]);
    setCompleted(0);
    setTotal(files.length);

    addLog(`🚀 Starting processing of ${files.length} products...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const productNum = i + 1;

      try {
        setProgress(`[${productNum}/${files.length}] Processing ${file.name}...`);
        addLog(`\n[${productNum}/${files.length}] Processing: ${file.name}`);

        // Analyze filename
        const info = analyzeFilename(file.name);
        addLog(`  🔍 Detected: ${info.isPhone ? "📱 Smartphone" : "🏠 Appliance"} - ${info.type}`);

        // Generate product name
        const productName = info.isPhone
          ? `${info.brand} ${info.model} - ${info.color}`
          : `${info.brand} ${info.type} ${["Pro", "Plus", "Elite"][Math.floor(Math.random() * 3)]}`;

        // Generate pricing
        const basePrice = info.basePrice;
        const discount = info.isPhone
          ? Math.floor(Math.random() * 11) + 5  // Phones: 5-15%
          : Math.floor(Math.random() * 21) + 5; // Appliances: 5-25%
        const discountedPrice = Math.round(basePrice * (1 - discount / 100));

        // Create slug
        const slug = productName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        // Create filename for R2
        const extension = file.name.split(".").pop();
        const newFilename = `${slug}.${extension}`;

        // Upload to R2
        addLog(`  ☁️ Uploading to R2...`);
        const r2Url = await uploadToR2(file, newFilename);
        addLog(`  ✅ Uploaded to R2`);

        // Generate description and specs
        const description = generateDescription(info);
        const specifications = generateSpecs(info);

        // Create product data
        const productData = {
          id: Date.now() + i,
          title: productName,
          slug: slug,
          category: info.category,
          brand: info.brand,
          price: basePrice,
          discountedPrice: discountedPrice,
          description: description,
          imgs: {
            previews: [r2Url],
          },
          stock: Math.floor(Math.random() * (info.isPhone ? 26 : 41)) + (info.isPhone ? 5 : 10),
          rating: parseFloat((Math.random() * (info.isPhone ? 1.0 : 1.5) + (info.isPhone ? 4.0 : 3.5)).toFixed(1)),
          reviews: Math.floor(Math.random() * (info.isPhone ? 901 : 451)) + (info.isPhone ? 100 : 50),
          featured: Math.random() > (info.isPhone ? 0.67 : 0.75),
          isActive: true,
          specifications: specifications,
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
    addLog(`\n🎉 COMPLETE! Processed ${files.length} products`);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">📦 Upload All Products</h1>
          <p className="text-gray-600 mb-6">
            Upload all images at once - smartphones and appliances auto-detected
          </p>

          <div className="space-y-6">
            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={processing}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <svg
                  className="w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-lg font-semibold text-gray-700">
                  Click to upload all product images
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  or drag and drop
                </span>
                <span className="text-xs text-gray-400 mt-3">
                  Supports: Phones, Blenders, Kettles, Mixers, Coffee Makers, Toasters, Irons, Fans, Hair Dryers, Lamps
                </span>
              </label>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold mb-2">
                  Selected {files.length} files:
                </p>
                <ul className="text-sm space-y-1 max-h-60 overflow-y-auto">
                  {files.map((file, idx) => (
                    <li key={idx} className="text-gray-700">
                      {idx + 1}. {file.name} ({(file.size / 1024).toFixed(1)}KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Process Button */}
            <button
              onClick={handleProcess}
              disabled={processing || files.length === 0}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold
                hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                transition-colors text-lg"
            >
              {processing ? progress : `🚀 Process & Upload ${files.length} Products`}
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
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
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
                <p className="text-green-800 font-semibold text-lg">
                  🎉 Successfully uploaded {completed} products!
                </p>
                <p className="text-sm text-green-700 mt-2">
                  View them at: <a href="/shop" className="underline font-semibold">Shop Page</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
