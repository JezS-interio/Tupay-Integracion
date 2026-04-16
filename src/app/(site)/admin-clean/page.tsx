'use client';

import { useState } from 'react';
import { deleteAllProducts } from '@/scripts/deleteAllProducts';
import { useRouter } from 'next/navigation';

export default function AdminCleanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDelete = async () => {
    if (
      !confirm(
        '⚠️ WARNING: This will DELETE ALL products from Firestore!\n\nAre you absolutely sure?'
      )
    ) {
      return;
    }

    if (
      !confirm(
        'This action CANNOT be undone!\n\nClick OK to proceed with deletion.'
      )
    ) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const deleteResult = await deleteAllProducts();
      setResult(deleteResult);

      if (deleteResult.success) {
        setTimeout(() => {
          router.push('/admin/products');
        }, 3000);
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message,
        deletedCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🗑️</div>
            <h1 className="text-3xl font-bold text-dark mb-4">
              Delete All Products
            </h1>
            <p className="text-gray-600">
              This will permanently delete all products from Firestore.
              <br />
              Use this to remove old products with hardcoded images.
            </p>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <span>⚠️</span> Warning: This Action Cannot Be Undone!
            </h2>
            <ul className="list-disc list-inside space-y-2 text-red-800 text-sm">
              <li>All products will be permanently deleted from Firestore</li>
              <li>Product images will remain in Firebase Storage (if migrated)</li>
              <li>You will start with a clean slate</li>
              <li>You can add new products via the Admin Panel afterwards</li>
            </ul>
          </div>

          {!result && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Deleting All Products...' : '🗑️ Delete All Products'}
            </button>
          )}

          {result && (
            <div
              className={`rounded-lg p-6 ${
                result.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {result.success ? '✅ Success!' : '❌ Error'}
              </h3>
              <p
                className={
                  result.success ? 'text-green-800' : 'text-red-800'
                }
              >
                {result.message}
              </p>

              {result.success && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-green-700 text-sm">
                    Redirecting to products page in 3 seconds...
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/admin')}
              className="text-blue hover:underline"
            >
              ← Back to Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
