'use client';

import { useState } from 'react';

export default function ImportProductsPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    if (!confirm('Import all products from products-import.json with R2 image URLs?')) {
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const response = await fetch('/api/import-products', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Import Products with R2 URLs
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Import products from products-import.json and automatically use Cloudflare R2 URLs for images
          </p>

          <div style={{ background: '#eff6ff', border: '1px solid #3b82f6', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
              <strong>ℹ️ Info:</strong> This will import all products with R2 image URLs automatically.
              All images will point to your Cloudflare R2 bucket.
            </p>
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            style={{
              background: importing ? '#9ca3af' : '#2563eb',
              color: 'white',
              fontWeight: 'bold',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: importing ? 'not-allowed' : 'pointer',
            }}
          >
            {importing ? 'Importing...' : 'Import Products'}
          </button>

          {importing && (
            <div style={{ marginTop: '2rem' }}>
              <p style={{ color: '#2563eb', fontWeight: '600' }}>
                Importing products... Please wait...
              </p>
            </div>
          )}

          {result && (
            <div style={{ marginTop: '2rem' }}>
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  background: result.success ? '#f0fdf4' : '#fef2f2',
                  border: result.success ? '1px solid #86efac' : '1px solid #fca5a5',
                }}
              >
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: result.success ? '#166534' : '#991b1b' }}>
                  {result.success ? '✅ Import Successful!' : '❌ Import Failed'}
                </h2>

                {result.message && (
                  <p style={{ marginBottom: '1rem', color: result.success ? '#15803d' : '#b91c1c' }}>
                    {result.message}
                  </p>
                )}

                {result.results && (
                  <div>
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                      Total products: {result.results.total}
                    </p>
                    <p style={{ color: '#16a34a' }}>
                      ✅ Imported: {result.results.imported}
                    </p>
                    {result.results.failed > 0 && (
                      <p style={{ color: '#dc2626' }}>
                        ❌ Failed: {result.results.failed}
                      </p>
                    )}
                  </div>
                )}

                {result.error && (
                  <p style={{ color: '#dc2626', marginTop: '1rem' }}>
                    Error: {result.error}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
