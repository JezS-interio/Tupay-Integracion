'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '@/app/context/AuthContext';
import { selectCartItems, selectTotalPrice } from '@/redux/features/cart-slice';
import { saveAbandonedCart, deleteAbandonedCart } from '@/lib/firebase/abandoned-carts';

/**
 * Hook to automatically track abandoned carts in Firestore
 * Syncs cart state with Firestore when user is authenticated
 */
export function useAbandonedCartTracking() {
  const { user } = useAuth();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectTotalPrice);

  useEffect(() => {
    // Only track if user is authenticated
    if (!user || !user.email) {
      return;
    }

    const syncCartToFirestore = async () => {
      try {
        if (cartItems.length === 0) {
          // Cart is empty, delete abandoned cart record
          await deleteAbandonedCart(user.email!);
          return;
        }

        // Transform cart items to the format needed for abandoned cart
        const abandonedCartItems = cartItems.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          discountedPrice: item.discountedPrice,
          quantity: item.quantity,
          image: item.imgs?.previews?.[0] || item.imgs?.thumbnails?.[0],
        }));

        // Save/update abandoned cart in Firestore
        await saveAbandonedCart(
          user.email!,
          abandonedCartItems,
          cartTotal,
          user.uid,
          user.displayName || undefined
        );
      } catch (error) {
        console.error('Error syncing cart to Firestore:', error);
      }
    };

    // Debounce to avoid too many writes
    const timeoutId = setTimeout(syncCartToFirestore, 2000);

    return () => clearTimeout(timeoutId);
  }, [user, cartItems, cartTotal]);
}
