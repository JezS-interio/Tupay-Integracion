import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
};

type CartItem = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails?: string[];
    previews: string[];
  };
};

// LocalStorage helper functions
const CART_STORAGE_KEY = "intitech_cart";

const loadCartFromLocalStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return [];
};

const saveCartToLocalStorage = (items: CartItem[]) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

// Export function to clear cart from localStorage (used on logout)
export const clearCartFromLocalStorage = () => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing cart from localStorage:", error);
  }
};

const initialState: InitialState = {
  items: loadCartFromLocalStorage(),
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, title, price, quantity, discountedPrice, imgs } =
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
          discountedPrice,
          imgs,
        });
      }

      // Save to localStorage
      saveCartToLocalStorage(state.items);
    },
    removeItemFromCart: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);

      // Save to localStorage
      saveCartToLocalStorage(state.items);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity = quantity;
      }

      // Save to localStorage
      saveCartToLocalStorage(state.items);
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];

      // Save to localStorage
      saveCartToLocalStorage(state.items);
    },

    // Load cart from Firestore (used on login)
    loadCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;

      // Save to localStorage
      saveCartToLocalStorage(state.items);
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  loadCart,
} = cart.actions;
export default cart.reducer;
