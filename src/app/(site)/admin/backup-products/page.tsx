"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export default function BackupProductsPage() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");

  const addLog = (message: string) => {
    setLog((prev) => prev + message + "\n");
  };

  const handleBackup = async () => {
    setLoading(true);
    setLog("");

    addLog("🔥 Starting backup...");

    try {
      const snapshot = await getDocs(collection(db, "products"));
      const products: any[] = [];

      snapshot.forEach((doc) => {
        products.push({
          firestoreId: doc.id,
          ...doc.data(),
        });
      });

      addLog(`📦 Found ${products.length} products`);

      // Create JSON file
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `firestore-backup-${timestamp}.json`;
      const json = JSON.stringify(products, null, 2);

      // Create download link
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      addLog(`✅ Backup complete!`);
      addLog(`📁 File: ${filename}`);
      addLog(`💾 Downloaded to your Downloads folder`);
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Backup Products</h1>
        <p className="text-gray-600 mb-6">
          Download all products from Firestore as a JSON backup file
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important:</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• This will download all products as a JSON file</li>
            <li>• Always backup before making major changes</li>
            <li>• The file will be saved to your Downloads folder</li>
            <li>• Keep this backup in a safe place</li>
          </ul>
        </div>

        <button
          onClick={handleBackup}
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 active:bg-green-800"
          }`}
        >
          {loading ? "Creating Backup..." : "Download Backup"}
        </button>

        {log && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Backup Log:</h3>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
              {log}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
