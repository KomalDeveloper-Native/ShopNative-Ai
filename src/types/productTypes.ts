export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  image: string;
  description: string;
  colors: string[];
  sizes: string[];
  unit?: string;
  deliveryMinutes?: number;
  inStock?: boolean;
  sectionTags?: ProductSection[];
};

export type CartItem = Product & {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
};

export type WishlistItem = Product;

export type ProductCategory =
  | 'Men'
  | 'Women'
  | 'Kids'
  | 'Ethnic'
  | 'Footwear'
  | 'Accessories'
  | 'Winterwear';

export type ProductSection = 'recommended' | 'popular' | 'under199';

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'Razorpay'
  | 'UPI'
  | 'Card'
  | 'Wallet'
  | 'Net Banking';

export type AddressFormValues = {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  pincode: string;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
};

export type OrderStatus = 'Placed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Paid' | 'COD' | 'Refunded' | 'Cancelled';

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  address: AddressFormValues;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  gatewayReference?: string;
  status: OrderStatus;
  createdAt: string;
  estimatedDeliveryAt?: string;
  trackingNote?: string;
};
