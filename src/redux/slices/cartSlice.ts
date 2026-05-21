import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Product } from '../../types/productTypes';

type CartState = {
  items: CartItem[];
};

type AddCartPayload = Product & {
  quantity?: number;
  selectedColor?: string;
  selectedSize?: string;
};

const initialState: CartState = {
  items: [],
};

const getCartKey = (item: Pick<CartItem, 'id' | 'selectedColor' | 'selectedSize'>) =>
  `${item.id}-${item.selectedColor ?? ''}-${item.selectedSize ?? ''}`;

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addCart: (state, action: PayloadAction<AddCartPayload>) => {
      const incoming = action.payload;
      const item = state.items.find(cartItem => getCartKey(cartItem) === getCartKey(incoming));

      if (item) {
        item.quantity += incoming.quantity ?? 1;
        return;
      }

      state.items.push({ ...incoming, quantity: incoming.quantity ?? 1 });
    },
    removeCart: (state, action: PayloadAction<CartItem>) => {
      const item = state.items.find(cartItem => getCartKey(cartItem) === getCartKey(action.payload));

      if (item) {
        item.quantity -= 1;
      }

      state.items = state.items.filter(cartItem => cartItem.quantity > 0);
    },
    updateCartQuantity: (
      state,
      action: PayloadAction<{ item: CartItem; quantity: number }>,
    ) => {
      const item = state.items.find(cartItem => getCartKey(cartItem) === getCartKey(action.payload.item));

      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    deleteCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    resetCart: state => {
      state.items = [];
    },
  },
});

export const { addCart, removeCart, updateCartQuantity, deleteCart, resetCart } =
  cartSlice.actions;
export default cartSlice.reducer;
