'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function DeleteProductsPage() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState({ deleted: 0, total: 0 });
  const [completed, setCompleted] = useState(false);

  // Fetch product count on load
  useEffect(() => {
    fetchProductCount();
  }, []);

  const fetchProductCount = async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      setProductCount(snapshot.size);
    } catch (error) {
      console.error('Error fetching product count:', error);
      alert('Failed to fetch product count');
    } finally {
      setLoading(false);
    }
  };

  const deleteAllProducts = async () => {
    const confirmed = window.confirm(
      `⚠️ WARNING: This will permanently delete ALL ${productCount} products from your database!\n\nAre you sure you want to continue?`
    );

    if (!confirmed) return;

    setDeleting(true);
    setCompleted(false);

    try {
      // Get all products
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);

      const total = snapshot.size;
      let deleted = 0;

      setProgress({ deleted: 0, total });

      // Delete each product
      for (const productDoc of snapshot.docs) {
        await deleteDoc(doc(db, 'products', productDoc.id));
        deleted++;
        setProgress({ deleted, total });
      }

      setCompleted(true);
      setProductCount(0);
      alert(`✅ Successfully deleted ${deleted} products!`);
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('❌ Failed to delete products. Check console for details.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">🗑️ Delete All Products</h1>
          <p className="text-gray-600">
            Remove all products from your database
          </p>
        </div>

        {/* Product Count */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-blue border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading product count...</span>
            </div>
          ) : (
            <>
              <div className="text-5xl font-bold text-dark mb-2">
                {productCount ?? '-'}
              </div>
              <div className="text-gray-600">Products in database</div>
            </>
          )}
        </div>

        {/* Progress */}
        {deleting && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Deleting products...</span>
              <span>{progress.deleted} / {progress.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-red h-full transition-all duration-300 flex items-center justify-center text-white text-xs font-medium"
                style={{
                  width: `${progress.total > 0 ? (progress.deleted / progress.total) * 100 : 0}%`
                }}
              >
                {progress.total > 0 && Math.round((progress.deleted / progress.total) * 100)}%
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {completed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-center">
            <div className="text-green-600 text-lg font-medium">
              ✅ All products deleted successfully!
            </div>
          </div>
        )}

        {/* Delete Button */}
        <button
          onClick={deleteAllProducts}
          disabled={loading || deleting || productCount === 0}
          className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-colors ${
            loading || deleting || productCount === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red hover:bg-red-dark'
          }`}
        >
          {deleting
            ? 'Deleting...'
            : productCount === 0
            ? 'No Products to Delete'
            : `Delete All ${productCount} Products`}
        </button>

        {/* Warning */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-red-600 text-xl">⚠️</div>
            <div className="flex-1 text-sm text-red-800">
              <div className="font-medium mb-1">Warning: This action cannot be undone!</div>
              <div>
                All product data including images, descriptions, and prices will be permanently removed
                from the database. Make sure you have backups if needed.
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="inline-flex items-center gap-2 text-blue hover:underline"
          >
            ← Back to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
