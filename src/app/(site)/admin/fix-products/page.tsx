"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function FixProductsPage() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");

  const addLog = (message: string) => {
    setLog((prev) => prev + message + "\n");
    console.log(message);
  };

  const handleFix = async () => {
    setLoading(true);
    setLog("");

    addLog("🔧 Starting product data fix...\n");

    try {
      const snapshot = await getDocs(collection(db, "products"));
      addLog(`📦 Found ${snapshot.docs.length} products\n`);

      let fixedCount = 0;
      let skippedCount = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const productId = docSnap.id;

        addLog(`[${fixedCount + skippedCount + 1}/${snapshot.docs.length}] Processing: ${data.title}`);

        // Check if product needs fixing
        const needsFix = !data.imgs || !data.imgs.previews;

        if (!needsFix) {
          addLog(`  ✓ Already has correct structure\n`);
          skippedCount++;
          continue;
        }

        // Fix the data structure
        const updates: any = {};

        // If has old 'images' array, convert to imgs.previews
        if (data.images && Array.isArray(data.images)) {
          updates.imgs = {
            previews: data.images
          };
          addLog(`  → Converting 'images' array to 'imgs.previews'`);
        }
        // If has no images at all, add empty structure
        else {
          updates.imgs = {
            previews: []
          };
          addLog(`  → Adding empty imgs structure`);
        }

        // Ensure other required fields exist
        if (typeof data.id !== 'number') {
          updates.id = Date.now() + Math.floor(Math.random() * 1000);
          addLog(`  → Adding numeric ID`);
        }

        if (typeof data.rating === 'string') {
          updates.rating = parseFloat(data.rating);
          addLog(`  → Converting rating to number`);
        }

        if (data.isActive === undefined) {
          updates.isActive = true;
          addLog(`  → Setting isActive: true`);
        }

        // Update the document
        await updateDoc(doc(db, "products", productId), updates);
        addLog(`  ✅ Fixed!\n`);
        fixedCount++;
      }

      addLog(`\n${"=".repeat(60)}`);
      addLog(`🎉 COMPLETE!`);
      addLog(`${"=".repeat(60)}`);
      addLog(`✅ Fixed: ${fixedCount} products`);
      addLog(`⏭️  Skipped: ${skippedCount} products (already correct)`);
      addLog(`📊 Total: ${snapshot.docs.length} products\n`);
      addLog(`✨ All products now have the correct data structure!`);
      addLog(`🔄 Refresh your site to see the changes.`);

    } catch (error: any) {
      addLog(`\n❌ Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-red-600">🔧 Fix Product Data Structure</h1>
        <p className="text-gray-600 mb-6">
          This will update ALL products in Firestore to have the correct image structure
        </p>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <h3 className="font-semibold text-red-900 mb-2">⚠️ What This Does:</h3>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• Converts old `images` array to `imgs.previews` structure</li>
            <li>• Adds missing `id` fields</li>
            <li>• Converts string ratings to numbers</li>
            <li>• Sets `isActive: true` for all products</li>
            <li>• Safe to run multiple times</li>
          </ul>
        </div>

        <button
          onClick={handleFix}
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 active:bg-red-800"
          }`}
        >
          {loading ? "Fixing Products..." : "🔧 Fix All Products Now"}
        </button>

        {log && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Fix Log:</h3>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
              {log}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
