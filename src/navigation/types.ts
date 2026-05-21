import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AddressFormValues, PaymentMethod, Product } from '../types/productTypes';

export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Login: undefined;
  Register: undefined;
  RegisterScreen: undefined;
  Cart: undefined;
  ProductList: { category?: string; query?: string } | undefined;
  ProductDetail: { productId?: string; product?: Product };
  Wishlist: undefined;
  Checkout: undefined;
  Payment: {
    amount: number;
    title?: string;
    address?: AddressFormValues;
    method?: PaymentMethod;
  };
  OrderSuccess: { orderId: string };
  Orders: undefined;
  MyOrders: undefined;
  OrderDetail: { orderId: string };
  Profile: undefined;
  Help: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Shop: undefined;
  WishlistTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type RootNavigationProp<RouteName extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, RouteName>;

export type RootRouteProp<RouteName extends keyof RootStackParamList> =
  RouteProp<RootStackParamList, RouteName>;
