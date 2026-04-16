'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useState } from 'react';

export default function BecomeAdminPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyUserId = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-dark mb-4">Become Admin</h1>
          <p className="text-gray-600 mb-6">
            You must be logged in first to get admin access.
          </p>
          <a
            href="/signin"
            className="inline-block bg-blue text-white py-3 px-6 rounded-lg hover:bg-blue-dark transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-dark mb-2">🔑 Become Admin</h1>
          <p className="text-gray-600 mb-8">
            Follow these steps to grant yourself admin access
          </p>

          {/* User Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="text-sm font-medium text-blue-800 mb-3">Your Account Info:</div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-blue-600">Email:</span>
                <div className="font-medium text-dark">{user.email}</div>
              </div>
              <div>
                <span className="text-xs text-blue-600">User ID:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-white px-2 py-1 rounded border border-blue-200 flex-1 overflow-x-auto">
                    {user.uid}
                  </code>
                  <button
                    onClick={copyUserId}
                    className="bg-blue text-white px-3 py-1 rounded text-sm hover:bg-blue-dark transition-colors"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            <div className="border-l-4 border-blue pl-4">
              <div className="font-bold text-dark mb-2">Step 1: Open Firebase Console</div>
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue hover:underline"
              >
                https://console.firebase.google.com
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <div className="border-l-4 border-blue pl-4">
              <div className="font-bold text-dark mb-2">Step 2: Navigate to Firestore</div>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Select your project</li>
                <li>Click "Firestore Database" in the left sidebar</li>
                <li>Click on the "users" collection</li>
              </ol>
            </div>

            <div className="border-l-4 border-blue pl-4">
              <div className="font-bold text-dark mb-2">Step 3: Find Your User Document</div>
              <p className="text-gray-700 mb-2">
                Look for a document with this ID (click Copy above):
              </p>
              <code className="block bg-gray-100 p-3 rounded text-sm overflow-x-auto border">
                {user.uid}
              </code>
            </div>

            <div className="border-l-4 border-blue pl-4">
              <div className="font-bold text-dark mb-2">Step 4: Add Admin Field</div>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 mb-3">
                <li>Click on your user document</li>
                <li>Click the "+" button or "Add field"</li>
                <li>Enter field name: <code className="bg-gray-100 px-2 py-0.5 rounded">isAdmin</code></li>
                <li>Select type: <strong>boolean</strong></li>
                <li>Set value to: <strong>true</strong> ✓</li>
                <li>Click "Save"</li>
              </ol>
            </div>

            <div className="border-l-4 border-green pl-4">
              <div className="font-bold text-dark mb-2">Step 5: Refresh and Access Admin</div>
              <p className="text-gray-700 mb-3">
                After saving, refresh this page and you'll have admin access!
              </p>
              <a
                href="/admin"
                className="inline-block bg-green text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors"
              >
                Go to Admin Panel →
              </a>
            </div>
          </div>

          {/* Visual Guide */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="font-medium text-dark mb-3">📸 What You'll See:</div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-blue">→</span>
                <span>In Firestore, find the document with your User ID</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue">→</span>
                <span>Click it to open the document editor</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue">→</span>
                <span>Click "Add field" button at the top</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue">→</span>
                <span>Type "isAdmin" as field name, select "boolean" type, check the box for "true"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue">→</span>
                <span>Save and you're done!</span>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-blue hover:underline"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
