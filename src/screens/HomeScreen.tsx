import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { addCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import AiAssistant from '../components/AiAssistant';
import AppModal from '../components/AppModal';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { categories, products } from '../data/products';
import { startVoiceSearch } from '../services/voiceSearch';
import { colors, radii, spacing } from '../theme';
import type { Product } from '../types/productTypes';
import { formatCurrency } from '../utils/format';

const heroBanners = [
  {
    id: 'shopnative-sale',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
    kicker: 'ShopNative style drop',
    title: 'Fresh picks for every cart',
    copy: 'Clean styles, wishlist saves, quick checkout and order tracking in one polished store.',
    cta: 'Shop new styles',
    icon: 'bolt',
  },
  {
    id: 'ethnic-edit',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200',
    kicker: 'Festive edit',
    title: 'Curated looks picked by ShopNative AI',
    copy: 'Ask the assistant to compare discounts, sizes, delivery time and your saved favourites.',
    cta: 'Ask AI',
    icon: 'robot',
  },
  {
    id: 'sneaker-speed',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200',
    kicker: 'Fast delivery',
    title: 'Add, save and checkout without friction',
    copy: 'Your cart and wishlist counts update everywhere as soon as you tap Add or Heart.',
    cta: 'Explore deals',
    icon: 'shopping-bag',
  },
];

const headerLinks = [
  { label: 'MEN', category: 'Men' },
  { label: 'WOMEN', category: 'Women' },
  { label: 'KIDS', category: 'Kids' },
  { label: 'BEAUTY', query: 'beauty' },
  { label: 'HOME', query: 'home' },
];

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const productsY = useRef(0);
  const [activeBanner, setActiveBanner] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const bannerWidth = Math.max(width - spacing.lg * 2, 280);
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const cartItems = useAppSelector(state => state.cart.items);
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );
  const wishlistCount = wishlistItems.length;
  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map(item => item.id)),
    [wishlistItems],
  );

  const recommended = useMemo(
    () => products.filter(item => item.sectionTags?.includes('recommended')).slice(0, 8),
    [],
  );
  const popular = useMemo(
    () => products.filter(item => item.sectionTags?.includes('popular')).slice(0, 6),
    [],
  );

  const renderProduct = useCallback(
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

  const handleBannerScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setActiveBanner(
        Math.round(event.nativeEvent.contentOffset.x / bannerWidth),
      );
    },
    [bannerWidth],
  );

  const scrollToProducts = useCallback(() => {
    scrollRef.current?.scrollTo({
      y: Math.max(productsY.current - spacing.md, 0),
      animated: true,
    });
  }, []);

  const handleVoiceSearch = useCallback(async () => {
    if (isListening) {
      return;
    }

    setIsListening(true);
    setVoiceError('');

    try {
      const transcript = await startVoiceSearch();
      navigation.navigate('ProductList', { query: transcript });
    } catch (error) {
      setVoiceError(
        error instanceof Error
          ? error.message
          : 'Voice search could not finish. Please try again.',
      );
    } finally {
      setIsListening(false);
    }
  }, [isListening, navigation]);

  const renderBanner = useCallback(
    ({ item }: { item: (typeof heroBanners)[number] }) => (
      <ImageBackground
        source={{ uri: item.image }}
        imageStyle={styles.heroImage}
        style={[styles.hero, { width: bannerWidth }]}>
        <View style={styles.heroOverlay}>
          <View style={styles.offerPill}>
            <FontAwesome name={item.icon} size={11} color={colors.warning} />
            <Text style={styles.offerText}>{item.kicker}</Text>
          </View>
          <Text style={styles.heroTitle}>{item.title}</Text>
          <Text style={styles.heroCopy}>{item.copy}</Text>
          <View style={styles.heroActions}>
            <Pressable
              onPress={() => navigation.navigate('ProductList')}
              style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{item.cta}</Text>
              <FontAwesome name="arrow-right" size={12} color={colors.white} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Wishlist')}
              style={styles.secondaryButton}>
              <FontAwesome name="heart" size={12} color={colors.white} solid />
              <Text style={styles.secondaryButtonText}>{wishlistCount}</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    ),
    [bannerWidth, navigation, wishlistCount],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.headerContainer}>
        <PremiumPattern />
        <View style={styles.headerTop}>
          <Pressable
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
            style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>S</Text>
              <View style={styles.logoAccent} />
            </View>
            <View style={styles.logoCopy}>
              <Text style={styles.eyebrow} numberOfLines={1}>
                ShopNative
              </Text>
              <Text style={styles.headerMeta} numberOfLines={1}>
                Fashion, beauty & lifestyle
              </Text>
            </View>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate('Wishlist')}
              style={styles.headerAction}>
              <FontAwesome name="heart" size={16} color={colors.textDark} solid />
              {wishlistCount > 0 ? <Text style={styles.badge}>{wishlistCount}</Text> : null}
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Cart')}
              style={styles.headerAction}>
              <FontAwesome name="shopping-bag" size={16} color={colors.textDark} />
              {cartCount > 0 ? <Text style={styles.badge}>{cartCount}</Text> : null}
            </Pressable>
          </View>
        </View>
        <View style={styles.headerNav}>
          {headerLinks.map(item => (
            <Pressable
              key={item.label}
              onPress={() =>
                navigation.navigate(
                  'ProductList',
                  item.category
                    ? { category: item.category }
                    : { query: item.query },
                )
              }
              style={styles.headerNavItem}>
              <Text style={styles.headerNavText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.searchShell}>
          <FontAwesome name="search" size={13} color={colors.textMuted} />
          <Pressable
            style={styles.searchPress}
            onPress={() => navigation.navigate('ProductList')}>
            <Text style={styles.searchPlaceholder}>
              {isListening ? 'Listening...' : 'Search for brands, styles and offers'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voice search"
            accessibilityState={{ busy: isListening }}
            onPress={handleVoiceSearch}
            style={[styles.micButton, isListening && styles.micButtonActive]}>
            <FontAwesome
              name="microphone"
              size={13}
              color={isListening ? colors.white : colors.primaryColor}
            />
          </Pressable>
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator
        contentContainerStyle={styles.content}>
        <View style={styles.statusStrip}>
          <View style={styles.statusItem}>
            <FontAwesome name="map-marker-alt" size={13} color={colors.primaryColor} />
            <View style={styles.statusCopy}>
              <Text style={styles.statusLabel}>Delivering to</Text>
              <Text style={styles.statusValue} numberOfLines={1}>
                Use current location at checkout
              </Text>
            </View>
          </View>
          <View style={styles.statusItem}>
            <FontAwesome name="bell" size={13} color={colors.accentColor} solid />
            <View style={styles.statusCopy}>
              <Text style={styles.statusLabel}>Notifications</Text>
              <Text style={styles.statusValue} numberOfLines={1}>
                Price drops and delivery updates
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.topTabs}>
          <TopTab icon="home" label="Home" onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} />
          <TopTab icon="store" label="Shop" onPress={() => navigation.navigate('ProductList')} />
          <TopTab icon="heart" label="Wishlist" onPress={() => navigation.navigate('Wishlist')} />
          <TopTab icon="shopping-bag" label="Cart" onPress={() => navigation.navigate('Cart')} />
          <TopTab icon="arrow-down" label="View all" onPress={scrollToProducts} />
        </View>

        <View style={styles.bannerSection}>
          <FlatList
            horizontal
            pagingEnabled
            data={heroBanners}
            keyExtractor={item => item.id}
            renderItem={renderBanner}
            showsHorizontalScrollIndicator={false}
            snapToInterval={bannerWidth}
            decelerationRate="fast"
            onMomentumScrollEnd={handleBannerScroll}
            style={styles.bannerList}
          />
        </View>
        <View style={styles.dots}>
          {heroBanners.map((item, index) => (
            <View
              key={item.id}
              style={[styles.dot, activeBanner === index && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.metricsRow}>
          <Metric icon="store" label="Products" value={`${products.length}+`} />
          <Metric icon="truck" label="Delivery" value="30 min" />
          <Metric icon="credit-card" label="Checkout" value="5 modes" />
        </View>

        <SectionHeader
          title="Shop by category"
          actionLabel="View all"
          onAction={scrollToProducts}
        />
        <FlatList
          horizontal
          data={categories}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <Pressable
              style={styles.categoryCard}
              onPress={() => navigation.navigate('ProductList', { category: item })}>
              <ImageBackground
                source={{ uri: categoryMeta[item]?.image }}
                imageStyle={styles.categoryImage}
                style={styles.categoryImageWrap}>
                <View style={styles.categoryShade}>
                  <View style={styles.categoryIconWrap}>
                    <FontAwesome name={categoryMeta[item]?.icon ?? 'tag'} size={13} color={colors.white} />
                  </View>
                  <View>
                    <Text style={styles.categoryText}>{item}</Text>
                    <Text style={styles.categorySubText}>{categoryMeta[item]?.label ?? 'Explore'}</Text>
                  </View>
                </View>
              </ImageBackground>
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />

        <View
          onLayout={event => {
            productsY.current = event.nativeEvent.layout.y;
          }}>
          <SectionHeader title="Recommended for you" />
        </View>
        <FlatList
          horizontal
          data={recommended}
          keyExtractor={item => item.id}
          renderItem={renderProduct}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          initialNumToRender={4}
        />

        <View style={styles.shopBand}>
          <PremiumPattern />
          <View style={styles.shopBandCopy}>
            <Text style={styles.shopBandKicker}>Shop smarter</Text>
            <Text style={styles.shopBandTitle}>Save picks and checkout faster</Text>
            <Text style={styles.shopBandText}>
              Keep your favourite styles in wishlist, compare deals and move everything to cart when you are ready.
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Wishlist')}
            style={styles.aiButton}>
            <FontAwesome name="heart" size={14} color={colors.white} solid />
          </Pressable>
        </View>

        <SectionHeader title="Popular picks" />
        <FlatList
          horizontal
          data={popular}
          keyExtractor={item => item.id}
          renderItem={renderProduct}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          initialNumToRender={4}
        />

        <View style={styles.orderBand}>
          <PremiumPattern />
          <View>
            <Text style={styles.orderTitle}>Order value starts at {formatCurrency(599)}</Text>
            <Text style={styles.orderCopy}>Cart, checkout, payment, order success and order history are ready.</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('MyOrders')} style={styles.orderButton}>
            <FontAwesome name="receipt" size={13} color={colors.white} />
          </Pressable>
        </View>
      </ScrollView>
      <AiAssistant cartItems={cartItems} wishlistItems={wishlistItems} />
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

const categoryMeta: Record<string, { icon: string; image: string; label: string }> = {
  Men: {
    icon: 'male',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
    label: 'Shirts, denim',
  },
  Women: {
    icon: 'female',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600',
    label: 'Dresses, jeans',
  },
  Kids: {
    icon: 'child',
    image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600',
    label: 'Playful fits',
  },
  Ethnic: {
    icon: 'gem',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
    label: 'Festive sets',
  },
  Footwear: {
    icon: 'shoe-prints',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
    label: 'Sneakers, more',
  },
  Accessories: {
    icon: 'glasses',
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600',
    label: 'Bags, eyewear',
  },
  Winterwear: {
    icon: 'snowflake',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600',
    label: 'Jackets, layers',
  },
};

const Metric = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.metric}>
    <FontAwesome name={icon} size={13} color={colors.accentColor} />
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const TopTab = ({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} style={styles.topTab}>
    <FontAwesome name={icon} size={12} color={colors.primaryColor} solid={icon === 'heart'} />
    <Text style={styles.topTabText}>{label}</Text>
  </Pressable>
);

const PremiumPattern = () => (
  <View pointerEvents="none" style={styles.pattern}>
    <View style={[styles.patternLine, styles.patternLineOne]} />
    <View style={[styles.patternLine, styles.patternLineTwo]} />
    <View style={[styles.patternLine, styles.patternLineThree]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 96,
  },
  headerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    overflow: 'hidden',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  logoRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: radii.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inkSoft,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.premiumPurpleSoft,
  },
  logoText: {
    color: colors.white,
    fontSize: 21,
    fontWeight: '900',
    zIndex: 1,
  },
  logoAccent: {
    position: 'absolute',
    bottom: -12,
    right: -10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryColor,
  },
  logoCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.textDark,
    fontSize: 15,
    fontWeight: '900',
  },
  headerMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 18,
    color: colors.white,
    backgroundColor: colors.primaryColor,
    fontSize: 10,
    fontWeight: '900',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  headerNavItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerNavText: {
    color: colors.textDark,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  searchShell: {
    minHeight: 44,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  topTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  topTab: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 4,
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  topTabText: {
    color: colors.textDark,
    fontSize: 10,
    fontWeight: '900',
  },
  statusStrip: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusItem: {
    flex: 1,
    minHeight: 62,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  statusCopy: {
    flex: 1,
    minWidth: 0,
  },
  statusLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusValue: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  searchPress: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  micButton: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightPurple,
  },
  micButtonActive: {
    backgroundColor: colors.primaryColor,
  },
  searchPlaceholder: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  bannerList: {
    overflow: 'visible',
  },
  bannerSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  hero: {
    height: 204,
    borderRadius: radii.sm,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  heroImage: {
    borderRadius: radii.sm,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.overlayLight,
  },
  offerPill: {
    alignSelf: 'flex-start',
    minHeight: 26,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(21,20,18,0.72)',
    borderWidth: 1,
    borderColor: colors.overlayBorder,
    marginBottom: spacing.sm,
  },
  offerText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
  },
  heroCopy: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryButton: {
    minHeight: 46,
    flex: 1,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryColor,
    paddingHorizontal: spacing.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: 1,
    borderColor: colors.overlayBorder,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    color: colors.white,
    fontWeight: '900',
  },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primaryColor,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  metric: {
    flex: 1,
    minHeight: 82,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  metricValue: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 7,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  horizontalList: {
    paddingRight: spacing.sm,
    paddingBottom: spacing.lg,
  },
  categoryCard: {
    width: 132,
    height: 166,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginRight: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  categoryImageWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryImage: {
    borderRadius: radii.sm,
    resizeMode: 'cover',
  },
  categoryShade: {
    minHeight: 78,
    justifyContent: 'space-between',
    padding: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  categoryIconWrap: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryColor,
    borderWidth: 1,
    borderColor: colors.overlayBorder,
    marginBottom: spacing.sm,
  },
  categoryText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '900',
  },
  categorySubText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  shopBand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  shopBandCopy: {
    flex: 1,
  },
  shopBandKicker: {
    color: colors.accentColor,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  shopBandTitle: {
    color: colors.textDark,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    marginTop: 5,
  },
  shopBandText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 7,
  },
  aiButton: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryColor,
  },
  orderBand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  orderTitle: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '900',
  },
  orderCopy: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 5,
    maxWidth: 260,
  },
  orderButton: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryColor,
    marginLeft: 'auto',
  },
  pattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 1,
  },
  patternLine: {
    position: 'absolute',
    width: 180,
    height: 1,
    backgroundColor: colors.patternLine,
    transform: [{ rotate: '-28deg' }],
  },
  patternLineOne: {
    top: 14,
    right: -42,
  },
  patternLineTwo: {
    top: 46,
    right: -58,
  },
  patternLineThree: {
    bottom: 18,
    left: -52,
  },
});

export default HomeScreen;

