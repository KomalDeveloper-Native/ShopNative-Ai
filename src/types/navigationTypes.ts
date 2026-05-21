import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Product } from './productTypes';

export type OtpUser = {
  userid: string;
  token?: string;
  message?: string;
};

export type RootStackParamList = {
  Login: undefined;
  Otp: { user: OtpUser };
  Home: undefined;
  Cart: undefined;
  ProductList: { category?: string; query?: string } | undefined;
  ProductDetail: { productId?: string; product?: Product };
  Wishlist: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  MyOrders: undefined;
  Payment: { amount?: number; title?: string } | undefined;
  Profile: undefined;
  Help: undefined;
  RegisterScreen: undefined;
};

export type RootNavigationProp<RouteName extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, RouteName>;

export type RootRouteProp<RouteName extends keyof RootStackParamList> =
  RouteProp<RootStackParamList, RouteName>;
