export const formatCurrency = (value: number): string =>
  `\u20B9${Math.round(value).toLocaleString('en-IN')}`;

export const formatPercent = (value: number): string => `${value}% off`;

export const getCartSubtotal = <T extends { price: number; quantity: number }>(
  items: T[],
): number => items.reduce((sum, item) => sum + item.price * item.quantity, 0);
