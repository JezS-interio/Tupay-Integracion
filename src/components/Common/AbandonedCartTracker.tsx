'use client';

import { useAbandonedCartTracking } from '@/hooks/useAbandonedCartTracking';

/**
 * Component that tracks abandoned carts
 * Add this to the layout to enable automatic cart tracking
 */
export default function AbandonedCartTracker() {
  useAbandonedCartTracking();
  return null;
}
