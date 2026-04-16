'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageUpload from '@/components/Admin/ImageUpload';
import { fetchBannerById, updateBanner } from '@/lib/firebase/banners';
import toast from 'react-hot-toast';

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    badge: '',
    isActive: true,
    order: 1,
  });

  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    loadBanner();
  }, [bannerId]);

  const loadBanner = async () => {
    try {
      const banner = await fetchBannerById(bannerId);

      if (!banner) {
        toast.error('Banner not found');
        router.push('/admin/banners');
        return;
      }

      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        buttonText: banner.buttonText || '',
        buttonLink: banner.buttonLink || '',
        badge: banner.badge || '',
        isActive: banner.isActive,
        order: banner.order,
      });

      setImageUrl(banner.imageUrl);
    } catch (error) {
      console.error('Error loading banner:', error);
      toast.error('Failed to load banner');
    } finally {
      setLoadingBanner(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
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
      if (!formData.title) {
        toast.error('Please enter a banner title');
        setLoading(false);
        return;
      }

      if (!imageUrl) {
        toast.error('Please upload a banner image');
        setLoading(false);
        return;
      }

      const updates = {
        ...formData,
        imageUrl,
      };

      const success = await updateBanner(bannerId, updates);

      if (success) {
        toast.success('Banner updated successfully!');
        router.push('/admin/banners');
      } else {
        toast.error('Failed to update banner');
      }
    } catch (error: any) {
      console.error('Error updating banner:', error);
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingBanner) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-dark">Loading banner...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-dark mb-2">Edit Banner</h2>
        <p className="text-gray-600">Update banner content and settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Image */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-dark mb-4">Banner Image</h3>
          <ImageUpload
            label="Hero Banner Image (Recommended: 1920x600px)"
            storagePath="banners"
            currentImage={imageUrl}
            onUpload={(url) => setImageUrl(url)}
          />
        </div>

        {/* Banner Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-dark mb-4">Banner Content</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                placeholder="e.g., True Wireless Noise Cancelling Headphone"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-2">
                Subtitle (Optional)
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                placeholder="e.g., Premium Audio Experience"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                placeholder="Brief description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Badge (Optional)
              </label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                placeholder="e.g., 30% Off, New Arrival"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="1"
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                placeholder="1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Lower numbers appear first in the carousel
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-dark mb-4">
            Call to Action (Optional)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Button Text
              </label>
              <input
                type="text"
                name="buttonText"
                value={formData.buttonText}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                placeholder="e.g., Shop Now"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Button Link
              </label>
              <input
                type="text"
                name="buttonLink"
                value={formData.buttonLink}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-5 outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                placeholder="e.g., /shop"
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-dark mb-4">Settings</h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-3 text-blue focus:ring-blue"
            />
            <span className="font-medium text-dark">
              Active (Display on homepage)
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Updating Banner...' : 'Update Banner'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/banners')}
            className="px-6 py-3 border border-gray-3 rounded-lg font-medium text-dark hover:bg-gray-1 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
