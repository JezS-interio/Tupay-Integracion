/**
 * Convert local image paths to R2 URLs
 * Handles both absolute paths (/images/...) and relative paths (images/...)
 */

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-2abf1fca1a994517beb3fb3094.r2.dev';

/**
 * Get the full R2 URL for an image
 * @param path - Local image path (e.g., "/images/products/product-1.png" or "images/products/product-1.png")
 * @returns Full R2 URL
 */
export function getImageUrl(path: string | undefined): string {
  // Handle undefined or empty paths
  if (!path) {
    return '/images/placeholder.png'; // Fallback image
  }

  // If it's already a full URL (http/https), return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // If path doesn't start with "images/", add it
  const finalPath = cleanPath.startsWith('images/') ? cleanPath : `images/${cleanPath}`;

  // Return full R2 URL
  return `${R2_PUBLIC_URL}/${finalPath}`;
}

/**
 * Convert local path to R2 path (without domain)
 * Useful for storing in database
 */
export function toR2Path(localPath: string): string {
  if (!localPath) return '';

  // Remove /images/ prefix if present
  let path = localPath.replace(/^\/images\//, '');

  // Return as images/...
  return `images/${path}`;
}

/**
 * Batch convert an array of image paths
 */
export function getImageUrls(paths: string[] | undefined): string[] {
  if (!paths || !Array.isArray(paths)) return [];
  return paths.map(getImageUrl);
}
