"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { loadWishlist } from "@/redux/features/wishlist-slice";

/**
 * Component that loads the wishlist from Firebase on mount
 */
const WishlistSync = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Load wishlist from Firebase on component mount
    dispatch(loadWishlist());
  }, [dispatch]);

  return null;
};

export default WishlistSync;
