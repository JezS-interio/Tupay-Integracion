'use client';

import { useState, useRef } from 'react';
import { uploadImage } from '@/lib/firebase/storage';
import { addProduct } from '@/lib/firebase/products';
import { addBanner } from '@/lib/firebase/banners';
import toast from 'react-hot-toast';

interface ImportData {
  type: 'products' | 'banners';
  data: any[];
}

export default function DragDropImportPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [images, setImages] = useState<File[]>([]);
  const [jsonData, setJsonData] = useState<ImportData | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    const imageFiles: File[] = [];
    let jsonFile: File | null = null;

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        imageFiles.push(file);
      } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
        jsonFile = file;
      }
    });

    if (imageFiles.length > 0) {
      setImages((prev) => [...prev, ...imageFiles]);
      toast.success(`Added ${imageFiles.length} images`);
    }

    if (jsonFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          // Auto-detect if it's products or banners
          const isProducts = data.some((item: any) => item.price !== undefined);

          setJsonData({
            type: isProducts ? 'products' : 'banners',
            data: data,
          });
          toast.success(`Loaded ${data.length} ${isProducts ? 'products' : 'banners'} from JSON`);
        } catch (error) {
          toast.error('Invalid JSON file');
        }
      };
      reader.readAsText(jsonFile);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setImages([]);
    setJsonData(null);
    setResult(null);
  };

  const handleImport = async () => {
    if (!jsonData) {
      toast.error('Please upload a JSON file with product/banner data');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      console.log(`🚀 Starting import of ${jsonData.data.length} ${jsonData.type}...`);

      // Create a map of image names to files
      const imageMap = new Map<string, File>();
      images.forEach((img) => {
        imageMap.set(img.name, img);
      });

      for (const item of jsonData.data) {
        try {
          console.log(`\n📦 Processing: ${item.title}`);

          if (jsonData.type === 'products') {
            // Upload product images
            const thumbnails: string[] = [];
            const previews: string[] = [];

            const imageFilenames = item.images || [];

            for (const imageName of imageFilenames) {
              const imageFile = imageMap.get(imageName);

              if (!imageFile) {
                console.warn(`⚠️ Image not found: ${imageName}`);
                continue;
              }

              console.log(`  📷 Uploading: ${imageName}`);

              const storagePath = `products/imported/${Date.now()}-${imageName}`;
              const imageUrl = await uploadImage(imageFile, storagePath);

              thumbnails.push(imageUrl);
              previews.push(imageUrl);

              console.log(`  ✅ Uploaded: ${imageName}`);
            }

            // Generate slug
            const slug = item.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');

            // Create product
            const product = {
              title: item.title,
              description: item.description,
              price: item.price,
              discountedPrice: item.discountedPrice || item.price,
              rating: 0,
              category: item.category,
              stock: item.stock,
              sku: item.sku || `PRD-${Date.now()}`,
              slug,
              imgs: {
                thumbnails,
                previews,
              },
              isActive: item.isActive !== false,
              isFeatured: item.isFeatured || false,
              isNewArrival: item.isNewArrival || false,
              isBestSeller: item.isBestSeller || false,
            };

            const productId = await addProduct(product);

            if (productId) {
              console.log(`✅ Product created: ${productId}`);
              success++;
            } else {
              throw new Error('Failed to create product');
            }
          } else {
            // Upload banner image
            const imageFile = imageMap.get(item.image);

            if (!imageFile) {
              throw new Error(`Image not found: ${item.image}`);
            }

            console.log(`  📷 Uploading: ${item.image}`);

            const storagePath = `banners/imported/${Date.now()}-${item.image}`;
            const imageUrl = await uploadImage(imageFile, storagePath);

            console.log(`  ✅ Uploaded: ${item.image}`);

            // Create banner
            const banner = {
              title: item.title,
              subtitle: item.subtitle,
              description: item.description,
              buttonText: item.buttonText,
              buttonLink: item.buttonLink,
              badge: item.badge,
              imageUrl,
              order: item.order,
              isActive: item.isActive !== false,
            };

            const bannerId = await addBanner(banner);

            if (bannerId) {
              console.log(`✅ Banner created: ${bannerId}`);
              success++;
            } else {
              throw new Error('Failed to create banner');
            }
          }
        } catch (error: any) {
          console.error(`❌ Error:`, error);
          errors.push(`${item.title}: ${error.message}`);
          failed++;
        }
      }

      console.log(`\n✅ Import complete! Success: ${success}, Failed: ${failed}`);

      setResult({ success, failed, errors });

      if (success > 0) {
        toast.success(`Imported ${success} ${jsonData.type}!`);
      }
      if (failed > 0) {
        toast.error(`Failed to import ${failed} items`);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Import failed: ' + error.message);
      setResult({
        success: 0,
        failed: 1,
        errors: [error.message],
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-dark mb-2">Bulk Import</h2>
        <p className="text-gray-600">
          Drag & drop your images and JSON file from any folder
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">📁 How to Use:</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
          <li>Create a folder anywhere on your computer (Desktop, Documents, etc.)</li>
          <li>Put your product/banner images in that folder</li>
          <li>Create a <code className="bg-blue-100 px-1 rounded">data.json</code> file with product/banner info</li>
          <li>Drag the entire folder (or select all files) into the drop zone below</li>
          <li>Click "Import" and watch it upload everything to Firebase! ✨</li>
        </ol>
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 mb-6 transition-colors ${
          dragActive
            ? 'border-blue bg-blue-50'
            : 'border-gray-300 hover:border-blue'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-bold text-dark mb-2">
            Drag & Drop Files Here
          </h3>
          <p className="text-gray-600 mb-4">
            Drop images and JSON file, or click to browse
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.json"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>

      {/* Files Preview */}
      {(images.length > 0 || jsonData) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-dark">Uploaded Files:</h3>
            <button
              onClick={clearAll}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Clear All
            </button>
          </div>

          {/* JSON Data */}
          {jsonData && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-2xl">✓</span>
                <div>
                  <div className="font-medium text-green-900">
                    JSON Data Loaded
                  </div>
                  <div className="text-sm text-green-700">
                    {jsonData.data.length} {jsonData.type} ready to import
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Images */}
          {images.length > 0 && (
            <div>
              <div className="font-medium text-dark mb-3">
                Images ({images.length}):
              </div>
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={img.name}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded flex items-center justify-center">
                      <button
                        onClick={() => removeImage(index)}
                        className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {img.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import Button */}
      {images.length > 0 && jsonData && (
        <button
          onClick={handleImport}
          disabled={importing}
          className="w-full bg-blue text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
        >
          {importing ? 'Importing...' : `🚀 Import ${jsonData.data.length} ${jsonData.type}`}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-dark mb-4">Import Results:</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="text-sm text-green-600">Success</div>
              <div className="text-2xl font-bold text-green-700">
                {result.success}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded p-4">
              <div className="text-sm text-red-600">Failed</div>
              <div className="text-2xl font-bold text-red-700">
                {result.failed}
              </div>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
              <ul className="list-disc list-inside space-y-1 text-red-800 text-sm">
                {result.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Example JSON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-dark mb-3">
            Example: Products JSON
          </h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
{`[
  {
    "title": "iPhone 15 Pro",
    "description": "Latest iPhone...",
    "price": 1299.99,
    "discountedPrice": 1199.99,
    "category": "Smartphones",
    "stock": 25,
    "images": ["iphone-1.jpg", "iphone-2.jpg"],
    "isActive": true,
    "isFeatured": true
  }
]`}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-dark mb-3">
            Example: Banners JSON
          </h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
{`[
  {
    "title": "Summer Sale",
    "description": "Up to 50% off!",
    "buttonText": "Shop Now",
    "buttonLink": "/shop",
    "badge": "50% Off",
    "image": "banner.jpg",
    "order": 1,
    "isActive": true
  }
]`}
          </pre>
        </div>
      </div>
    </div>
  );
}
