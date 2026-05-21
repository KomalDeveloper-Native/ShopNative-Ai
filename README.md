# ShopNative_AI

ShopNative_AI is a React Native shopping app with Firebase authentication, persisted cart and wishlist, smart product search, checkout, and order history. The UI uses a consistent purple/pink theme from `src/com/theme/color.tsx`.

## Features

- Firebase email/password registration and login
- Google Sign-In
- Auth-based app routing
- Blinkit-style shopping home with categories and product sections
- Smart product search for queries like `red shoes under 3000`
- Product list, product details, color/size selection, and quantity selection
- Redux Toolkit cart with redux-persist
- Persisted wishlist with filled heart state
- Checkout with address validation and payment method selection
- Persisted order history with order status
- Profile screen with orders, wishlist, and logout

## Tech Stack

- React Native
- TypeScript
- Firebase Auth
- Google Sign-In
- React Navigation
- Redux Toolkit
- redux-persist
- React Hook Form
- Yup
- Axios
- React Native Linear Gradient
- React Native Vector Icons

## Screenshots

Add screenshots here after running the app:

- Login
- Home
- Product List
- Product Detail
- Cart
- Checkout
- Orders

## Folder Structure

```text
src
├── com
│   ├── atoms
│   ├── navigation
│   ├── pages
│   ├── theme
│   └── utils
│       ├── Auth
│       ├── Redux
│       └── Validation
├── components
├── data
├── screens
├── services
├── types
└── utils
```

## Setup

```bash
npm install
npm run start
npm run android
```

Configure Firebase before running on a device:

- Add Android Firebase config to `android/app/google-services.json`
- Add iOS Firebase config to `ios/GoogleService-Info.plist`
- Configure the Google Sign-In web client ID in `src/com/pages/LoginScreen.tsx`

## Demo Flow

1. Create an account with full name, email, password, and confirm password.
2. Browse Home sections: Recommended for you, Popular deals, and Under ₹999.
3. Search with natural phrases such as `black tshirt` or `bag below 1500`.
4. Open a product, choose color, size, and quantity.
5. Add products to wishlist or cart.
6. Move wishlist items to cart.
7. Checkout with address details and payment method.
8. View placed orders from Profile > My Orders.
