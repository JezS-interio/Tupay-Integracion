'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchAllProducts, deleteProduct } from '@/lib/firebase/products';
import { FirestoreProduct } from '@/types/product';
import toast from 'react-hot-toast';

export default function ProductsListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const success = await deleteProduct(String(id));

      if (success) {
        toast.success('Product deleted successfully');
        loadProducts(); // Reload the list
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && product.isActive) ||
      (filter === 'inactive' && !product.isActive);

    const matchesSearch =
      search === '' ||
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-dark mb-2">Products</h2>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-4 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue text-white'
                  : 'bg-gray-1 text-dark hover:bg-gray-2'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-blue text-white'
                  : 'bg-gray-1 text-dark hover:bg-gray-2'
              }`}
            >
              Active ({products.filter((p) => p.isActive).length})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'inactive'
                  ? 'bg-blue text-white'
                  : 'bg-gray-1 text-dark hover:bg-gray-2'
              }`}
            >
              Inactive ({products.filter((p) => !p.isActive).length})
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-dark">Loading products...</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-dark mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            {search
              ? 'Try adjusting your search'
              : 'Get started by adding your first product'}
          </p>
          {!search && (
            <Link
              href="/admin/products/new"
              className="inline-block bg-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Add Product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-dark">
                    Product
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-dark">
                    Category
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-dark">
                    Price
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-dark">
                    Stock
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-dark">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 font-semibold text-dark">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {product.imgs?.thumbnails?.[0] ? (
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Image
                              src={product.imgs.thumbnails[0]}
                              alt={product.title}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-400">📷</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-dark truncate">
                            {product.title}
                          </div>
                          <div className="text-sm text-gray-500">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-2 py-1 bg-blue-50 text-blue rounded text-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-dark">
                        ${product.discountedPrice.toFixed(2)}
                      </div>
                      {product.price !== product.discountedPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          ${product.price.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-sm ${
                          product.stock > 10
                            ? 'bg-green-50 text-green-600'
                            : product.stock > 0
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        {product.isActive ? (
                          <span className="inline-flex px-2 py-1 bg-green-50 text-green-600 rounded text-sm">
                            ✓ Active
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                            Inactive
                          </span>
                        )}
                        <div className="flex gap-1">
                          {product.isFeatured && (
                            <span className="text-xs text-yellow-600">⭐</span>
                          )}
                          {product.isNewArrival && (
                            <span className="text-xs text-purple-600">🆕</span>
                          )}
                          {product.isBestSeller && (
                            <span className="text-xs text-red-600">🔥</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="px-3 py-1.5 bg-blue text-white rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.title)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
