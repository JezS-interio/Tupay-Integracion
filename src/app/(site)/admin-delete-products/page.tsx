"use client";
import { useState } from "react";

export default function DeleteProductsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleDelete = async () => {
    if (!confirm("⚠️ Are you sure you want to DELETE ALL PRODUCTS? This cannot be undone!")) {
      return;
    }

    if (!confirm("⚠️ FINAL WARNING: This will permanently delete all 49 products from Firebase. Continue?")) {
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/delete-all-products", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setResult(`✅ Success! Deleted ${data.deletedCount} products from Firebase.`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          ⚠️ Delete All Products
        </h1>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700 font-semibold">WARNING:</p>
          <p className="text-red-600 mt-2">
            This will permanently delete ALL products from your Firebase database.
            This action CANNOT be undone!
          </p>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">Current products to be deleted:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>49 DummyJSON products</li>
            <li>All product images references (R2 images will remain)</li>
            <li>All categories and metadata</li>
          </ul>
        </div>

        <button
          onClick={handleDelete}
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Deleting..." : "Delete All Products"}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.includes("✅") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            <strong>Next steps after deletion:</strong>
          </p>
          <ol className="list-decimal list-inside text-sm text-gray-600 mt-2 space-y-1">
            <li>Run the TechSpecs API import script</li>
            <li>Verify new products in Firebase</li>
            <li>Check that images are uploaded to R2</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
