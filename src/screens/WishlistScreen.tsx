import React from 'react';
import { FlatList, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-simple-toast';
import { AppHeader } from '../com/molecules';
import { colors } from '../com/theme/color';
import { addCart } from '../redux/slices/cartSlice';
import {
  clearWishlist,
  removeWishlist,
  toggleWishlist,
} from '../redux/slices/wishlistSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/productTypes';
import type { RootNavigationProp } from '../navigation/types';

type WishlistScreenProps = {
  navigation: RootNavigationProp<'Wishlist'>;
};

const WishlistScreen = ({ navigation }: WishlistScreenProps) => {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const wishlistIds = new Set(wishlistItems.map(item => item.id));

  const moveToCart = (item: Product) => {
    dispatch(addCart(item));
    dispatch(removeWishlist(item.id));
    Toast.show('Moved to cart', Toast.SHORT);
  };

  return (
    <SafeAreaView  edges={['top']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryColor} />
      <AppHeader
        title="Wishlist"
        subtitle={`${wishlistItems.length} saved products`}
        onBack={() => navigation.goBack()}
        rightIcon="trash"
        rightDisabled={wishlistItems.length === 0}
        onRightPress={() => dispatch(clearWishlist())}
      />

      <FlatList
        data={wishlistItems}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isWishlisted={wishlistIds.has(item.id)}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            onAddToCart={() => moveToCart(item)}
            onToggleWishlist={() => dispatch(toggleWishlist(item))}
            style={styles.gridCard}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart"
            title="Your wishlist is waiting"
            message="Save the products you love and move them to cart whenever you are ready."
            actionLabel="Browse products"
            onAction={() => navigation.navigate('ProductList')}
          />
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
    paddingBottom: 30,
  },
  row: {
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    marginRight: 0,
    marginBottom: 14,
  },
});

export default WishlistScreen;

