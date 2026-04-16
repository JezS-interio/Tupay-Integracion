'use client';

import { useState } from 'react';

export default function AdminUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    setUploading(true);
    setResult(null);

    try {
      const response = await fetch('/api/upload-to-r2', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Upload Images to R2</h1>
          <p className="text-gray-600 mb-8">
            Upload all images from public/images to Cloudflare R2
          </p>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {uploading ? 'Uploading...' : 'Start Upload'}
          </button>

          {uploading && (
            <div className="mt-8">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-blue-400 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-blue-400 rounded"></div>
                    <div className="h-4 bg-blue-400 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
              <p className="text-blue-600 mt-4 font-semibold">
                Uploading images... This may take a few minutes.
              </p>
            </div>
          )}

          {result && (
            <div className="mt-8">
              <div
                className={`p-6 rounded-lg ${
                  result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <h2
                  className={`text-xl font-bold mb-4 ${result.success ? 'text-green-800' : 'text-red-800'}`}
                >
                  {result.success ? '✅ Upload Successful!' : '❌ Upload Failed'}
                </h2>

                {result.message && (
                  <p className={`mb-4 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                )}

                {result.results && (
                  <div className="space-y-2">
                    <p className="font-semibold">
                      Total: {result.results.total} images
                    </p>
                    <p className="text-green-600">
                      ✓ Success: {result.results.success}
                    </p>
                    {result.results.failed > 0 && (
                      <p className="text-red-600">
                        ✗ Failed: {result.results.failed}
                      </p>
                    )}
                  </div>
                )}

                {result.error && (
                  <p className="text-red-600 mt-4">Error: {result.error}</p>
                )}

                {result.results?.uploads && result.results.uploads.length > 0 && (
                  <details className="mt-6">
                    <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                      View detailed results ({result.results.uploads.length} files)
                    </summary>
                    <div className="mt-4 max-h-96 overflow-y-auto bg-white p-4 rounded border">
                      {result.results.uploads.map((upload: any, index: number) => (
                        <div
                          key={index}
                          className={`py-2 px-3 mb-2 rounded text-sm ${
                            upload.status === 'success'
                              ? 'bg-green-50 text-green-800'
                              : 'bg-red-50 text-red-800'
                          }`}
                        >
                          <div className="font-mono">{upload.file}</div>
                          {upload.status === 'success' && (
                            <div className="text-xs text-green-600 truncate">
                              {upload.url}
                            </div>
                          )}
                          {upload.error && (
                            <div className="text-xs text-red-600 mt-1">
                              Error: {upload.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
