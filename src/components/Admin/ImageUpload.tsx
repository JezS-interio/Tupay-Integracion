'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadImage } from '@/lib/firebase/storage';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  label: string;
  storagePath: string; // e.g., 'products/thumbnails' or 'products/previews'
}

export default function ImageUpload({
  onUpload,
  currentImage,
  label,
  storagePath,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const fullPath = `${storagePath}/${filename}`;

      // Upload to Firebase Storage
      const downloadUrl = await uploadImage(file, fullPath);

      // Call parent callback with the URL
      onUpload(downloadUrl);

      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image: ' + error.message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-dark mb-2">{label}</label>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue bg-blue-50'
            : 'border-gray-300 hover:border-blue'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={uploading}
        />

        {preview ? (
          <div className="flex flex-col items-center">
            <div className="relative w-full h-48 mb-3">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain rounded"
              />
            </div>
            <p className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Click or drag to replace'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
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
            <p className="text-sm font-medium text-gray-700 mb-1">
              {uploading ? 'Uploading...' : 'Click or drag image to upload'}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue"></div>
              <p className="mt-2 text-sm font-medium text-dark">Uploading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
