import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '../../types/productTypes';

type OrderState = {
  items: Order[];
};

const initialState: OrderState = {
  items: [],
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.items.unshift(action.payload);
    },
    cancelOrder: (state, action: PayloadAction<string>) => {
      const order = state.items.find(item => item.id === action.payload);

      if (!order || order.status === 'Delivered' || order.status === 'Cancelled') {
        return;
      }

      order.status = 'Cancelled';
      order.paymentStatus = order.paymentStatus === 'Paid' ? 'Refunded' : 'Cancelled';
      order.trackingNote =
        order.paymentStatus === 'Refunded'
          ? 'Order cancelled. Refund has been initiated to the original payment method.'
          : 'Order cancelled. No payment will be collected.';
    },
    clearOrders: state => {
      state.items = [];
    },
  },
});

export const { addOrder, cancelOrder, clearOrders } = orderSlice.actions;
export default orderSlice.reducer;
