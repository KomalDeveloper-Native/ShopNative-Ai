import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { QuantityStepper } from '../com/atoms';
import { AppHeader } from '../com/molecules';
import {
  addCart,
  deleteCart,
  removeCart,
} from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import EmptyState from '../components/EmptyState';
import GradientButton from '../components/GradientButton';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { colors, radii, spacing } from '../theme';
import type { CartItem, Product } from '../types/productTypes';
import type { RootNavigationProp } from '../navigation/types';
import { formatCurrency, getCartSubtotal } from '../utils/format';
import { getRecommendedProducts } from '../utils/recommendationEngine';

type CartScreenProps = {
  navigation: RootNavigationProp<'Cart'>;
};

export const calculateCartTotal = (items: CartItem[] = []): number =>
  getCartSubtotal(items);

const getDeliveryFee = (subtotal: number): number =>
  subtotal === 0 || subtotal >= 299 ? 0 : 29;

const getHandlingFee = (subtotal: number): number => (subtotal > 0 ? 5 : 0);

const CartScreen = ({ navigation }: CartScreenProps) => {
  const dispatch = useAppDispatch();
  const [coupon, setCoupon] = useState('');
  const cartItems = useAppSelector(state => state.cart.items);
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map(item => item.id)),
    [wishlistItems],
  );
  const subtotal = calculateCartTotal(cartItems);
  const deliveryFee = getDeliveryFee(subtotal);
  const handlingFee = getHandlingFee(subtotal);
  const discount = coupon.trim().toUpperCase() === 'STYLE50' ? 50 : 0;
  const payable = Math.max(subtotal + deliveryFee + handlingFee - discount, 0);
  const recommendations = useMemo(
    () => getRecommendedProducts(cartItems, 6),
    [cartItems],
  );

  const renderCartItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.itemBody}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemMeta} numberOfLines={1}>
            {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ') ||
              item.unit ||
              item.category}
          </Text>
          <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
        </View>
        <View style={styles.itemActions}>
          <Pressable
            style={styles.deleteButton}
            onPress={() => dispatch(deleteCart(item.id))}
          >
            <FontAwesome name="trash" size={13} color={colors.error} />
          </Pressable>
          <QuantityStepper
            compact
            value={item.quantity}
            onDecrease={() => dispatch(removeCart(item))}
            onIncrease={() => dispatch(addCart(item))}
          />
        </View>
      </View>
    ),
    [dispatch],
  );

  const renderRecommendation = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        isWishlisted={wishlistIds.has(item.id)}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        onAddToCart={() => dispatch(addCart(item))}
        onToggleWishlist={() => dispatch(toggleWishlist(item))}
      />
    ),
    [dispatch, navigation, wishlistIds],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <AppHeader
        title="Cart"
        subtitle={`${cartItems.length} items ready`}
        onBack={() => navigation.goBack()}
        rightIcon="heart"
        rightIconSolid
        rightBadgeCount={wishlistItems.length}
        onRightPress={() => navigation.navigate('Wishlist')}
      />

      <FlatList
        data={cartItems}
        keyExtractor={item =>
          `${item.id}-${item.selectedColor ?? ''}-${item.selectedSize ?? ''}`
        }
        renderItem={renderCartItem}
        contentContainerStyle={styles.content}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        ListEmptyComponent={
          <EmptyState
            icon="shopping-cart"
            title="Your cart is empty"
            message="Add clothing, footwear, or accessories and checkout in one smooth flow."
            actionLabel="Start shopping"
            onAction={() => navigation.navigate('ProductList')}
          />
        }
        ListFooterComponent={
          <View>
            {recommendations.length > 0 ? (
              <View style={styles.recommendations}>
                <SectionHeader title="Frequently bought together" />
                <FlatList
                  horizontal
                  data={recommendations}
                  keyExtractor={item => item.id}
                  renderItem={renderRecommendation}
                  showsHorizontalScrollIndicator={false}
                  initialNumToRender={4}
                  maxToRenderPerBatch={4}
                  windowSize={5}
                />
              </View>
            ) : null}
            {cartItems.length > 0 ? (
              <View style={styles.summary}>
                <View style={styles.couponBox}>
                  <FontAwesome name="tag" size={13} color={colors.primaryColor} />
                  <TextInput
                    value={coupon}
                    onChangeText={setCoupon}
                    placeholder="Apply coupon, try STYLE50"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                    style={styles.couponInput}
                  />
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(subtotal)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery</Text>
                  <Text
                    style={deliveryFee === 0 ? styles.freeText : styles.summaryValue}
                  >
                    {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Handling fee</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(handlingFee)}
                  </Text>
                </View>
                {discount > 0 ? (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Coupon discount</Text>
                    <Text style={styles.freeText}>-{formatCurrency(discount)}</Text>
                  </View>
                ) : null}
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>To pay</Text>
                  <Text style={styles.totalValue}>{formatCurrency(payable)}</Text>
                </View>
                <GradientButton
                  title="Proceed to Checkout"
                  onPress={() => navigation.navigate('Checkout')}
                  style={styles.checkoutButton}
                />
              </View>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 11,
    marginBottom: 12,
  },
  itemImage: {
    width: 76,
    height: 76,
    borderRadius: radii.sm,
    backgroundColor: colors.lightPurple,
  },
  itemBody: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    color: colors.textDark,
    fontSize: 15,
    fontWeight: '900',
  },
  itemMeta: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  itemPrice: {
    color: colors.primaryColor,
    marginTop: 8,
    fontWeight: '900',
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: 12,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightPurple,
  },
  recommendations: {
    marginTop: 12,
  },
  summary: {
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 20,
  },
  couponBox: {
    minHeight: 46,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  couponInput: {
    flex: 1,
    minWidth: 0,
    color: colors.textDark,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 11,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  summaryValue: {
    color: colors.textDark,
    fontWeight: '900',
  },
  freeText: {
    color: colors.success,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  totalLabel: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '900',
  },
  totalValue: {
    color: colors.primaryColor,
    fontSize: 18,
    fontWeight: '900',
  },
  checkoutButton: {
    marginTop: 8,
  },
});

export default CartScreen;

