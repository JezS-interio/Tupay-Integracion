'use client';

import { useState } from 'react';

export default function DummyJSONImportPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/import-dummyjson', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data.message);
    } catch (err: any) {
      setError(err.message || 'Failed to import products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Import Products from DummyJSON</h1>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h2 className="font-semibold mb-2">What this will do:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Fetch real tech products from DummyJSON API</li>
              <li>Categories: Smartphones, Laptops, Tablets, Watches, Mobile Accessories</li>
              <li>Delete all existing products in Firestore</li>
              <li>Import new products with real images from DummyJSON CDN</li>
              <li>All products will have proper images that match their names</li>
            </ul>
          </div>

          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Importing Products...' : 'Start Import'}
          </button>

          {loading && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">⏳ Importing products, please wait...</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-green-800 mb-2">✅ Import Successful!</h3>
              <p className="text-sm text-green-700 whitespace-pre-line">{result}</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="font-semibold text-red-800 mb-2">❌ Import Failed</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded">
            <h3 className="font-semibold mb-2">After import:</h3>
            <p className="text-sm text-gray-700">
              Go to your homepage to see the products with real images that actually match the product names!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
