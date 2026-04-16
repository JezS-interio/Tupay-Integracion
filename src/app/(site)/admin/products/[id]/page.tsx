'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageUpload from '@/components/Admin/ImageUpload';
import { fetchProductById, updateProduct } from '@/lib/firebase/products';
import { FirestoreProduct } from '@/types/product';
import toast from 'react-hot-toast';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountedPrice: '',
    category: '',
    stock: '',
    sku: '',
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
  });

  const [images, setImages] = useState({
    thumbnail1: '',
    thumbnail2: '',
    preview1: '',
    preview2: '',
  });

  const categories = [
    'Accessories',
    'Smartphones',
    'Computers',
    'Wearables',
    'Tablets',
    'Networking',
    'Electronics',
  ];

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const product = await fetchProductById(productId);

      if (!product) {
        toast.error('Product not found');
        router.push('/admin/products');
        return;
      }

      setFormData({
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        discountedPrice: product.discountedPrice.toString(),
        category: product.category,
        stock: product.stock.toString(),
        sku: product.sku,
        isActive: product.isActive,
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false,
        isBestSeller: product.isBestSeller || false,
      });

      setImages({
        thumbnail1: product.imgs?.thumbnails?.[0] || '',
        thumbnail2: product.imgs?.thumbnails?.[1] || '',
        preview1: product.imgs?.previews?.[0] || '',
        preview2: product.imgs?.previews?.[1] || '',
      });
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.price) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Prepare product data
      const thumbnails = [images.thumbnail1, images.thumbnail2].filter(Boolean);
      const previews = [images.preview1, images.preview2].filter(Boolean);

      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const updates = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice
          ? parseFloat(formData.discountedPrice)
          : parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        sku: formData.sku,
        slug,
        imgs: {
          thumbnails,
          previews,
        },
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isBestSeller: formData.isBestSeller,
      };

      // Update product in Firestore
      const success = await updateProduct(productId, updates);

      if (success) {
        toast.success('Product updated successfully!');
        router.push('/admin/products');
      } else {
        toast.error('Failed to update product');
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-dark">Loading product...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-dark mb-2">Edit Product</h2>
        <p className="text-gray-600">Update product details and images</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-dark mb-4">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-2">
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                placeholder="e.g., iPhone 14 Pro Max"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                placeholder="Product description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Discounted Price (Optional)
              </label>
              <input
                type="number"
                name="discountedPrice"
                value={formData.discountedPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-2">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-dark mb-4">Product Images</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload
              label="Thumbnail Image 1"
              storagePath="products/thumbnails"
              currentImage={images.thumbnail1}
              onUpload={(url) => setImages((prev) => ({ ...prev, thumbnail1: url }))}
            />

            <ImageUpload
              label="Thumbnail Image 2"
              storagePath="products/thumbnails"
              currentImage={images.thumbnail2}
              onUpload={(url) => setImages((prev) => ({ ...prev, thumbnail2: url }))}
            />

            <ImageUpload
              label="Preview Image 1"
              storagePath="products/previews"
              currentImage={images.preview1}
              onUpload={(url) => setImages((prev) => ({ ...prev, preview1: url }))}
            />

            <ImageUpload
              label="Preview Image 2"
              storagePath="products/previews"
              currentImage={images.preview2}
              onUpload={(url) => setImages((prev) => ({ ...prev, preview2: url }))}
            />
          </div>
        </div>

        {/* Product Flags */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-dark mb-4">Product Settings</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-3 text-blue focus:ring-blue"
              />
              <span className="font-medium text-dark">Active (Visible in store)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-3 text-blue focus:ring-blue"
              />
              <span className="font-medium text-dark">Featured Product</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isNewArrival"
                checked={formData.isNewArrival}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-3 text-blue focus:ring-blue"
              />
              <span className="font-medium text-dark">New Arrival</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isBestSeller"
                checked={formData.isBestSeller}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-3 text-blue focus:ring-blue"
              />
              <span className="font-medium text-dark">Best Seller</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Updating Product...' : 'Update Product'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-6 py-3 border border-gray-3 rounded-lg font-medium text-dark hover:bg-gray-1 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
