import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlatformPressable } from '@react-navigation/elements';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import LoginScreen from '../pages/LoginScreen';
import OtpScreen from '../pages/OtpScreen';
import RegisterScreen from '../pages/RegistorScreen';
import HomeScreen from '../../screens/HomeScreen';
import CartScreen from '../../screens/CartScreen';
import ProductListScreen from '../../screens/ProductListScreen';
import ProductDetailScreen from '../../screens/ProductDetailScreen';
import WishlistScreen from '../../screens/WishlistScreen';
import CheckoutScreen from '../../screens/CheckoutScreen';
import OrderSuccessScreen from '../../screens/OrderSuccessScreen';
import MyOrdersScreen from '../../screens/MyOrdersScreen';
import PaymentScreen from '../../screens/PaymentScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import HelpScreen from '../../screens/HelpScreen';
import { colors } from '../theme/color';
import type { RootStackParamList } from '../../types/navigationTypes';
import { useAppSelector } from '../utils/Redux/hooks';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

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
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarBadgeStyle: styles.tabBadge,
        tabBarItemStyle: styles.tabItem,
        tabBarButton: props => (
          <PlatformPressable
            {...props}
            pressColor="transparent"
            pressOpacity={1}
            android_ripple={{ color: 'transparent', borderless: false }}
          />
        ),
        tabBarIcon: ({ color }) => {
          const iconName =
            route.name === 'Dashboard'
              ? 'home'
              : route.name === 'ShopTab'
                ? 'store'
                : route.name === 'WishlistTab'
                  ? 'heart'
                : route.name === 'CartTab'
                  ? 'shopping-bag'
                  : 'user';

          return (
            <View style={styles.iconWrap}>
              <FontAwesome
                name={iconName}
                solid={route.name === 'ProfileTab'}
                size={15}
                color={color}
              />
            </View>
          );
        },
      })}>
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ProductListScreen as React.ComponentType}
        options={{ tabBarLabel: 'Shop' }}
      />
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
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

type TabnavigationProps = {
  initialRouteName?: keyof RootStackParamList;
};

function Tabnavigation({ initialRouteName = 'Home' }: TabnavigationProps) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="Home" component={MainTabs} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
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
  tabItem: {
    minWidth: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    fontSize: 10,
    fontWeight: '900',
    backgroundColor: colors.primaryColor,
    color: colors.white,
    lineHeight: 18,
  },
  iconWrap: {
    width: 34,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Tabnavigation;
