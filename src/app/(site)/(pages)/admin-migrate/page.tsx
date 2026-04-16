'use client';

import { useState } from 'react';
import { uploadAllImages } from '@/scripts/uploadImagesToStorage';
import { migrateProducts } from '@/scripts/migrateProducts';

export default function AdminMigratePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState<'idle' | 'uploading' | 'migrating' | 'complete'>('idle');

  const handleMigration = async () => {
    setLoading(true);
    setResult(null);
    setStep('uploading');

    try {
      // Step 1: Upload all images to Firebase Storage
      console.log('Step 1: Uploading images to Firebase Storage...');
      const uploadResults = await uploadAllImages();

      setStep('migrating');

      // Step 2: Migrate products to Firestore with Firebase Storage URLs
      console.log('\nStep 2: Migrating products to Firestore...');
      const migrateResult = await migrateProducts(uploadResults.allUrls);

      setStep('complete');
      setResult({
        uploadResults,
        migrateResult,
      });

      console.log('\n✅ Complete migration finished!');
    } catch (error: any) {
      console.error('Migration error:', error);
      setResult({
        error: error.message,
      });
      setStep('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-dark mb-4">
            Image Migration to Firebase Storage
          </h1>
          <p className="text-gray-600 mb-6">
            This tool will migrate all product and category images from the local
            /public folder to Firebase Storage, then update Firestore with the new URLs.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-2">Migration Steps:</h2>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Upload product images to Firebase Storage</li>
              <li>Upload category images to Firebase Storage</li>
              <li>Update Firestore products with new image URLs</li>
            </ol>
          </div>

          {/* Status Display */}
          {step !== 'idle' && (
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`bg-blue h-full transition-all duration-500 ${
                        step === 'uploading'
                          ? 'w-1/3'
                          : step === 'migrating'
                          ? 'w-2/3'
                          : 'w-full'
                      }`}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-dark">
                  {step === 'uploading' && '📤 Uploading images...'}
                  {step === 'migrating' && '🔄 Migrating products...'}
                  {step === 'complete' && '✅ Complete!'}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleMigration}
            disabled={loading}
            className="w-full bg-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
          >
            {loading ? 'Migrating...' : 'Start Migration'}
          </button>

          {/* Results Display */}
          {result && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-dark mb-4">Migration Results:</h3>

              {result.error ? (
                <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
                  <strong>Error:</strong> {result.error}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Upload Results */}
                  {result.uploadResults && (
                    <div>
                      <h4 className="font-medium text-dark mb-2">Image Upload:</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded p-3 border">
                          <div className="text-sm text-gray-600">Product Images</div>
                          <div className="text-lg font-semibold text-green-600">
                            {result.uploadResults.products.uploaded} uploaded
                          </div>
                          {result.uploadResults.products.failed > 0 && (
                            <div className="text-sm text-red-600">
                              {result.uploadResults.products.failed} failed
                            </div>
                          )}
                        </div>
                        <div className="bg-white rounded p-3 border">
                          <div className="text-sm text-gray-600">Category Images</div>
                          <div className="text-lg font-semibold text-green-600">
                            {result.uploadResults.categories.uploaded} uploaded
                          </div>
                          {result.uploadResults.categories.failed > 0 && (
                            <div className="text-sm text-red-600">
                              {result.uploadResults.categories.failed} failed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Migration Results */}
                  {result.migrateResult && (
                    <div>
                      <h4 className="font-medium text-dark mb-2">
                        Product Migration:
                      </h4>
                      <div
                        className={`rounded p-4 ${
                          result.migrateResult.success
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                        }`}
                      >
                        {result.migrateResult.message}
                      </div>
                    </div>
                  )}

                  {/* Category URLs for manual update */}
                  {result.uploadResults?.categories && (
                    <div className="bg-gray-100 rounded p-4">
                      <h4 className="font-medium text-dark mb-2">
                        Category Firebase Storage URLs:
                      </h4>
                      <div className="bg-white rounded p-3 border text-xs font-mono overflow-x-auto">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(result.uploadResults.categories.urls, null, 2)}
                        </pre>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Update these URLs in{' '}
                        <code className="bg-gray-200 px-1 rounded">
                          src/components/Home/Categories/categoryData.ts
                        </code>
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded p-4 text-blue-800 text-sm">
                    <strong>✅ Migration Complete!</strong> Product images are now
                    served from Firebase Storage. Category images have been uploaded -
                    update the categoryData.ts file with the URLs shown above.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
            <strong>⚠️ Important:</strong> This migration should only be run once. Make
            sure Firebase Storage is properly configured in your Firebase project before
            proceeding.
          </div>
        </div>
      </div>
    </div>
  );
}
