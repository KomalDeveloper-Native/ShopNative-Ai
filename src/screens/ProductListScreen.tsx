import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { AppHeader } from '../com/molecules';
import { addCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import CategoryChip from '../components/CategoryChip';
import EmptyState from '../components/EmptyState';
import { ProductCardSkeleton } from '../components/LoadingSkeleton';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import AppModal from '../components/AppModal';
import { categories, products } from '../data/products';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { startVoiceSearch } from '../services/voiceSearch';
import { colors, radii, spacing } from '../theme';
import type { Product } from '../types/productTypes';
import type { RootNavigationProp, RootRouteProp } from '../navigation/types';
import { searchProducts } from '../utils/productSearch';

type ProductListScreenProps = {
  navigation: RootNavigationProp<'ProductList'>;
  route: RootRouteProp<'ProductList'>;
};

type SortKey = 'recommended' | 'priceLow' | 'rating' | 'discount';

const PAGE_SIZE = 8;
const STOCK_ALERTS = [
  'Cotton tees just restocked in Charcoal',
  'White sneakers are moving fast',
  'New delivery slot opened near you',
  'Wishlist price drop detected',
];
const DELIVERY_STEPS = ['Placed', 'Packed', 'Shipped', 'Out for delivery'];

const sortOptions: { key: SortKey; label: string; icon: string }[] = [
  { key: 'recommended', label: 'Recommended', icon: 'magic' },
  { key: 'priceLow', label: 'Price', icon: 'sort-amount-down-alt' },
  { key: 'rating', label: 'Rating', icon: 'star' },
  { key: 'discount', label: 'Offers', icon: 'tag' },
];

const ProductListScreen = ({ navigation, route }: ProductListScreenProps) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(width);
  const [search, setSearch] = useState(route.params?.query ?? '');
  const [selectedCategory, setSelectedCategory] = useState(
    route.params?.category ?? 'All',
  );
  const [sortKey, setSortKey] = useState<SortKey>('recommended');
  const [fastOnly, setFastOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [ticker, setTicker] = useState(0);
  const [stockPulse, setStockPulse] = useState<Record<string, number>>({});
  const [voiceError, setVoiceError] = useState('');
  const debouncedSearch = useDebouncedValue(search, 280);
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const cartCount = useAppSelector(state =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const latestOrder = useAppSelector(state => state.orders.items[0]);
  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map(item => item.id)),
    [wishlistItems],
  );
  const wishlistCount = wishlistItems.length;
  const liveAlert = STOCK_ALERTS[ticker % STOCK_ALERTS.length];
  const deliveryStep = latestOrder
    ? latestOrder.status
    : DELIVERY_STEPS[ticker % DELIVERY_STEPS.length];
  const deliveryNote = latestOrder?.trackingNote ?? 'Realtime route updates enabled';

  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(current => {
        const nextTicker = current + 1;
        const nextProduct = products[(nextTicker + 2) % products.length];

        setStockPulse(stock => ({
          ...stock,
          [nextProduct.id]: ((stock[nextProduct.id] ?? 11) + 3) % 18,
        }));

        return nextTicker;
      });
    }, 3600);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, sortKey, fastOnly]);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 260);
    return () => clearTimeout(timeout);
  }, [debouncedSearch, selectedCategory, sortKey, fastOnly]);

  const filteredProducts = useMemo(() => {
    const realtimeProducts = products.map(product => {
      const pulse = stockPulse[product.id];

      return {
        ...product,
        inStock: pulse === undefined ? product.inStock : pulse > 4,
        deliveryMinutes: Math.max(
          12,
          (product.deliveryMinutes ?? 30) - (ticker % 4),
        ),
      };
    });
    const categoryFiltered =
      selectedCategory === 'All'
        ? realtimeProducts
        : realtimeProducts.filter(product => product.category === selectedCategory);
    const searched = searchProducts(categoryFiltered, debouncedSearch).filter(
      product => (fastOnly ? (product.deliveryMinutes ?? 99) <= 30 : true),
    );

    return [...searched].sort((a, b) => {
      if (sortKey === 'priceLow') return a.price - b.price;
      if (sortKey === 'rating') return b.rating - a.rating;
      if (sortKey === 'discount') return b.discount - a.discount;
      return (b.sectionTags?.length ?? 0) - (a.sectionTags?.length ?? 0);
    });
  }, [debouncedSearch, fastOnly, selectedCategory, sortKey, stockPulse, ticker]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, page * PAGE_SIZE),
    [filteredProducts, page],
  );

  const availableWidth = Math.max(contentWidth, 0);
  const columnCount = availableWidth >= 720 ? 3 : availableWidth >= 340 ? 2 : 1;
  const columnGap = columnCount > 1 ? spacing.md : 0;
  const cardWidth =
    (availableWidth - columnGap * (columnCount - 1)) / columnCount;

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    setContentWidth(event.nativeEvent.layout.width);
  }, []);

  const openProduct = useCallback(
    (productId: string) => navigation.navigate('ProductDetail', { productId }),
    [navigation],
  );

  const addToCart = useCallback(
    (product: Product) => dispatch(addCart(product)),
    [dispatch],
  );

  const toggleSaved = useCallback(
    (product: Product) => dispatch(toggleWishlist(product)),
    [dispatch],
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        isWishlisted={wishlistIds.has(item.id)}
        onPress={() => openProduct(item.id)}
        onAddToCart={() => addToCart(item)}
        onToggleWishlist={() => toggleSaved(item)}
        style={[styles.gridCard, { width: cardWidth }]}
      />
    ),
    [addToCart, cardWidth, openProduct, toggleSaved, wishlistIds],
  );

  const loadMore = useCallback(() => {
    if (visibleProducts.length < filteredProducts.length) {
      setPage(current => current + 1);
    }
  }, [filteredProducts.length, visibleProducts.length]);

  const handleVoicePress = useCallback(async () => {
    if (isListening) {
      return;
    }

    setIsListening(true);
    try {
      const transcript = await startVoiceSearch();
      setSearch(transcript);
    } catch (error) {
      setVoiceError(
        error instanceof Error
          ? error.message
          : 'Voice search could not finish. Please try again.',
      );
    } finally {
      setIsListening(false);
    }
  }, [isListening]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AppHeader
        title="Shop clothing"
        subtitle={`${filteredProducts.length} styles available`}
        onBack={() => navigation.goBack()}
        rightSlot={
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate('Wishlist')}
              style={styles.headerAction}>
              <FontAwesome name="heart" solid size={15} color={colors.accentColor} />
              {wishlistCount > 0 ? (
                <Text style={styles.headerBadge}>{wishlistCount}</Text>
              ) : null}
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Cart')}
              style={styles.headerAction}>
              <FontAwesome name="shopping-bag" size={15} color={colors.primaryColor} />
              {cartCount > 0 ? (
                <Text style={styles.headerBadge}>{cartCount}</Text>
              ) : null}
            </Pressable>
          </View>
        }
      />

      <View style={styles.content} onLayout={handleContentLayout}>
        <View style={styles.stickySearch}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onVoicePress={handleVoicePress}
            isListening={isListening}
            placeholder={
              isListening ? 'Listening...' : 'Search shirts, dresses, sneakers'
            }
          />
        </View>

        <View style={styles.liveGrid}>
          <Pressable
            style={styles.liveCard}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={styles.liveIcon}>
              <FontAwesome name="route" size={13} color={colors.background} />
            </View>
            <View style={styles.liveCopy}>
              <Text style={styles.liveLabel}>Live order tracking</Text>
              <Text style={styles.liveValue} numberOfLines={1}>
                {deliveryStep}
              </Text>
              <Text style={styles.liveMeta} numberOfLines={1}>
                {deliveryNote}
              </Text>
            </View>
          </Pressable>

          <View style={styles.liveCard}>
            <View style={[styles.liveIcon, styles.alertIcon]}>
              <FontAwesome name="bell" size={13} color={colors.background} />
            </View>
            <View style={styles.liveCopy}>
              <Text style={styles.liveLabel}>Push notification</Text>
              <Text style={styles.liveValue} numberOfLines={1}>
                {liveAlert}
              </Text>
              <Text style={styles.liveMeta} numberOfLines={1}>
                Stock and delivery updates refresh live
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          horizontal
          data={['All', ...categories]}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <CategoryChip
              label={item}
              selected={selectedCategory === item}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          showsHorizontalScrollIndicator={false}
          style={styles.chips}
          contentContainerStyle={styles.chipsContent}
        />

        <View style={styles.controls}>
          {sortOptions.map(option => {
            const active = sortKey === option.key;
            return (
              <Pressable
                key={option.key}
                style={[styles.controlChip, active && styles.controlChipActive]}
                onPress={() => setSortKey(option.key)}
              >
                <FontAwesome
                  name={option.icon}
                  solid={option.key === 'rating'}
                  size={11}
                  color={active ? colors.white : colors.textDark}
                />
                <Text
                  style={[
                    styles.controlText,
                    active && styles.controlTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            style={[styles.controlChip, fastOnly && styles.controlChipActive]}
            onPress={() => setFastOnly(current => !current)}
          >
            <FontAwesome
              name="bolt"
              size={11}
              color={fastOnly ? colors.white : colors.textDark}
            />
            <Text
              style={[styles.controlText, fastOnly && styles.controlTextActive]}
              numberOfLines={1}
            >
              30 min
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <FlatList
            horizontal
            data={Array.from({ length: 4 }, (_, index) => `skeleton-${index}`)}
            keyExtractor={item => item}
            renderItem={() => <ProductCardSkeleton />}
            showsHorizontalScrollIndicator={false}
            style={styles.loadingList}
          />
        ) : (
          <FlatList
            key={columnCount}
            data={visibleProducts}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            numColumns={columnCount}
            columnWrapperStyle={columnCount > 1 ? styles.row : undefined}
            showsVerticalScrollIndicator={false}
            style={styles.productList}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Math.max(insets.bottom, 16) + 28 },
            ]}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={PAGE_SIZE}
            maxToRenderPerBatch={PAGE_SIZE}
            windowSize={7}
            removeClippedSubviews
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={
              <EmptyState
                icon="search"
                title="No matching styles"
                message="Try a broader search like denim jacket, kurta, sneakers, or dresses under 1500."
                actionLabel="Clear search"
                onAction={() => {
                  setSearch('');
                  setSelectedCategory('All');
                  setFastOnly(false);
                }}
              />
            }
          />
        )}
      </View>
      {cartCount > 0 && (
        <Pressable
          style={[
            styles.floatingCart,
            { bottom: Math.max(insets.bottom, 16) + 18 },
          ]}
          onPress={() => navigation.navigate('Cart')}
        >
          <FontAwesome name="shopping-bag" size={15} color={colors.background} />
          <Text style={styles.floatingCartText}>{cartCount}</Text>
        </Pressable>
      )}
      <AppModal
        visible={Boolean(voiceError)}
        icon="microphone"
        title="Voice search"
        message={voiceError}
        primaryAction={{
          label: 'Got it',
          onPress: () => setVoiceError(''),
        }}
        onRequestClose={() => setVoiceError('')}
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
    flex: 1,
    padding: spacing.lg,
    paddingBottom: 0,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    color: colors.white,
    backgroundColor: colors.primaryColor,
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 10,
    fontWeight: '900',
  },
  stickySearch: {
    zIndex: 2,
    backgroundColor: colors.background,
    paddingBottom: spacing.sm,
  },
  liveGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  liveCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 92,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  liveIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryColor,
  },
  alertIcon: {
    backgroundColor: colors.secondaryColor,
  },
  liveCopy: {
    flex: 1,
    minWidth: 0,
  },
  liveLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  liveValue: {
    color: colors.textDark,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },
  liveMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  chips: {
    flexGrow: 0,
    marginTop: spacing.md,
  },
  chipsContent: {
    paddingRight: 4,
    paddingBottom: 4,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  controlChip: {
    minHeight: 34,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
  },
  controlChipActive: {
    backgroundColor: colors.primaryColor,
    borderColor: colors.primaryColor,
  },
  controlText: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: '900',
  },
  controlTextActive: {
    color: colors.white,
  },
  listContent: {
    flexGrow: 1,
  },
  loadingList: {
    flexGrow: 0,
  },
  productList: {
    flex: 1,
    minHeight: 0,
  },
  row: {
    gap: spacing.md,
  },
  gridCard: {
    marginRight: 0,
    marginBottom: 14,
  },
  floatingCart: {
    position: 'absolute',
    right: 18,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: colors.secondaryColor,
    borderWidth: 1,
    borderColor: colors.overlayBorder,
    shadowColor: colors.shadow,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  floatingCartText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '900',
  },
});

export default ProductListScreen;

