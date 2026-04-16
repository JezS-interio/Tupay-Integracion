import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '@/app/context/AuthContext';
import { selectCartItems } from '@/redux/features/cart-slice';
import { saveUserCart } from '@/lib/firebase/user-carts';

/**
 * Hook that syncs cart changes to Firestore for logged-in users
 * Debounces save operations to avoid excessive writes
 */
export function useUserCartSync() {
  const { user } = useAuth();
  const cartItems = useSelector(selectCartItems);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only sync if user is logged in
    if (!user) return;

    // Clear any pending save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save operation (wait 2 seconds after last change)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveUserCart(user.uid, cartItems);
      } catch (error) {
        console.error('Error auto-saving cart:', error);
      }
    }, 2000);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [user, cartItems]);
}
