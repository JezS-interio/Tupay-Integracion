"use client";

import { useState } from "react";

export default function CreateDefaultBannersPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCreate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/create-default-banners", {
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
          <h1 className="text-3xl font-bold mb-2">🎨 Create Default Banners</h1>
          <p className="text-gray-600 mb-6">
            Auto-generate 3 banners from your featured products
          </p>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="font-semibold mb-2">📌 What this does:</p>
              <ul className="text-sm space-y-1">
                <li>• Picks 3 featured products</li>
                <li>• Creates carousel banners with product images</li>
                <li>• Adds titles, prices, and "Shop Now" buttons</li>
                <li>• Fills the big empty box on homepage</li>
              </ul>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-lg font-bold text-lg
                hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all shadow-lg"
            >
              {loading ? "⏳ Creating Banners..." : "🎨 Create 3 Banners"}
            </button>

            {result && (
              <div
                className={`rounded-lg p-6 ${
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
                      <div className="bg-white rounded p-4">
                        <p className="font-semibold mb-2 text-sm">Created Banners:</p>
                        <ul className="text-sm space-y-1">
                          {result.banners.map((b: any, idx: number) => (
                            <li key={idx} className="text-gray-700">
                              {b.order}. {b.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-sm text-green-700 mt-4">
                      Go to{" "}
                      <a href="/" className="underline font-semibold">
                        Homepage
                      </a>{" "}
                      and refresh (Ctrl+Shift+R) to see them!
                    </p>
                  </div>
                ) : (
                  <p className="text-red-800 font-semibold">
                    ❌ Error: {result.error || result.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
