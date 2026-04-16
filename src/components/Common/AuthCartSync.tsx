'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeAllItemsFromCart,
  clearCartFromLocalStorage,
  loadCart,
  selectCartItems
} from '@/redux/features/cart-slice';
import { saveUserCart, loadUserCart } from '@/lib/firebase/user-carts';
import { useUserCartSync } from '@/hooks/useUserCartSync';

/**
 * Component that syncs cart state with authentication state
 * - On login: Loads cart from Firestore
 * - On logout: Saves cart to Firestore, then clears local cart
 * - Continuously syncs cart changes to Firestore while logged in
 */
export default function AuthCartSync() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const previousUserRef = useRef(user);

  // Continuously sync cart to Firestore while user is logged in
  useUserCartSync();

  // Listen for pre-logout event to save cart while still authenticated
  useEffect(() => {
    const handlePreLogout = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const loggedOutUser = customEvent.detail.user;

      if (loggedOutUser && cartItems.length > 0) {
        try {
          await saveUserCart(loggedOutUser.uid, cartItems);
        } catch (error) {
          console.error('Error saving cart on pre-logout:', error);
        }
      }
    };

    window.addEventListener('auth:pre-logout', handlePreLogout);

    return () => {
      window.removeEventListener('auth:pre-logout', handlePreLogout);
    };
  }, [cartItems]);

  // Handle login and post-logout cleanup
  useEffect(() => {
    const handleAuthChange = async () => {
      const previousUser = previousUserRef.current;

      // User just logged in (was null, now logged in)
      if (!previousUser && user) {
        try {
          const savedCart = await loadUserCart(user.uid);
          if (savedCart.length > 0) {
            dispatch(loadCart(savedCart));
          }
        } catch (error) {
          console.error('Error loading cart on login:', error);
        }
      }

      // User just logged out (was logged in, now null) - Clean up local cart
      if (previousUser && !user) {
        dispatch(removeAllItemsFromCart());
        clearCartFromLocalStorage();
      }

      // Update the ref for next render
      previousUserRef.current = user;
    };

    handleAuthChange();
  }, [user, dispatch]);

  return null; // This component doesn't render anything
}
