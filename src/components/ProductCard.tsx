import React from 'react';
import {
  Image,
  Pressable,
  type PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { colors, radii, spacing } from '../theme';
import type { Product } from '../types/productTypes';
import { formatCurrency, formatPercent } from '../utils/format';

type ProductCardProps = {
  product: Product;
  isWishlisted?: boolean;
  onPress: () => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  style?: StyleProp<ViewStyle>;
};

const stopPropagationPress =
  (handler: () => void): PressableProps['onPress'] =>
  event => {
    event.stopPropagation();
    handler();
  };

const ProductCard = React.memo(
  ({
    product,
    isWishlisted = false,
    onPress,
    onAddToCart,
    onToggleWishlist,
    style,
  }: ProductCardProps) => (
    <Pressable onPress={onPress} style={[styles.card, style]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <View
          style={[
            styles.stockPill,
            product.inStock ? styles.stockPillLive : styles.stockPillLow,
          ]}
        >
          <View
            style={[
              styles.stockDot,
              product.inStock ? styles.stockDotLive : styles.stockDotLow,
            ]}
          />
          <Text
            style={[
              styles.stockText,
              product.inStock ? styles.stockTextLive : styles.stockTextLow,
            ]}
          >
            {product.inStock ? 'In stock' : 'Low stock'}
          </Text>
        </View>
        <View style={styles.timePill}>
          <FontAwesome name="bolt" size={9} color={colors.primaryColor} />
          <Text style={styles.timeText}>{product.deliveryMinutes ?? 10} min</Text>
        </View>
        <Pressable
          style={styles.heartButton}
          onPress={stopPropagationPress(onToggleWishlist)}
        >
          <FontAwesome
            name="heart"
            solid={isWishlisted}
            size={15}
            color={isWishlisted ? colors.accentColor : colors.textMuted}
          />
        </Pressable>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {product.unit ?? product.category}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          <Text style={styles.originalPrice}>
            {formatCurrency(product.originalPrice)}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.discount}>{formatPercent(product.discount)}</Text>
          <Pressable
            style={styles.addButton}
            onPress={stopPropagationPress(onAddToCart)}
          >
            <FontAwesome name="plus" size={11} color={colors.white} />
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  ),
);

const styles = StyleSheet.create({
  card: {
    minWidth: 0,
    width: 168,
    height: 286,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
    overflow: 'hidden',
  },
  imageWrap: {
    overflow: 'hidden',
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
  },
  image: {
    width: '100%',
    height: 122,
    backgroundColor: colors.lightPurple,
  },
  timePill: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    minHeight: 24,
    borderRadius: radii.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 7,
  },
  timeText: {
    color: colors.textDark,
    fontSize: 11,
    fontWeight: '900',
  },
  heartButton: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stockPill: {
    position: 'absolute',
    left: 8,
    top: 8,
    minHeight: 24,
    borderRadius: radii.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
  },
  stockPillLive: {
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: 'rgba(15,107,91,0.18)',
  },
  stockPillLow: {
    backgroundColor: colors.errorSoft,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockDotLive: {
    backgroundColor: colors.success,
  },
  stockDotLow: {
    backgroundColor: colors.accentColor,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '900',
  },
  stockTextLive: {
    color: colors.success,
  },
  stockTextLow: {
    color: colors.accentColor,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  name: {
    minHeight: 38,
    color: colors.textDark,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  priceRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 8,
  },
  price: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '900',
  },
  originalPrice: {
    color: colors.textMuted,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  footer: {
    marginTop: 'auto',
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 10,
  },
  discount: {
    flex: 1,
    minWidth: 0,
    color: colors.accentColor,
    fontSize: 12,
    fontWeight: '900',
  },
  addButton: {
    minWidth: 64,
    height: 32,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.secondaryColor,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.premiumPurpleSoft,
  },
  addText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
});

export default ProductCard;
