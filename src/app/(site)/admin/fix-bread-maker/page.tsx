"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

export default function FixBreadMakerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleFix = async () => {
    setLoading(true);
    setResult("Searching for misclassified bread maker...\n");

    try {
      // Find products with "mixer" in title that might be bread makers
      const productsRef = collection(db, "products");
      const snapshot = await getDocs(productsRef);

      let fixed = 0;

      for (const docSnap of snapshot.docs) {
        const product = docSnap.data();
        const title = product.title?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";

        // Check if it's labeled as mixer but description mentions bread maker
        if (
          title.includes("mixer") &&
          (description.includes("mixing dough") || description.includes("baking"))
        ) {
          setResult((prev) => prev + `\nFound: ${product.title}\n`);
          setResult((prev) => prev + `Checking image URL...\n`);

          // Check if image URL suggests it's a bread maker
          const imageUrl = product.imgs?.previews?.[0] || "";
          if (imageUrl.includes("bread-maker") || imageUrl.includes("bread")) {
            setResult((prev) => prev + `✅ Confirmed: This is a bread maker!\n`);
            setResult((prev) => prev + `Fixing...\n`);

            // Extract brand from current title
            const brand = product.title.split(" ")[0]; // e.g., "Cuisinart"

            // Update the product
            await updateDoc(doc(db, "products", docSnap.id), {
              title: `${brand} Automatic Bread Maker`,
              category: "Kitchen Appliances",
              description: `The ${brand} automatic bread maker makes fresh homemade bread effortless. Features programmable settings, multiple loaf sizes, and crust color options. Perfect for baking bread, dough, jam, and more with one-touch convenience.`,
            });

            setResult((prev) => prev + `✅ Fixed: ${brand} Automatic Bread Maker\n`);
            fixed++;
          }
        }
      }

      if (fixed === 0) {
        setResult((prev) => prev + "\n⚠️ No misclassified bread makers found.\n");
      } else {
        setResult((prev) => prev + `\n🎉 Fixed ${fixed} product(s)!\n`);
        setResult((prev) => prev + `\nRefresh homepage to see changes.`);
      }
    } catch (error: any) {
      setResult((prev) => prev + `\n❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">🍞 Fix Bread Maker Product</h1>
          <p className="text-gray-600 mb-6">
            Find and fix the misclassified bread maker product
          </p>

          <button
            onClick={handleFix}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold
              hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {loading ? "🔍 Searching & Fixing..." : "🔧 Find & Fix Bread Maker"}
          </button>

          {result && (
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
