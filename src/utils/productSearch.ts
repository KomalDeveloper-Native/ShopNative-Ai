import type { Product } from '../types/productTypes';

const budgetPattern =
  /(?:under|below|less than|upto|up to)\s*(?:rs|inr|\u20B9)?\s*(\d+)/i;

export const extractBudget = (query: string): number | null => {
  const match = query.match(budgetPattern);
  return match ? Number(match[1]) : null;
};

export const searchProducts = (products: Product[], query: string): Product[] => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return products;
  }

  const budget = extractBudget(normalizedQuery);
  const keywords = normalizedQuery
    .replace(budgetPattern, ' ')
    .replace(/[\u20B9,]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter(word => !['rs', 'inr', 'price'].includes(word));

  return products.filter(product => {
    const searchable = [
      product.name,
      product.category,
      product.description,
      product.price.toString(),
      product.originalPrice.toString(),
      product.unit,
      ...product.colors,
      ...product.sizes,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesKeywords =
      keywords.length === 0 || keywords.every(word => searchable.includes(word));
    const matchesBudget = budget === null || product.price <= budget;

    return matchesKeywords && matchesBudget;
  });
};
