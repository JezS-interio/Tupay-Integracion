"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function QuickAddBanners() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [completed, setCompleted] = useState(0);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
    console.log(message);
  };

  const uploadToR2 = async (file: File, filename: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", filename);

    const response = await fetch("/api/upload-product-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const data = await response.json();
    return data.url;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      alert("Please select banner images");
      return;
    }

    setProcessing(true);
    setLogs([]);
    setCompleted(0);

    addLog(`🎨 Creating ${files.length} banners...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        addLog(`\n[${i + 1}/${files.length}] Processing: ${file.name}`);

        // Create filename for R2
        const timestamp = Date.now();
        const extension = file.name.split(".").pop();
        const filename = `banner-${timestamp}-${i}.${extension}`;

        // Upload to R2
        addLog(`  ☁️ Uploading to R2...`);
        const imageUrl = await uploadToR2(file, filename);
        addLog(`  ✅ Uploaded`);

        // Create banner data
        const bannerData = {
          title: `Special Offer ${i + 1}`,
          subtitle: "Limited Time Deal",
          description: "Don't miss out on this amazing offer!",
          imageUrl: imageUrl,
          buttonText: "Shop Now",
          buttonLink: "/shop",
          badge: "HOT DEAL",
          order: i + 1,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // Save to Firestore
        addLog(`  💾 Saving to Firestore...`);
        await addDoc(collection(db, "banners"), bannerData);
        addLog(`  ✅ Banner created!`);

        setCompleted((prev) => prev + 1);
      } catch (error: any) {
        addLog(`  ❌ Error: ${error.message}`);
      }
    }

    addLog(`\n🎉 COMPLETE! Created ${files.length} banners`);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">🎨 Quick Add Banners</h1>
          <p className="text-gray-600 mb-6">
            Upload banner images for your homepage carousel
          </p>

          <div className="space-y-6">
            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={processing}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <svg
                  className="w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-lg font-semibold text-gray-700">
                  Click to upload banner images
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  Recommended: 1920x600px or wider
                </span>
              </label>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold mb-2">
                  Selected {files.length} banner images:
                </p>
                <ul className="text-sm space-y-1">
                  {files.map((file, idx) => (
                    <li key={idx} className="text-gray-700">
                      {idx + 1}. {file.name} ({(file.size / 1024).toFixed(1)}KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Process Button */}
            <button
              onClick={handleProcess}
              disabled={processing || files.length === 0}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold
                hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                transition-colors text-lg"
            >
              {processing
                ? `Creating... ${completed}/${files.length}`
                : `🚀 Create ${files.length} Banners`}
            </button>

            {/* Progress */}
            {files.length > 0 && completed > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Progress:</span>
                  <span className="text-blue-600 font-bold">
                    {completed}/{files.length} banners
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${(completed / files.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Logs */}
            {logs.length > 0 && (
              <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            )}

            {/* Success Message */}
            {completed > 0 && !processing && completed === files.length && (
              <div className="bg-green-100 border border-green-400 rounded-lg p-4">
                <p className="text-green-800 font-semibold text-lg">
                  🎉 Successfully created {completed} banners!
                </p>
                <p className="text-sm text-green-700 mt-2">
                  View them at: <a href="/" className="underline font-semibold">Home Page</a>
                  {" or "}
                  <a href="/admin/banners" className="underline font-semibold">Manage Banners</a>
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
              <p className="font-semibold mb-2">📌 Banner Details:</p>
              <ul className="text-sm space-y-1">
                <li>• Title: "Special Offer 1, 2, 3..."</li>
                <li>• Subtitle: "Limited Time Deal"</li>
                <li>• Button: "Shop Now" → /shop</li>
                <li>• Badge: "HOT DEAL"</li>
                <li>• All banners set to Active</li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                You can edit banner text later in Admin → Banners
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
