export type Product = {
  title: string;
  rating: number;
  price: number;
  discountedPrice: number;
  id: number;
  img?: string; // Main product image
  imgs?: {
    thumbnails?: string[];
    previews: string[];
  };
};

// Enhanced product type for Firestore
export type FirestoreProduct = Product & {
  description: string;
  category: string;
  stock: number;
  sku: string;
  slug?: string;
  brand?: string; // Product brand (from DummyJSON)
  rating?: number; // Product rating (from DummyJSON)
  isActive: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  createdAt: string;
  updatedAt?: string;
};
