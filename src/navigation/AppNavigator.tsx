import React from 'react';
import { PlatformPressable } from '@react-navigation/elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import HomeScreen from '../screens/home/HomeScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import OrderSuccessScreen from '../screens/orders/OrderSuccessScreen';
import PaymentScreen from '../screens/cart/PaymentScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import ProductListScreen from '../screens/product/ProductListScreen';
import ProfileScreen from '../screens/auth/ProfileScreen';
import WishlistScreen from '../screens/wishlist/WishlistScreen';
import { useAppSelector } from '../redux/hooks';
import { colors } from '../theme';
import type { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

type AppNavigatorProps = {
  isSignedIn: boolean;
};

const tabIcons: Record<keyof MainTabParamList, string> = {
  Home: 'home',
  Shop: 'store',
  WishlistTab: 'heart',
  CartTab: 'shopping-bag',
  OrdersTab: 'receipt',
  ProfileTab: 'user',
};

const MainTabs = () => {
  const cartCount = useAppSelector(state =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const wishlistCount = useAppSelector(state => state.wishlist.items.length);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primaryColor,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '900' },
        tabBarStyle: {
          height: 70,
          paddingTop: 9,
          paddingBottom: 9,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.white,
          elevation: 10,
          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -3 },
        },
        tabBarBadgeStyle: {
          minWidth: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: colors.primaryColor,
          color: colors.white,
          fontSize: 10,
          fontWeight: '900',
          lineHeight: 18,
        },
        tabBarButton: props => (
          <PlatformPressable
            {...props}
            pressColor="transparent"
            pressOpacity={1}
            android_ripple={{ color: 'transparent', borderless: false }}
          />
        ),
        tabBarIcon: ({ color }) => (
          <FontAwesome
            name={tabIcons[route.name]}
            size={15}
            color={color}
            solid={route.name === 'WishlistTab' || route.name === 'ProfileTab'}
          />
        ),
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Shop" component={ProductListScreen as React.ComponentType} />
      <Tab.Screen
        name="WishlistTab"
        component={WishlistScreen as React.ComponentType}
        options={{
          tabBarLabel: 'Wishlist',
          tabBarBadge: wishlistCount > 0 ? wishlistCount : undefined,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen as React.ComponentType}
        options={{
          tabBarLabel: 'Cart',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tab.Screen name="OrdersTab" component={OrdersScreen as React.ComponentType} options={{ tabBarLabel: 'Orders' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen as React.ComponentType} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

const AppNavigator = ({ isSignedIn }: AppNavigatorProps) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {isSignedIn ? (
      <>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Home" component={MainTabs} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="ProductList" component={ProductListScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="MyOrders" component={OrdersScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </>
    ) : (
      <>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      </>
    )}
  </Stack.Navigator>
);

export default AppNavigator;
