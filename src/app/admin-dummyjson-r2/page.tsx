'use client';

import { useState } from 'react';

export default function DummyJSONToR2ImportPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ products: number; images: number } | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setLogs([]);
    setError(null);
    setStats(null);

    try {
      const response = await fetch('/api/import-dummyjson-to-r2', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setLogs(data.message.split('\n'));
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to import products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Import DummyJSON Products to R2</h1>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h2 className="font-semibold mb-2">🎯 What this will do:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Fetch ~50+ real tech products from DummyJSON API</li>
              <li>Download ALL product images (thumbnails + previews)</li>
              <li>Upload images to YOUR Cloudflare R2 bucket</li>
              <li>Delete existing products in Firestore</li>
              <li>Import products with R2 URLs (NOT DummyJSON URLs)</li>
              <li>Images will be served from your own domain</li>
            </ul>
          </div>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            <h2 className="font-semibold mb-2 text-green-800">✅ Benefits:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
              <li><strong>No one can tell</strong> images came from DummyJSON</li>
              <li><strong>Your domain</strong> - Images served from pub-2abf...r2.dev</li>
              <li><strong>Full control</strong> - Images stored in your R2 bucket</li>
              <li><strong>Real products</strong> - Actual tech items with matching images</li>
            </ul>
          </div>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h2 className="font-semibold mb-2 text-yellow-800">⚠️ Note:</h2>
            <p className="text-sm text-yellow-700">
              This will take a few minutes as it downloads and uploads ~200+ images to R2.
              Please be patient and don't close this tab.
            </p>
          </div>

          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Importing... (This may take 2-3 minutes)' : 'Start Import to R2'}
          </button>

          {loading && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 font-semibold mb-2">⏳ Import in progress...</p>
              <p className="text-sm text-yellow-700 mb-3">
                Downloading images from DummyJSON and uploading to R2. This will take a few minutes.
              </p>
              {/* Animated progress bar */}
              <div className="w-full bg-yellow-200 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-yellow-600 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                Processing ~50 products and ~200 images... Please wait, the page will update when complete.
              </p>
            </div>
          )}

          {logs.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-2">📋 Import Logs:</h3>
              <div className="font-mono text-xs space-y-1">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={
                      log.startsWith('✓') ? 'text-green-600' :
                      log.startsWith('✗') ? 'text-red-600' :
                      log.startsWith('Step') ? 'text-blue-600 font-semibold' :
                      'text-gray-700'
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-green-800 mb-2">✅ Import Successful!</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Products imported:</span>
                  <span className="ml-2 font-bold text-green-700">{stats.products}</span>
                </div>
                <div>
                  <span className="text-gray-600">Images uploaded to R2:</span>
                  <span className="ml-2 font-bold text-green-700">{stats.images}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="font-semibold text-red-800 mb-2">❌ Import Failed</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {stats && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold mb-2">🎉 Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Go to your homepage</li>
                <li>Product images are now served from YOUR R2 bucket</li>
                <li>Right-click any image → "Copy image address"</li>
                <li>You'll see: <code className="bg-white px-1">pub-2abf...r2.dev/images/dummyjson/...</code></li>
                <li>No trace of DummyJSON in the URLs! 🎉</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
