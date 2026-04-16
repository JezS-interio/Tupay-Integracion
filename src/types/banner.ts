// src/types/banner.ts
export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl: string;
  badge?: string; // e.g., "30% Off", "New Arrival"
  isActive: boolean;
  order: number; // For ordering banners in carousel
  createdAt: string;
  updatedAt: string;
}

export type BannerFormData = Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>;
