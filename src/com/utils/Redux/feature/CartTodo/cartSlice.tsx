import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Product } from '../../../../../types/productTypes';

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

type AddCartPayload = Product & {
  quantity?: number;
  selectedColor?: string;
  selectedSize?: string;
};

const getCartKey = (item: Pick<CartItem, 'id' | 'selectedColor' | 'selectedSize'>) =>
  `${item.id}-${item.selectedColor ?? ''}-${item.selectedSize ?? ''}`;

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addCart: (state, action: PayloadAction<AddCartPayload>) => {
      const incoming = action.payload;
      const cartKey = getCartKey(incoming);
      const item = state.items.find(cartItem => getCartKey(cartItem) === cartKey);

      if (item) {
        item.quantity += incoming.quantity ?? 1;
        return;
      }

      state.items.push({
        ...incoming,
        quantity: incoming.quantity ?? 1,
      });
    },
    removeCart: (state, action: PayloadAction<CartItem>) => {
      const cartKey = getCartKey(action.payload);
      const item = state.items.find(cartItem => getCartKey(cartItem) === cartKey);

      if (item) {
        item.quantity -= 1;
      }

      state.items = state.items.filter(cartItem => cartItem.quantity > 0);
    },
    deleteCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    resetCart: state => {
      state.items = [];
    },
  },
});

export const { addCart, removeCart, deleteCart, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
