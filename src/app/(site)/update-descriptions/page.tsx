'use client';

import { useState } from 'react';
import { updateProductDescriptions } from '@/scripts/updateDescriptions';
import toast from 'react-hot-toast';

export default function UpdateDescriptionsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleUpdate = async () => {
    if (!confirm('This will update all product descriptions. Continue?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await updateProductDescriptions();
      setResult(res);

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      const errorMessage = `Update failed: ${error.message}`;
      setResult({ success: false, message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Update Product Descriptions
      </h1>

      <p style={{ marginBottom: '2rem', color: '#666' }}>
        This will replace Lorem Ipsum placeholder text with actual product descriptions.
      </p>

      <button
        onClick={handleUpdate}
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
        {loading ? 'Updating...' : 'Update Product Descriptions'}
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
    </div>
  );
}
