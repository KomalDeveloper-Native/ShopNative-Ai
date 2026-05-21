import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import PremiumButton from '../components/PremiumButton';
import AppModal from '../components/AppModal';
import { resetCart } from '../redux/slices/cartSlice';
import { addOrder } from '../redux/slices/orderSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { CartItem, PaymentMethod } from '../types/productTypes';
import { formatCurrency } from '../utils/format';
import {
  RAZORPAY_KEY_ID,
  createRazorpayOrder,
  isRazorpayConfigured,
  openRazorpayCheckout,
  paiseFromRupees,
  verifyRazorpayPayment,
} from '../services/paymentGateway';

type Route = RouteProp<RootStackParamList, 'Payment'>;

type GatewayMethod = Exclude<PaymentMethod, 'Cash on Delivery'>;

const methodMeta: Record<GatewayMethod, { icon: string; title: string; helper: string }> = {
  Razorpay: {
    icon: 'rupee-sign',
    title: 'Razorpay',
    helper: 'Cards, UPI, wallets and net banking',
  },
  UPI: {
    icon: 'mobile-alt',
    title: 'UPI',
    helper: 'Pay through any installed UPI app',
  },
  Card: {
    icon: 'credit-card',
    title: 'Card',
    helper: 'Debit and credit cards',
  },
  Wallet: {
    icon: 'wallet',
    title: 'Wallet',
    helper: 'Supported Razorpay wallets',
  },
  'Net Banking': {
    icon: 'university',
    title: 'Net Banking',
    helper: 'Pay from your bank account',
  },
};

const paymentMethods = Object.keys(methodMeta) as GatewayMethod[];

const getEstimatedDeliveryAt = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  date.setHours(20, 0, 0, 0);
  return date.toISOString();
};

const getMethodHints = (method: GatewayMethod) => ({
  upi: method === 'Razorpay' || method === 'UPI',
  card: method === 'Razorpay' || method === 'Card',
  wallet: method === 'Razorpay' || method === 'Wallet',
  netbanking: method === 'Razorpay' || method === 'Net Banking',
});

