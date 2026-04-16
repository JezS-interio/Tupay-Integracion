'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/orders', label: 'Orders', icon: '📦' },
    { href: '/admin/users', label: 'Customers', icon: '👥' },
    { href: '/admin/products', label: 'Products', icon: '🏷️' },
    { href: '/admin/edit-products', label: 'Edit Products', icon: '✏️' },
    { href: '/admin/products/new', label: 'Add Product', icon: '➕' },
    { href: '/admin/banners', label: 'Banners', icon: '🎨' },
    { href: '/admin/create-default-banners', label: 'Create Banners', icon: '🎯' },
    { href: '/admin/bulk-import', label: 'Bulk Import', icon: '📦' },
    { href: '/admin/delete-products', label: 'Delete All', icon: '🗑️' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-dark text-white shadow-lg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Intitech Admin</h1>
              <p className="text-sm text-gray-300">Product Management System</p>
            </div>
            <Link
              href="/"
              className="bg-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-colors ${
                  isActive(item.href)
                    ? 'text-blue border-b-2 border-blue'
                    : 'text-gray-600 hover:text-dark hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
