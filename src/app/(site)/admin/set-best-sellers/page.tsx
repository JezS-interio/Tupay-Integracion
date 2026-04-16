"use client";
import { useState } from "react";

export default function SetBestSellersPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSetBestSellers = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/set-best-sellers", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}\n\nBest Sellers:\n${data.bestSellers.map((p: any) => `- ${p.title}`).join('\n')}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">Set Best Sellers</h1>

          <p className="text-gray-600 mb-6">
            This will automatically select 5 products and mark them as best sellers.
          </p>

          <button
            onClick={handleSetBestSellers}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Setting Best Sellers..." : "Set 5 Best Sellers"}
          </button>

          {message && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{message}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