const PaymentScreen = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<Route>();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(state => state.cart.items);
  const [method, setMethod] = useState<GatewayMethod>(
    params?.method && params.method !== 'Cash on Delivery' ? params.method : 'Razorpay',
  );
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    visible: boolean;
    icon?: string;
    title: string;
    message: string;
    actionLabel?: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });
  const [cancelVisible, setCancelVisible] = useState(false);
  const { width } = useWindowDimensions();
  const wideLayout = width >= 760;
  const amount = params?.amount ?? 0;
  const address = params?.address;

  const summaryData = useMemo(
    () =>
      cartItems.map(item => ({
        key: `${item.id}-${item.selectedColor ?? ''}-${item.selectedSize ?? ''}`,
        item,
      })),
    [cartItems],
  );

  const canPay = useMemo(
    () => Boolean(address && cartItems.length > 0 && amount > 0 && isRazorpayConfigured()),
    [address, amount, cartItems.length],
  );

  const completePaidOrder = useCallback(
    (gatewayReference: string, verified: boolean) => {
      if (!address || cartItems.length === 0) {
        setModal({
          visible: true,
          icon: 'shopping-bag',
          title: 'Payment unavailable',
          message: 'Your cart or delivery address is missing.',
        });
        return;
      }

      const orderId = `ORD-${Date.now()}`;
      dispatch(
        addOrder({
          id: orderId,
          items: cartItems,
          total: amount,
          address,
          paymentMethod: method,
          paymentStatus: 'Paid',
          gatewayReference,
          status: 'Placed',
          createdAt: new Date().toISOString(),
          estimatedDeliveryAt: getEstimatedDeliveryAt(),
          trackingNote: verified
            ? 'Payment verified. Your order is now being packed.'
            : 'Payment captured. Server verification is pending.',
        }),
      );
      dispatch(resetCart());
      navigation.reset({
        index: 1,
        routes: [{ name: 'MainTabs' }, { name: 'OrderSuccess', params: { orderId } }],
      });
    },
    [address, amount, cartItems, dispatch, method, navigation],
  );

  const handlePayment = useCallback(async () => {
    if (!address || cartItems.length === 0) {
      setModal({
        visible: true,
        icon: 'shopping-bag',
        title: 'Payment unavailable',
        message: 'Your cart or delivery address is missing.',
      });
      return;
    }

    if (!isRazorpayConfigured()) {
      setModal({
        visible: true,
        icon: 'key',
        title: 'Payment key needed',
        message:
          'Add your Razorpay key id in src/services/paymentGateway.ts, then rebuild the app to enable live checkout.',
      });
      return;
    }

    setLoading(true);
    try {
      const serverOrder = await createRazorpayOrder(amount, cartItems);
      const razorpayOrderId = serverOrder?.id ?? serverOrder?.orderId;
      const response = await openRazorpayCheckout({
        key: RAZORPAY_KEY_ID,
        amount: serverOrder?.amount ?? paiseFromRupees(amount),
        currency: serverOrder?.currency ?? 'INR',
        name: 'ShopNative',
        description: params?.title ?? 'ShopNative order payment',
        order_id: razorpayOrderId,
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        notes: {
          city: address.city,
          pincode: address.pincode,
          method,
        },
        theme: {
          color: colors.primaryColor,
        },
        method: getMethodHints(method),
      });

      const verified = await verifyRazorpayPayment({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        amount,
        method,
      });

      completePaidOrder(response.razorpay_payment_id, verified);
    } catch (error: any) {
      const message =
        error?.description ||
        error?.error?.description ||
        'The payment was cancelled or rejected. No order was placed and your cart is still available.';
      setModal({
        visible: true,
        icon: 'exclamation-circle',
        title: 'Payment not completed',
        message,
      });
    } finally {
      setLoading(false);
    }
  }, [address, amount, cartItems, completePaidOrder, method, params?.title]);

  const handleCancel = useCallback(() => {
    setCancelVisible(true);
  }, []);

  const renderSummaryItem = useCallback(
    ({ item }: { item: { key: string; item: CartItem } }) => <SummaryRow item={item.item} />,
    [],
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.container, wideLayout && styles.containerWide]}>
        <View style={styles.headerRow}>
          <Pressable onPress={handleCancel} style={styles.back}>
            <FontAwesome name="arrow-left" size={14} color={colors.white} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Secure checkout</Text>
            <Text style={styles.heading}>Complete payment</Text>
          </View>
        </View>

        <View style={[styles.content, wideLayout && styles.contentWide]}>
          <LinearGradient
            colors={[colors.surface, colors.surfaceSoft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.paymentPanel, wideLayout && styles.paymentPanelWide]}>
            <View style={styles.amountBlock}>
              <Text style={styles.label}>Payable amount</Text>
              <Text style={styles.amount}>{formatCurrency(amount)}</Text>
              <Text style={styles.subheading}>{params?.title ?? 'ShopNative order payment'}</Text>
            </View>

            <View style={styles.methodGrid}>
              {paymentMethods.map(item => (
                <GatewayOption
                  key={item}
                  method={item}
                  selected={method === item}
                  onPress={() => setMethod(item)}
                />
              ))}
            </View>

            <View style={[styles.stateBanner, !canPay && styles.stateBannerWarning]}>
              <FontAwesome
                name={canPay ? 'shield-alt' : 'exclamation-circle'}
                size={14}
                color={canPay ? colors.success : colors.warning}
              />
              <Text style={styles.stateText}>
                {canPay
                  ? 'Razorpay will collect the payment and return a verified payment id.'
                  : 'Configure the Razorpay key and keep cart/address ready before collecting payment.'}
              </Text>
            </View>

            <PremiumButton
              title={`Pay ${formatCurrency(amount)}`}
              onPress={handlePayment}
              loading={loading}
              disabled={loading || !address || cartItems.length === 0 || amount <= 0}
              style={styles.button}
            />
            <PremiumButton
              title="Cancel payment"
              onPress={handleCancel}
              variant="ghost"
              style={styles.secondaryButton}
            />
          </LinearGradient>

          <View style={[styles.summaryPanel, wideLayout && styles.summaryPanelWide]}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Order summary</Text>
              <Text style={styles.summaryCount}>{cartItems.length} items</Text>
            </View>
            <FlatList
              data={summaryData}
              keyExtractor={item => item.key}
              renderItem={renderSummaryItem}
              style={styles.summaryList}
              initialNumToRender={6}
              maxToRenderPerBatch={8}
              windowSize={5}
              removeClippedSubviews
            />
            <View style={styles.summaryDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(amount)}</Text>
            </View>
          </View>
        </View>
      </View>
      <AppModal
        visible={modal.visible}
        icon={modal.icon}
        title={modal.title}
        message={modal.message}
        primaryAction={{
          label: modal.actionLabel ?? 'Got it',
          onPress: () => setModal(current => ({ ...current, visible: false })),
        }}
        onRequestClose={() => setModal(current => ({ ...current, visible: false }))}
      />
      <AppModal
        visible={cancelVisible}
        icon="ban"
        title="Cancel payment?"
        message="No amount will be captured and your cart will stay available."
        secondaryAction={{
          label: 'Keep paying',
          onPress: () => setCancelVisible(false),
        }}
        primaryAction={{
          label: 'Cancel payment',
          variant: 'danger',
          onPress: () => {
            setCancelVisible(false);
            navigation.goBack();
          },
        }}
        onRequestClose={() => setCancelVisible(false)}
      />
    </SafeAreaView>
  );
};

