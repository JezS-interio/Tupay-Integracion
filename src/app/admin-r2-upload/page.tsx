'use client';

import { useState } from 'react';

export default function AdminR2UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    setUploading(true);
    setResult(null);

    try {
      const response = await fetch('/api/upload-to-r2', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Upload Images to R2
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Upload all images from public/images to Cloudflare R2
          </p>

          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              background: uploading ? '#9ca3af' : '#2563eb',
              color: 'white',
              fontWeight: 'bold',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: uploading ? 'not-allowed' : 'pointer',
            }}
          >
            {uploading ? 'Uploading...' : 'Start Upload'}
          </button>

          {uploading && (
            <div style={{ marginTop: '2rem' }}>
              <p style={{ color: '#2563eb', fontWeight: '600' }}>
                Uploading images... This may take a few minutes.
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
                  {result.success ? '✅ Upload Successful!' : '❌ Upload Failed'}
                </h2>

                {result.message && (
                  <p style={{ marginBottom: '1rem', color: result.success ? '#15803d' : '#b91c1c' }}>
                    {result.message}
                  </p>
                )}

                {result.results && (
                  <div>
                    <p style={{ fontWeight: '600' }}>
                      Total: {result.results.total} images
                    </p>
                    <p style={{ color: '#16a34a' }}>
                      ✓ Success: {result.results.success}
                    </p>
                    {result.results.failed > 0 && (
                      <p style={{ color: '#dc2626' }}>
                        ✗ Failed: {result.results.failed}
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
