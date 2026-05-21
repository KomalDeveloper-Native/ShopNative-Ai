import axios from 'axios';
import type { CartItem, PaymentMethod } from '../types/productTypes';
import type { RazorpayCheckoutOptions } from 'react-native-razorpay';

export type RazorpayOrderPayload = {
  amount: number;
  currency: 'INR';
  receipt: string;
  notes: Record<string, string>;
};

export type RazorpayOrderResponse = {
  id?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
};

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

export type VerifyPaymentPayload = RazorpaySuccessResponse & {
  amount: number;
  method: PaymentMethod;
};

const API_BASE_URL = 'https://aapsuj.accevate.co/flutter-api';
export const RAZORPAY_KEY_ID = 'rzp_test_replace_with_your_key_id';

const paymentApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const isRazorpayConfigured = () =>
  RAZORPAY_KEY_ID.startsWith('rzp_') && !RAZORPAY_KEY_ID.includes('replace');

export const paiseFromRupees = (amount: number) => Math.max(0, Math.round(amount * 100));

export const buildReceipt = () => `SN-${Date.now()}`;

export const createRazorpayOrder = async (
  amount: number,
  items: CartItem[],
): Promise<RazorpayOrderResponse | undefined> => {
  const payload: RazorpayOrderPayload = {
    amount: paiseFromRupees(amount),
    currency: 'INR',
    receipt: buildReceipt(),
    notes: {
      itemCount: String(items.length),
      source: 'shopnative-mobile',
    },
  };

  try {
    const response = await paymentApi.post<RazorpayOrderResponse>(
      '/payments/razorpay/order',
      payload,
    );
    return response.data;
  } catch {
    return undefined;
  }
};

export const verifyRazorpayPayment = async (payload: VerifyPaymentPayload) => {
  try {
    await paymentApi.post('/payments/razorpay/verify', payload);
    return true;
  } catch {
    return false;
  }
};

export const openRazorpayCheckout = async (options: RazorpayCheckoutOptions) => {
  const RazorpayCheckout = (await import('react-native-razorpay')).default;
  return RazorpayCheckout.open(options);
};
