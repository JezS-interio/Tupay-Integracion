import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addToWishlist as addToWishlistFirebase,
  removeFromWishlist as removeFromWishlistFirebase,
  clearWishlist as clearWishlistFirebase,
  fetchWishlist as fetchWishlistFirebase,
  getSessionId,
  WishlistItem,
} from "@/lib/firebase/wishlist";

type InitialState = {
  items: WishListItem[];
  loading: boolean;
};

type WishListItem = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  imgs?: {
    thumbnails?: string[];
    previews: string[];
  };
  img?: string;
};

const initialState: InitialState = {
  items: [],
  loading: false,
};

// Async thunks for Firebase operations
export const loadWishlist = createAsyncThunk(
  "wishlist/load",
  async () => {
    const sessionId = getSessionId();
    return await fetchWishlistFirebase(sessionId);
  }
);

export const addItemToWishlistAsync = createAsyncThunk(
  "wishlist/add",
  async (item: WishListItem) => {
    const sessionId = getSessionId();
    await addToWishlistFirebase(sessionId, item);
    return item;
  }
);

export const removeItemFromWishlistAsync = createAsyncThunk(
  "wishlist/remove",
  async (productId: number) => {
    const sessionId = getSessionId();
    await removeFromWishlistFirebase(sessionId, productId);
    return productId;
  }
);

export const clearWishlistAsync = createAsyncThunk(
  "wishlist/clear",
  async () => {
    const sessionId = getSessionId();
    await clearWishlistFirebase(sessionId);
  }
);

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Synchronous reducers for immediate UI updates
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const { id, title, price, quantity, imgs, discountedPrice, status, img } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          title,
          price,
          quantity,
          imgs,
          img,
          discountedPrice,
          status,
        });
      }
    },
    removeItemFromWishlist: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },
    removeAllItemsFromWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Load wishlist
      .addCase(loadWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(loadWishlist.rejected, (state) => {
        state.loading = false;
      })
      // Add item
      .addCase(addItemToWishlistAsync.fulfilled, (state, action) => {
        const item = action.payload;
        const existingItem = state.items.find((i) => i.id === item.id);

        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          state.items.push(item);
        }
      })
      // Remove item
      .addCase(removeItemFromWishlistAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      // Clear wishlist
      .addCase(clearWishlistAsync.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;
export default wishlist.reducer;
