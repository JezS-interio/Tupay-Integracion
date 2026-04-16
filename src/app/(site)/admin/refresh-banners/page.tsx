"use client";

import { useState } from "react";

export default function RefreshBannersPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRefresh = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/refresh-banners", {
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">🔄 Refresh Homepage Banners</h1>
          <p className="text-gray-600 mb-6">
            Delete old banners and create new ones with latest product data
          </p>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="w-full bg-purple-500 text-white py-4 px-6 rounded-lg font-bold text-lg
              hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "🔄 Refreshing..." : "🔄 Refresh Banners Now"}
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
                  {result.banners && (
                    <div className="bg-white rounded p-4 mb-3">
                      <p className="font-semibold mb-2 text-sm">New Banners:</p>
                      <ul className="text-sm space-y-1">
                        {result.banners.map((b: any, idx: number) => (
                          <li key={idx} className="text-gray-700">
                            {b.order}. {b.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-sm text-green-700">
                    Go to{" "}
                    <a href="/" className="underline font-semibold">
                      Homepage
                    </a>{" "}
                    and refresh (Ctrl+Shift+R) to see updated banners!
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
              <li>• Deletes all current banners</li>
              <li>• Creates 3 new banners from featured products</li>
              <li>• Uses the latest product titles and descriptions</li>
              <li>• Fixes the bread maker banner automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
