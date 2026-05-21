import { products } from '../data/products';
import type { CartItem, Product } from '../types/productTypes';

export const getRecommendedProducts = (
  cartItems: CartItem[] = [],
  limit = 3,
): Product[] => {
  const cartIds = new Set(cartItems.map(item => item.id));
  const cartCategories = new Set(cartItems.map(item => item.category));
  const averagePrice =
    cartItems.length > 0
      ? cartItems.reduce((sum, item) => sum + item.originalPrice, 0) / cartItems.length
      : 1800;

  return products
    .filter(product => !cartIds.has(product.id))
    .map(product => {
      const categoryScore = cartCategories.has(product.category) ? 2 : 0;
      const priceScore = product.price <= averagePrice + 800 ? 1 : 0;

      return {
        product,
        score: categoryScore + priceScore + product.rating / 10,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product);
};

export const getSimilarProducts = (product: Product, limit = 6): Product[] =>
  products
    .filter(item => item.id !== product.id)
    .map(item => {
      const categoryScore = item.category === product.category ? 3 : 0;
      const priceScore = Math.abs(item.price - product.price) < 1000 ? 1 : 0;
      const colorScore = item.colors.some(color => product.colors.includes(color)) ? 1 : 0;

      return {
        product: item,
        score: categoryScore + priceScore + colorScore + item.rating / 10,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product);
