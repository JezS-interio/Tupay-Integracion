'use client';

import { useState } from 'react';
import { migrateProducts } from '@/scripts/migrateProducts';
import toast from 'react-hot-toast';

export default function MigrateProductsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleMigration = async () => {
    if (!confirm('This will upload 8 products to Firestore. Continue?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await migrateProducts();
      setResult(res);

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      const errorMessage = `Migration failed: ${error.message}`;
      setResult({ success: false, message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Product Migration
      </h1>

      <p style={{ marginBottom: '2rem', color: '#666' }}>
        This page will migrate your 8 static products to Firestore. Run this ONCE to populate your database.
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          What will be migrated:
        </h2>
        <ul style={{ listStyle: 'disc', paddingLeft: '2rem', color: '#666' }}>
          <li>8 products from shopData.ts</li>
          <li>Auto-generated descriptions</li>
          <li>Categories based on product titles</li>
          <li>SKUs and slugs</li>
          <li>Stock levels (random 10-60)</li>
          <li>Featured/Best Seller/New Arrival flags</li>
        </ul>
      </div>

      <button
        onClick={handleMigration}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#3C50E0',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          border: 'none',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '2rem',
        }}
      >
        {loading ? 'Migrating...' : 'Migrate Products to Firestore'}
      </button>

      {result && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
            color: result.success ? '#155724' : '#721c24',
          }}
        >
          <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            {result.success ? '✅ Success!' : '❌ Error'}
          </h3>
          <p>{result.message}</p>
        </div>
      )}

      {result?.success && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Next Steps:
          </h3>
          <ol style={{ listStyle: 'decimal', paddingLeft: '2rem', color: '#666' }}>
            <li>Check Firebase Console to verify products</li>
            <li>Update shop pages to use Firestore data</li>
            <li>Test product browsing and filtering</li>
            <li>Delete this page (it's only needed once)</li>
          </ol>
        </div>
      )}
    </div>
  );
}
