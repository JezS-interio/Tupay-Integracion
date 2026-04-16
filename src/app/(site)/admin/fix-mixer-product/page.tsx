"use client";

import { useState } from "react";

export default function FixMixerProductPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFix = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/fix-mixer-to-breadmaker", {
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
          <h1 className="text-3xl font-bold mb-2">🍞 Fix Mixer → Bread Maker</h1>
          <p className="text-gray-600 mb-6">
            Convert "Cuisinart Electric Mixer Pro" to "Cuisinart Automatic Bread Maker"
          </p>

          <button
            onClick={handleFix}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 px-6 rounded-lg font-bold text-lg
              hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "🔧 Fixing..." : "🔧 Fix Product Now"}
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
                  <p className="text-green-800 font-semibold mb-2">
                    ✅ {result.message}
                  </p>
                  <p className="text-sm text-green-700 mt-3">
                    Now refresh the{" "}
                    <a href="/" className="underline font-semibold">
                      Homepage
                    </a>{" "}
                    (Ctrl+Shift+R) to see the updated banner!
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
            <p className="font-semibold mb-2 text-sm">What this fixes:</p>
            <ul className="text-sm space-y-1">
              <li>• Changes title from "Electric Mixer Pro" to "Automatic Bread Maker"</li>
              <li>• Updates description to talk about baking bread</li>
              <li>• Keeps the same image and price</li>
              <li>• Updates in Firestore permanently</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
