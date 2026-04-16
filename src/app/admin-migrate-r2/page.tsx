'use client';

import { useState } from 'react';

export default function MigrateToR2Page() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleMigrate = async () => {
    if (!confirm('Are you sure you want to migrate all product images to use R2 URLs? This will update all products in Firestore.')) {
      return;
    }

    setMigrating(true);
    setResult(null);

    try {
      const response = await fetch('/api/migrate-to-r2', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
      });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Migrate Products to R2
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Update all product images in Firestore to use Cloudflare R2 URLs
          </p>

          <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
              <strong>⚠️ Warning:</strong> This will update all products in your Firestore database.
              Make sure you have a backup before proceeding.
            </p>
          </div>

          <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>What this does:</h3>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#4b5563' }}>
              <li>Reads all products from Firestore</li>
              <li>Converts local image paths (/images/...) to R2 URLs</li>
              <li>Updates product documents in Firestore</li>
              <li>Skips products already using R2 URLs</li>
            </ul>
          </div>

          <button
            onClick={handleMigrate}
            disabled={migrating}
            style={{
              background: migrating ? '#9ca3af' : '#dc2626',
              color: 'white',
              fontWeight: 'bold',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: migrating ? 'not-allowed' : 'pointer',
            }}
          >
            {migrating ? 'Migrating...' : 'Start Migration'}
          </button>

          {migrating && (
            <div style={{ marginTop: '2rem' }}>
              <p style={{ color: '#dc2626', fontWeight: '600' }}>
                Migrating products... Please wait...
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
                  {result.success ? '✅ Migration Successful!' : '❌ Migration Failed'}
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
                      ✅ Updated: {result.results.updated}
                    </p>
                    <p style={{ color: '#6b7280' }}>
                      ⏭️ Skipped: {result.results.skipped}
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

                {result.results?.errors && result.results.errors.length > 0 && (
                  <details style={{ marginTop: '1rem' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#dc2626' }}>
                      View errors ({result.results.errors.length})
                    </summary>
                    <div style={{ marginTop: '0.5rem', maxHeight: '12rem', overflowY: 'auto', background: 'white', padding: '0.75rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                      {result.results.errors.map((error: string, index: number) => (
                        <div key={index} style={{ color: '#dc2626', marginBottom: '0.25rem' }}>
                          • {error}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
