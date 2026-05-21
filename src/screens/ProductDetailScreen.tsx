import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-simple-toast';
import { QuantityStepper } from '../com/atoms';
import { AppHeader, OptionSelector } from '../com/molecules';
import { addCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import EmptyState from '../components/EmptyState';
import GradientButton from '../components/GradientButton';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { products } from '../data/products';
import { colors, spacing } from '../theme';
import type { Product } from '../types/productTypes';
import type { RootNavigationProp, RootRouteProp } from '../navigation/types';
import { formatCurrency, formatPercent } from '../utils/format';
import { getSimilarProducts } from '../utils/recommendationEngine';

type ProductDetailScreenProps = {
  navigation: RootNavigationProp<'ProductDetail'>;
  route: RootRouteProp<'ProductDetail'>;
};

const ProductDetailScreen = ({ navigation, route }: ProductDetailScreenProps) => {
  const dispatch = useAppDispatch();
  const product =
    products.find(item => item.id === route.params?.productId) ??
    route.params?.product;
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] ?? '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] ?? '');
  const [selectedImage, setSelectedImage] = useState(product?.image ?? '');
  const [quantity, setQuantity] = useState(1);
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map(item => item.id)),
    [wishlistItems],
  );
  const cartCount = useAppSelector(state =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const similar = useMemo(
    () => (product ? getSimilarProducts(product, 6) : []),
    [product],
  );

  const addToCart = useCallback(() => {
    if (!product) return;

    dispatch(
      addCart({
        ...product,
        selectedColor,
        selectedSize,
        quantity,
      }),
    );
    Toast.show('Added to cart', Toast.SHORT);
  }, [dispatch, product, quantity, selectedColor, selectedSize]);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="exclamation-circle"
          title="Product not found"
          message="This product may no longer be available."
          actionLabel="Back to home"
          onAction={() => navigation.navigate('Home')}
        />
      </SafeAreaView>
    );
  }

  const gallery = [product.image, product.image, product.image];

  const renderSimilar = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      isWishlisted={wishlistIds.has(item.id)}
      onPress={() => navigation.push('ProductDetail', { productId: item.id })}
      onAddToCart={() => dispatch(addCart(item))}
      onToggleWishlist={() => dispatch(toggleWishlist(item))}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <AppHeader
        compact
        title="Product details"
        onBack={() => navigation.goBack()}
        rightIcon="shopping-cart"
        rightBadgeCount={cartCount}
        onRightPress={() => navigation.navigate('Cart')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Image source={{ uri: selectedImage || product.image }} style={styles.image} />
        <FlatList
          horizontal
          data={gallery}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item, index }) => (
            <Pressable
              style={[
                styles.thumbnail,
                selectedImage === item && index === 0 && styles.thumbnailActive,
              ]}
              onPress={() => setSelectedImage(item)}
            >
              <Image source={{ uri: item }} style={styles.thumbnailImage} />
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gallery}
        />

        <View style={styles.titleRow}>
          <View style={styles.titleContent}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.rating}>
              {product.rating.toFixed(1)} rating - {product.deliveryMinutes ?? 10}{' '}
              min delivery
            </Text>
          </View>
          <Pressable
            style={styles.wishlistButton}
            onPress={() => dispatch(toggleWishlist(product))}
          >
            <FontAwesome
              name="heart"
              solid={wishlistIds.has(product.id)}
              size={20}
              color={wishlistIds.has(product.id) ? colors.accentColor : colors.textMuted}
            />
          </Pressable>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          <Text style={styles.originalPrice}>
            {formatCurrency(product.originalPrice)}
          </Text>
          <Text style={styles.discount}>{formatPercent(product.discount)}</Text>
        </View>
        <Text style={styles.description}>{product.description}</Text>

        <OptionSelector
          title="Color"
          options={product.colors}
          selected={selectedColor}
          onSelect={setSelectedColor}
        />

        <OptionSelector
          title="Size"
          options={product.sizes}
          selected={selectedSize}
          onSelect={setSelectedSize}
        />

        <View style={styles.quantityRow}>
          <Text style={styles.optionTitle}>Quantity</Text>
          <QuantityStepper
            value={quantity}
            onDecrease={() => setQuantity(current => Math.max(1, current - 1))}
            onIncrease={() => setQuantity(current => current + 1)}
          />
        </View>

        <View style={styles.deliveryCard}>
          <FontAwesome name="bolt" size={13} color={colors.secondaryColor} />
          <Text style={styles.deliveryCopy}>
            Fast fashion delivery in {product.deliveryMinutes ?? 30} minutes from
            the nearest ShopNative partner store.
          </Text>
        </View>

        <GradientButton title="Add to Cart" onPress={addToCart} style={styles.addButton} />

        <View style={styles.similarSection}>
          <SectionHeader title="Recommended with this" />
          <FlatList
            horizontal
            data={similar}
            keyExtractor={item => item.id}
            renderItem={renderSimilar}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={5}
          />
        </View>
      </ScrollView>
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
  image: {
    width: '100%',
    height: 330,
    borderRadius: 8,
    backgroundColor: colors.lightPurple,
  },
  gallery: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  thumbnailActive: {
    borderColor: colors.primaryColor,
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 18,
  },
  titleContent: {
    flex: 1,
  },
  name: {
    color: colors.textDark,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '900',
  },
  rating: {
    color: colors.textMuted,
    marginTop: 6,
    fontWeight: '700',
  },
  wishlistButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  price: {
    color: colors.textDark,
    fontSize: 25,
    fontWeight: '900',
  },
  originalPrice: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    fontWeight: '700',
  },
  discount: {
    color: colors.secondaryColor,
    fontWeight: '900',
  },
  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },
  optionTitle: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 20,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  deliveryCard: {
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    marginTop: 18,
  },
  deliveryCopy: {
    flex: 1,
    color: colors.textDark,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  addButton: {
    marginTop: 22,
  },
  similarSection: {
    marginTop: 28,
  },
});

export default ProductDetailScreen;

