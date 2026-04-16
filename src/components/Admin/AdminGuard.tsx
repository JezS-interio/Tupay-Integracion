'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { getUserProfile } from '@/lib/firebase/users';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isLocalhost, setIsLocalhost] = useState(true);

  useEffect(() => {
    // Check if running on localhost/development
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' ||
                    hostname === '127.0.0.1' ||
                    hostname === '[::1]' ||
                    hostname.endsWith('.local');

    setIsLocalhost(isLocal);

    if (!isLocal) {
      setChecking(false);
      return;
    }

    const checkAdminAccess = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;

      // Not logged in - redirect to login
      if (!user) {
        router.push('/signin?redirect=/admin');
        return;
      }

      try {
        // Get user profile to check admin status
        const profile = await getUserProfile(user.uid);

        if (profile?.isAdmin) {
          setIsAdmin(true);
          setChecking(false);
        } else {
          setIsAdmin(false);
          setChecking(false);
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
        setChecking(false);
      }
    };

    checkAdminAccess();
  }, [user, authLoading, router]);

  // Show loading while checking auth
  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-2">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not on localhost - show 404 (don't reveal admin exists)
  if (!isLocalhost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-2">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">404</div>
          <h2 className="text-2xl font-bold text-dark mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            The page you are looking for does not exist.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue text-white py-3 px-6 rounded-lg hover:bg-blue-dark transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Not an admin - show 404 (don't reveal admin exists even on localhost)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-2">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">404</div>
          <h2 className="text-2xl font-bold text-dark mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            The page you are looking for does not exist.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue text-white py-3 px-6 rounded-lg hover:bg-blue-dark transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Is admin on localhost - render children
  return <>{children}</>;
}
