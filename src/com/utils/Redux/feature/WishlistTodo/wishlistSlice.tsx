import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { WishlistItem } from '../../../../../types/productTypes';

type WishlistState = {
  items: WishlistItem[];
};

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.some(item => item.id === action.payload.id);

      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearWishlist: state => {
      state.items = [];
    },
    toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.some(item => item.id === action.payload.id);

      if (exists) {
        state.items = state.items.filter(item => item.id !== action.payload.id);
      } else {
        state.items.push(action.payload);
      }
    },
  },
});

export const { addWishlist, removeWishlist, clearWishlist, toggleWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
