'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchBanners, deleteBanner } from '@/lib/firebase/banners';
import { Banner } from '@/types/banner';
import toast from 'react-hot-toast';

export default function BannersListPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const data = await fetchBanners(false);
      setBanners(data);
    } catch (error) {
      console.error('Error loading banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const success = await deleteBanner(id);

      if (success) {
        toast.success('Banner deleted successfully');
        loadBanners();
      } else {
        toast.error('Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Error deleting banner');
    }
  };

  const filteredBanners = banners.filter((banner) => {
    if (filter === 'all') return true;
    if (filter === 'active') return banner.isActive;
    if (filter === 'inactive') return !banner.isActive;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-dark mb-2">Hero Banners</h2>
          <p className="text-gray-600">Manage your homepage hero banners</p>
        </div>

        <Link
          href="/admin/banners/new"
          className="bg-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Add Banner
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue text-white'
                : 'bg-gray-1 text-dark hover:bg-gray-2'
            }`}
          >
            All ({banners.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-blue text-white'
                : 'bg-gray-1 text-dark hover:bg-gray-2'
            }`}
          >
            Active ({banners.filter((b) => b.isActive).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'inactive'
                ? 'bg-blue text-white'
                : 'bg-gray-1 text-dark hover:bg-gray-2'
            }`}
          >
            Inactive ({banners.filter((b) => !b.isActive).length})
          </button>
        </div>
      </div>

      {/* Banners List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-dark">Loading banners...</div>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-bold text-dark mb-2">No banners found</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first hero banner
          </p>
          <Link
            href="/admin/banners/new"
            className="inline-block bg-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Add Banner
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-lg shadow-md overflow-hidden flex"
            >
              {/* Banner Preview */}
              <div className="relative w-80 h-48 flex-shrink-0 bg-gray-100">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
                {banner.badge && (
                  <div className="absolute top-4 left-4 bg-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                    {banner.badge}
                  </div>
                )}
              </div>

              {/* Banner Info */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-dark mb-2">
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-gray-600 mb-2">{banner.subtitle}</p>
                    )}
                    {banner.description && (
                      <p className="text-sm text-gray-500 mb-3">
                        {banner.description}
                      </p>
                    )}
                    {banner.buttonText && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Button:</span>
                        <span className="text-blue">{banner.buttonText}</span>
                        {banner.buttonLink && (
                          <span className="text-gray-400">
                            → {banner.buttonLink}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        banner.isActive
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {banner.isActive ? '✓ Active' : 'Inactive'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Order: {banner.order}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Created: {new Date(banner.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/banners/${banner.id}`}
                      className="px-4 py-2 bg-blue text-white rounded hover:bg-blue-600 transition-colors text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(banner.id, banner.title)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
