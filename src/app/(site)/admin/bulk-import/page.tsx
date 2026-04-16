'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

interface ParsedProduct {
  name: string;
  brand: string;
  priceOriginal: number;
  priceUSD: number;
  description: string;
  images: string[];
  category: string;
}

export default function BulkImportPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
  const [conversionRate, setConversionRate] = useState(1000);
  const [imageMapping, setImageMapping] = useState<Record<string, string[]>>({});

  // Load image mapping on component mount
  useEffect(() => {
    fetch('/product-images-map.json')
      .then(res => res.json())
      .then(data => setImageMapping(data))
      .catch(err => console.error('Failed to load image mapping:', err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const parseHTMLFile = async (file: File): Promise<ParsedProduct | null> => {
    try {
      const text = await file.text();

      // Use regex to extract JSON-LD (more reliable for large HTML files)
      const jsonLdMatch = text.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);

      if (!jsonLdMatch) {
        console.error('No JSON-LD script tag found in', file.name);
        return null;
      }

      let productData: any = null;
      try {
        productData = JSON.parse(jsonLdMatch[1]);
        if (productData['@type'] !== 'Product') {
          console.error('JSON-LD is not a Product type in', file.name);
          return null;
        }
      } catch (e) {
        console.error('Failed to parse JSON-LD in', file.name, e);
        return null;
      }

      if (!productData) {
        console.error('No product data found in', file.name);
        return null;
      }

      // Extract data
      const name = productData.name || '';
      const brand = productData.brand?.name || 'Unknown';
      const priceOriginal = productData.offers?.[0]?.price || 0;
      const priceUSD = Math.round((priceOriginal / conversionRate) * 100) / 100;
      const description = productData.description || '';

      // Extract images
      let images: string[] = [];
      if (Array.isArray(productData.image)) {
        images = Array.isArray(productData.image[0]) ? productData.image[0] : productData.image;
      }

      // Auto-categorize
      const nameLower = name.toLowerCase();
      let category = 'Appliances';
      if (nameLower.includes('cafetera')) category = 'Kitchen Appliances';
      else if (nameLower.includes('heladera') || nameLower.includes('refrigera')) category = 'Refrigerators';
      else if (nameLower.includes('lavarropas') || nameLower.includes('lavadora')) category = 'Washing Machines';
      else if (nameLower.includes('tv') || nameLower.includes('televisor')) category = 'TVs';
      else if (nameLower.includes('notebook') || nameLower.includes('laptop')) category = 'Computers';
      else if (nameLower.includes('celular') || nameLower.includes('smartphone')) category = 'Smartphones';
      else if (nameLower.includes('microondas')) category = 'Microwaves';
      else if (nameLower.includes('aire acondicionado')) category = 'Air Conditioners';

      return {
        name,
        brand,
        priceOriginal,
        priceUSD,
        description,
        images: images.slice(0, 5), // Take first 5 images
        category,
      };
    } catch (error) {
      console.error('Error parsing file:', file.name, error);
      return null;
    }
  };

  // Note: Image re-uploading is skipped due to CORS restrictions
  // Products will use original image URLs directly

  const importProducts = async () => {
    if (!files || files.length === 0) {
      alert('Please select HTML files first!');
      return;
    }

    setImporting(true);
    setResults(null);
    let success = 0;
    let failed = 0;

    const total = files.length;
    setProgress({ current: 0, total, status: 'Starting...' });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total, status: `Parsing ${file.name}...` });

      try {
        // Parse HTML
        const product = await parseHTMLFile(file);
        if (!product) {
          console.error(`❌ Parsing failed for: ${file.name}`);
          failed++;
          continue;
        }

        if (!product.images || product.images.length === 0) {
          console.error(`❌ No images found for: ${product.name}`);
          failed++;
          continue;
        }

        setProgress({ current: i + 1, total, status: `Saving ${product.name} to database...` });

        // Get R2 images from mapping, fallback to product images
        const imagesToUse = imageMapping[product.name] || product.images.slice(0, 5);

        // Save to Firestore
        await addDoc(collection(db, 'products'), {
          title: product.name,
          brand: product.brand,
          category: product.category,
          description: product.description,
          price: product.priceUSD,
          stock: 50,
          images: imagesToUse,
          featured: false,
          isActive: true,
          tags: [product.brand, product.category],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        success++;
        console.log(`✅ Imported: ${product.name} (${product.priceUSD} USD)`);
        setProgress({ current: i + 1, total, status: `✅ Imported ${product.name}` });
      } catch (error) {
        console.error('❌ Failed to import product:', file.name, error);
        failed++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setResults({ success, failed });
    setImporting(false);
    setProgress({ current: total, total, status: 'Complete!' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-dark mb-2">📦 Bulk Product Import</h1>
        <p className="text-gray-600 mb-8">
          Upload HTML files to automatically import products
        </p>

        {/* Configuration */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium text-dark mb-2">
            Price Conversion Rate (to USD)
          </label>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">1 USD =</span>
            <input
              type="number"
              value={conversionRate}
              onChange={(e) => setConversionRate(Number(e.target.value))}
              className="w-32 px-3 py-2 border border-blue-300 rounded-lg"
            />
            <span className="text-gray-600">local currency</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Adjust this rate to match your supplier's currency
          </p>
        </div>

        {/* File Upload */}
        {!importing && !results && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-dark mb-3">
              Select Product HTML Files
            </label>
            <input
              type="file"
              accept=".html"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue file:text-white hover:file:bg-blue-dark cursor-pointer"
            />
            {files && (
              <p className="mt-3 text-sm text-green-600">
                ✅ {files.length} file(s) selected
              </p>
            )}
          </div>
        )}

        {/* Progress */}
        {importing && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{progress.status}</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue h-full transition-all duration-300"
                style={{
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-green-800 mb-3">✅ Import Complete!</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Successful:</span>
                <span className="font-medium text-green-600">{results.success}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Failed:</span>
                <span className="font-medium text-red-600">{results.failed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Total:</span>
                <span className="font-medium">{results.success + results.failed}</span>
              </div>
            </div>
          </div>
        )}

        {/* Import Button */}
        {!results && (
          <button
            onClick={importProducts}
            disabled={!files || files.length === 0 || importing}
            className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-colors ${
              !files || files.length === 0 || importing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue hover:bg-blue-dark'
            }`}
          >
            {importing ? 'Importing...' : `Import ${files?.length || 0} Product(s)`}
          </button>
        )}

        {/* Done Button */}
        {results && (
          <div className="space-y-3">
            <a
              href="/admin/products"
              className="block w-full py-4 px-6 rounded-lg font-medium text-white bg-green hover:bg-green-600 transition-colors text-center"
            >
              View Products →
            </a>
            <button
              onClick={() => {
                setFiles(null);
                setResults(null);
                setProgress({ current: 0, total: 0, status: '' });
              }}
              className="w-full py-3 px-6 rounded-lg font-medium text-blue border-2 border-blue hover:bg-blue-50 transition-colors"
            >
              Import More Products
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-medium text-dark mb-3">📝 How to use:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Save product pages as HTML (File → Save Page As → "Complete webpage")</li>
            <li>Select all HTML files using the button above</li>
            <li>Adjust USD conversion rate if needed</li>
            <li>Click "Import Products"</li>
            <li>Wait for the import to complete</li>
          </ol>
          <div className="mt-4 text-xs text-gray-600">
            <strong>Note:</strong> Images will use their original URLs. Up to 5 images per product will be imported.
          </div>
        </div>
      </div>
    </div>
  );
}
