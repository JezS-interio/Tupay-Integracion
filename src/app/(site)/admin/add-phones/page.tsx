"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export default function AddPhonesPage() {
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

  const parsePhoneFilename = (filename: string) => {
    const nameLower = filename.toLowerCase();

    // iPhone detection
    if (nameLower.includes("iphone")) {
      let brand = "Apple";
      let model = "iPhone";
      let basePrice = 699;

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

      // Extract color
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

      return { brand, model, color, category: "Smartphones", basePrice };
    }

    // Samsung detection
    if (nameLower.includes("samsung")) {
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

      return { brand, model, color, category: "Smartphones", basePrice };
    }

    // Google Pixel detection
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

      return { brand, model, color, category: "Smartphones", basePrice };
    }

    // Fallback
    return {
      brand: "Generic",
      model: "Smartphone",
      color: "Black",
      category: "Smartphones",
      basePrice: 499,
    };
  };

  const generateDescription = (brand: string, model: string, color: string) => {
    const descriptions: Record<string, string> = {
      Apple: `The ${brand} ${model} in ${color} delivers exceptional performance with cutting-edge technology. Features advanced camera systems, powerful processor, stunning display, and all-day battery life. Experience premium design and iOS ecosystem integration.`,
      Samsung: `The ${brand} ${model} in ${color} combines innovative technology with stunning design. Featuring a brilliant AMOLED display, versatile camera system, long-lasting battery, and the latest Android experience. Perfect for productivity and entertainment.`,
      Google: `The ${brand} ${model} in ${color} offers pure Android experience with Google's latest innovations. Features exceptional camera quality with computational photography, smooth performance, and guaranteed software updates. Designed by Google for the best of Google.`,
    };

    return descriptions[brand] || `Premium ${brand} ${model} smartphone in ${color}. High-quality device with modern features.`;
  };

  const generateSpecs = (brand: string, model: string, color: string) => {
    const specs: Record<string, string> = {
      Brand: brand,
      Model: model,
      Color: color,
      Condition: "Brand New",
      Warranty: "1 Year Manufacturer Warranty",
    };

    if (brand === "Apple") {
      if (model.includes("Pro")) {
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
    } else if (brand === "Samsung") {
      if (model.includes("Ultra")) {
        specs["Display"] = "6.8\" Dynamic AMOLED 2X";
        specs["Storage"] = "256GB";
        specs["Processor"] = "Snapdragon 8 Gen 3";
        specs["Camera"] = "Quad Camera with 200MP";
      } else if (model.includes("A")) {
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
    } else if (brand === "Google") {
      specs["Display"] = "6.3\" OLED";
      specs["Storage"] = "128GB";
      specs["Processor"] = "Google Tensor G2";
      specs["Camera"] = "Dual Camera with AI";
    }

    return specs;
  };

  const uploadToR2 = async (file: File, filename: string): Promise<string> => {
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY!,
      },
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME!,
      Key: `products/phones/${filename}`,
      Body: buffer,
      ContentType: file.type || "image/jpeg",
    });

    await s3Client.send(command);

    return `https://pub-2abf1fca1a994517beb3fb17c83b3094.r2.dev/products/phones/${filename}`;
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

    addLog(`📱 Starting processing of ${files.length} smartphone products...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const productNum = i + 1;

      try {
        setProgress(`[${productNum}/${files.length}] Processing ${file.name}...`);
        addLog(`\n[${productNum}/${files.length}] Processing: ${file.name}`);

        // Parse filename
        const phoneInfo = parsePhoneFilename(file.name);

        // Generate product name
        const productName = `${phoneInfo.brand} ${phoneInfo.model} - ${phoneInfo.color}`;

        // Generate pricing
        const basePrice = phoneInfo.basePrice;
        const discount = Math.floor(Math.random() * 11) + 5; // 5-15%
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
        const description = generateDescription(phoneInfo.brand, phoneInfo.model, phoneInfo.color);
        const specifications = generateSpecs(phoneInfo.brand, phoneInfo.model, phoneInfo.color);

        // Create product data
        const productData = {
          id: 2000 + i + 1,
          title: productName,
          slug: slug,
          category: phoneInfo.category,
          brand: phoneInfo.brand,
          price: basePrice,
          discountedPrice: discountedPrice,
          description: description,
          imgs: {
            previews: [r2Url],
          },
          stock: Math.floor(Math.random() * 26) + 5,
          rating: parseFloat((Math.random() * 1.0 + 4.0).toFixed(1)),
          reviews: Math.floor(Math.random() * 901) + 100,
          featured: Math.random() > 0.67,
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
    addLog(`\n🎉 COMPLETE! Processed ${files.length} smartphone products`);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">📱 Add Smartphone Products</h1>
          <p className="text-gray-600 mb-6">
            Upload iPhone, Samsung Galaxy, and Google Pixel images
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
                  Click to upload phone images
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  or drag and drop
                </span>
              </label>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold mb-2">
                  Selected {files.length} files:
                </p>
                <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
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
                transition-colors"
            >
              {processing ? progress : `Process & Upload ${files.length} Products`}
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
                  🎉 Successfully added {completed} smartphone products!
                </p>
                <p className="text-sm text-green-700 mt-2">
                  View them at: <a href="/shop" className="underline">Shop Page</a>
                </p>
              </div>
            )}

            {/* Info */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <p className="font-semibold mb-2">📌 Auto-detected products:</p>
              <ul className="text-sm space-y-1">
                <li>• iPhones: 11, 11 Pro, 14 Pro Max, 15, 15 Pro, 16</li>
                <li>• Samsung: Galaxy S24 Ultra, A Series</li>
                <li>• Google: Pixel 7, Pixel 7 Pro</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                Products will be automatically categorized based on filenames.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
