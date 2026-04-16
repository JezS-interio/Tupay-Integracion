"use client";

import { useState } from "react";

export default function FixLoremIpsumPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFix = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/fix-lorem-ipsum", {
        method: "POST",
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">🔧 Fix Lorem Ipsum Content</h1>
          <p className="text-gray-600 mb-6">
            Find and fix all products with Lorem Ipsum or placeholder text in titles and descriptions
          </p>

          <button
            onClick={handleFix}
            disabled={loading}
            className="w-full bg-indigo-500 text-white py-4 px-6 rounded-lg font-bold text-lg
              hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "🔄 Fixing..." : "🔧 Fix All Lorem Ipsum Content"}
          </button>

          {result && (
            <div
              className={`mt-6 rounded-lg p-6 ${
                result.success
                  ? "bg-green-100 border border-green-400"
                  : "bg-red-100 border border-red-400"
              }`}
            >
              {result.success ? (
                <div>
                  <p className="text-green-800 font-semibold mb-3">
                    ✅ {result.message}
                  </p>
                  {result.fixedProducts && result.fixedProducts.length > 0 && (
                    <div className="bg-white rounded p-4 mb-3 max-h-96 overflow-y-auto">
                      <p className="font-semibold mb-2 text-sm">Fixed Products:</p>
                      <ul className="text-sm space-y-1">
                        {result.fixedProducts.map((title: string, idx: number) => (
                          <li key={idx} className="text-gray-700">
                            {idx + 1}. {title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-sm text-green-700">
                    Products have been updated with proper titles and descriptions!
                  </p>
                </div>
              ) : (
                <p className="text-red-800 font-semibold">
                  ❌ Error: {result.error || result.message}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold mb-2 text-sm">📌 What this does:</p>
            <ul className="text-sm space-y-1">
              <li>• Finds products with "Lorem Ipsum" in title or description</li>
              <li>• Generates proper titles based on brand and category</li>
              <li>• Creates meaningful descriptions for each product type</li>
              <li>• Updates Firestore permanently</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