const GatewayOption = memo(
  ({
    method,
    selected,
    onPress,
  }: {
    method: GatewayMethod;
    selected: boolean;
    onPress: () => void;
  }) => {
    const meta = methodMeta[method];

    return (
      <Pressable onPress={onPress} style={[styles.gateway, selected && styles.gatewayActive]}>
        <View style={[styles.gatewayIcon, selected && styles.gatewayIconActive]}>
          <FontAwesome
            name={meta.icon}
            size={14}
            color={selected ? colors.white : colors.primaryColor}
          />
        </View>
        <View style={styles.gatewayCopy}>
          <Text style={[styles.gatewayText, selected && styles.gatewayTextActive]}>
            {meta.title}
          </Text>
          <Text style={styles.gatewayHelper} numberOfLines={1}>
            {meta.helper}
          </Text>
        </View>
        <FontAwesome
          name={selected ? 'check-circle' : 'circle'}
          solid={selected}
          size={17}
          color={selected ? colors.primaryColor : colors.textMuted}
        />
      </Pressable>
    );
  },
);

const SummaryRow = memo(({ item }: { item: CartItem }) => (
  <View style={styles.summaryRow}>
    <View style={styles.summaryCopy}>
      <Text style={styles.summaryLabel} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.summaryMeta}>
        Qty {item.quantity}
        {item.selectedSize ? ` | ${item.selectedSize}` : ''}
        {item.selectedColor ? ` | ${item.selectedColor}` : ''}
      </Text>
    </View>
    <Text style={styles.summaryValue}>{formatCurrency(item.price * item.quantity)}</Text>
  </View>
));

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 18 },
  containerWide: {
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primaryColor,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heading: {
    color: colors.textDark,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 14,
    marginTop: 22,
  },
  contentWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  paymentPanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  paymentPanelWide: {
    flex: 1,
  },
  amountBlock: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  amount: {
    color: colors.textDark,
    fontSize: 38,
    fontWeight: '900',
    marginTop: 8,
  },
  subheading: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    marginTop: 6,
  },
  methodGrid: {
    gap: 10,
    marginTop: 16,
  },
  gateway: {
    minHeight: 64,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  gatewayActive: {
    borderColor: colors.primaryColor,
    backgroundColor: colors.purpleTint,
  },
  gatewayIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
  },
  gatewayIconActive: {
    backgroundColor: colors.primaryColor,
  },
  gatewayCopy: {
    flex: 1,
    minWidth: 0,
  },
  gatewayText: {
    color: colors.textDark,
    fontWeight: '900',
  },
  gatewayTextActive: {
    color: colors.primaryColor,
  },
  gatewayHelper: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  stateBanner: {
    minHeight: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    marginTop: 16,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.35)',
  },
  stateBannerWarning: {
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderColor: 'rgba(168,85,247,0.35)',
  },
  stateText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
  button: { marginTop: 18 },
  secondaryButton: { marginTop: 12 },
  summaryPanel: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    backgroundColor: colors.surface,
  },
  summaryPanelWide: {
    width: 330,
    flex: 0,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  summaryTitle: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '900',
  },
  summaryCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  summaryList: {
    maxHeight: 280,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  summaryLabel: {
    color: colors.textDark,
    fontWeight: '900',
  },
  summaryMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
    fontWeight: '700',
  },
  summaryValue: {
    color: colors.textDark,
    fontWeight: '900',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: colors.textDark,
    fontSize: 17,
    fontWeight: '900',
  },
  totalValue: {
    color: colors.primaryColor,
    fontSize: 20,
    fontWeight: '900',
  },
});

export default PaymentScreen;
