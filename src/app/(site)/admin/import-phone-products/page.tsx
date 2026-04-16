"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ProductData {
  id: number;
  name: string;
  slug: string;
  category: string;
  type: string;
  brand: string;
  model: string;
  price: number;
  discountedPrice: number;
  discount: number;
  description: string;
  image_file: string;
  original_file: string;
  stock: number;
  rating: number;
  reviews: number;
  featured: boolean;
  isActive: boolean;
  specifications: Record<string, string>;
}

interface R2Mapping {
  filename: string;
  url: string;
}

export default function ImportPhoneProductsPage() {
  const [productsData, setProductsData] = useState<ProductData[]>([]);
  const [r2Mapping, setR2Mapping] = useState<R2Mapping[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const handleLoadProductsData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setProductsData(data);
        console.log(`✅ Loaded ${data.length} smartphone products`);
      } catch (error) {
        console.error("Error parsing products_data.json:", error);
        setErrors((prev) => [...prev, "Failed to parse products_data.json"]);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadR2Mapping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setR2Mapping(data);
        console.log(`✅ Loaded ${data.length} R2 URLs`);
      } catch (error) {
        console.error("Error parsing r2-urls.json:", error);
        setErrors((prev) => [...prev, "Failed to parse r2-urls.json"]);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (productsData.length === 0) {
      alert("Please load products_data.json first");
      return;
    }
    if (r2Mapping.length === 0) {
      alert("Please load r2-urls.json first");
      return;
    }

    setImporting(true);
    setImported(0);
    setErrors([]);

    // Create filename to R2 URL map
    const urlMap = new Map(r2Mapping.map((item) => [item.filename, item.url]));

    for (let i = 0; i < productsData.length; i++) {
      const product = productsData[i];

      try {
        // Get R2 URL for this product
        const r2Url = urlMap.get(product.image_file);

        if (!r2Url) {
          throw new Error(`No R2 URL found for ${product.image_file}`);
        }

        // Prepare Firestore document
        const firestoreProduct = {
          id: product.id,
          title: product.name,
          slug: product.slug,
          category: product.category,
          brand: product.brand,
          price: product.price,
          discountedPrice: product.discountedPrice,
          description: product.description,
          imgs: {
            previews: [r2Url],
          },
          stock: product.stock,
          rating: product.rating,
          reviews: product.reviews,
          featured: product.featured,
          isActive: product.isActive,
          specifications: product.specifications,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // Add to Firestore
        await addDoc(collection(db, "products"), firestoreProduct);

        setImported((prev) => prev + 1);
        console.log(`✅ [${i + 1}/${productsData.length}] Imported: ${product.name}`);
      } catch (error: any) {
        console.error(`❌ Failed to import ${product.name}:`, error);
        setErrors((prev) => [
          ...prev,
          `${product.name}: ${error.message}`,
        ]);
      }
    }

    setImporting(false);
    console.log("🎉 Import complete!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">📱 Import Smartphone Products</h1>
          <p className="text-gray-600 mb-6">
            Import iPhone, Samsung Galaxy, and Google Pixel products to Firestore
          </p>

          <div className="space-y-6">
            {/* Step 1: Load Products Data */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Step 1: Load products_data.json
              </h2>
              <p className="text-gray-600 mb-4">
                Location: <code className="bg-gray-100 px-2 py-1 rounded">scripts/phone_products/products_data.json</code>
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleLoadProductsData}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {productsData.length > 0 && (
                <div className="mt-4">
                  <p className="text-green-600 font-semibold mb-2">
                    ✅ Loaded {productsData.length} smartphone products
                  </p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-semibold mb-1">Preview:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {productsData.slice(0, 5).map((p) => (
                        <li key={p.id}>
                          {p.name} - ${p.discountedPrice}
                        </li>
                      ))}
                      {productsData.length > 5 && (
                        <li className="text-gray-500">
                          ... and {productsData.length - 5} more
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Load R2 Mapping */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Step 2: Load r2-urls.json
              </h2>
              <p className="text-gray-600 mb-4">
                Location: <code className="bg-gray-100 px-2 py-1 rounded">scripts/phone_products/r2-urls.json</code>
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleLoadR2Mapping}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {r2Mapping.length > 0 && (
                <p className="mt-2 text-green-600">
                  ✅ Loaded {r2Mapping.length} R2 URLs
                </p>
              )}
            </div>

            {/* Step 3: Import Button */}
            <div className="border-2 border-solid border-blue-300 rounded-lg p-6 bg-blue-50">
              <h2 className="text-xl font-semibold mb-4">
                Step 3: Import to Firestore
              </h2>
              <button
                onClick={handleImport}
                disabled={
                  importing ||
                  productsData.length === 0 ||
                  r2Mapping.length === 0
                }
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold
                  hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                  transition-colors"
              >
                {importing
                  ? `Importing... ${imported}/${productsData.length}`
                  : `Import ${productsData.length} Smartphone Products to Firestore`}
              </button>

              {imported > 0 && !importing && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
                  <p className="text-green-800 font-semibold">
                    🎉 Successfully imported {imported}/{productsData.length} smartphone products!
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    View them at: <a href="/shop" className="underline">Shop Page</a>
                  </p>
                </div>
              )}

              {errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
                  <p className="text-red-800 font-semibold mb-2">
                    Errors ({errors.length}):
                  </p>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
              <h3 className="font-semibold mb-2">📋 Complete Workflow:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Run: <code className="bg-gray-100 px-2 py-1 rounded">python scripts/prepare-phone-products.py</code></li>
                <li>Run: <code className="bg-gray-100 px-2 py-1 rounded">node scripts/upload-phone-products-to-r2.js</code></li>
                <li>Load both JSON files above and click Import</li>
              </ol>
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <p className="text-sm font-semibold mb-1">📱 Products to be imported:</p>
                <ul className="text-sm space-y-1">
                  <li>• Apple iPhone models (11, 14 Pro Max, 15, 15 Pro, 16)</li>
                  <li>• Samsung Galaxy (S24 Ultra, A Series)</li>
                  <li>• Google Pixel (7, 7 Pro)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
