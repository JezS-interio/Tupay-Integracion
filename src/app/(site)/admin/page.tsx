'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAllProducts } from '@/lib/firebase/products';
import { getOrderStats } from '@/lib/firebase/orders';
import { getAllUserProfiles } from '@/lib/firebase/users';
import { FirestoreProduct } from '@/types/product';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    newArrivals: 0,
    bestSellers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [products, orderStats, users] = await Promise.all([
          fetchAllProducts(),
          getOrderStats(),
          getAllUserProfiles(),
        ]);

        setStats({
          totalProducts: products.length,
          activeProducts: products.filter(p => p.isActive).length,
          featuredProducts: products.filter(p => p.isFeatured).length,
          newArrivals: products.filter(p => p.isNewArrival).length,
          bestSellers: products.filter(p => p.isBestSeller).length,
          totalOrders: orderStats.totalOrders,
          pendingOrders: orderStats.pendingOrders,
          totalRevenue: orderStats.totalRevenue,
          totalCustomers: users.length,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: '💰', color: 'green' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'blue' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: 'yellow' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: '👥', color: 'purple' },
    { label: 'Total Products', value: stats.totalProducts, icon: '🏷️', color: 'blue' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-dark mb-2">Dashboard</h2>
        <p className="text-gray-600">Welcome to your product management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-md p-6 border-l-4"
            style={{
              borderLeftColor:
                stat.color === 'blue'
                  ? '#3C50E0'
                  : stat.color === 'green'
                  ? '#10B981'
                  : stat.color === 'yellow'
                  ? '#F59E0B'
                  : stat.color === 'purple'
                  ? '#8B5CF6'
                  : '#EF4444',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{stat.icon}</span>
              <span className="text-3xl font-bold text-dark">
                {loading ? '...' : stat.value}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/orders"
          className="bg-blue text-white rounded-lg shadow-md p-6 hover:bg-blue-600 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">📦</div>
            <div>
              <h3 className="text-xl font-bold mb-1">Manage Orders</h3>
              <p className="text-blue-100">View and process customer orders</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="bg-purple-500 text-white rounded-lg shadow-md p-6 hover:bg-purple-600 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">👥</div>
            <div>
              <h3 className="text-xl font-bold mb-1">Customers</h3>
              <p className="text-purple-100">View registered customers</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-6 hover:border-blue transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">🏷️</div>
            <div>
              <h3 className="text-xl font-bold text-dark mb-1">Manage Products</h3>
              <p className="text-gray-600">View, edit, and delete products</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/edit-products"
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md p-6 hover:from-blue-600 hover:to-purple-600 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">✏️</div>
            <div>
              <h3 className="text-xl font-bold mb-1">Edit Products</h3>
              <p className="text-blue-50">Edit titles & descriptions one by one</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/create-default-banners"
          className="bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg shadow-md p-6 hover:from-pink-600 hover:to-orange-600 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">🎯</div>
            <div>
              <h3 className="text-xl font-bold mb-1">Create Hero Banners</h3>
              <p className="text-pink-50">Generate 3 carousel banners from products</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/products/new"
          className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-6 hover:border-blue transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">➕</div>
            <div>
              <h3 className="text-xl font-bold text-dark mb-1">Add Product</h3>
              <p className="text-gray-600">Upload images and create a new product</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/banners"
          className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-6 hover:border-blue transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">🎨</div>
            <div>
              <h3 className="text-xl font-bold text-dark mb-1">Banners</h3>
              <p className="text-gray-600">Manage homepage banners</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/quick-add-banners"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-md p-6 hover:from-purple-600 hover:to-pink-600 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">🎨</div>
            <div>
              <h3 className="text-xl font-bold mb-1">Quick Add Banners</h3>
              <p className="text-purple-50">Upload banner images instantly</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/auto-feature"
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-md p-6 hover:from-yellow-500 hover:to-orange-600 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">⭐</div>
            <div>
              <h3 className="text-xl font-bold mb-1">Auto-Feature Products</h3>
              <p className="text-yellow-50">One-click: feature 8 random products</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin-migrate"
          className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-6 hover:border-blue transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">🚀</div>
            <div>
              <h3 className="text-xl font-bold text-dark mb-1">Image Migration</h3>
              <p className="text-gray-600">Upload images to cloud storage</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/add-products-images"
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-md p-6 hover:from-green-600 hover:to-blue-600 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">🚀</div>
            <div>
              <h3 className="text-xl font-bold mb-1">Upload All Products</h3>
              <p className="text-green-50">Upload all images - auto-detects phones & appliances</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
