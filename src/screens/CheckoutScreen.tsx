import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-simple-toast';
import * as yup from 'yup';
import { FormInput } from '../com/atoms';
import { AppHeader } from '../com/molecules';
import { colors } from '../com/theme/color';
import { resetCart } from '../redux/slices/cartSlice';
import { addOrder } from '../redux/slices/orderSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import GradientButton from '../components/GradientButton';
import AppModal from '../components/AppModal';
import type { AddressFormValues, PaymentMethod } from '../types/productTypes';
import type { RootNavigationProp } from '../navigation/types';
import { calculateCartTotal } from './CartScreen';

type CheckoutScreenProps = {
  navigation: RootNavigationProp<'Checkout'>;
};

type AddressTextField = Extract<
  keyof AddressFormValues,
  'fullName' | 'phone' | 'addressLine' | 'city' | 'pincode'
>;

const paymentMethods: { label: PaymentMethod; icon: string; helper: string }[] = [
  { label: 'Cash on Delivery', icon: 'money-bill-wave', helper: 'Pay at doorstep' },
  { label: 'Razorpay', icon: 'rupee-sign', helper: 'Cards, UPI and wallets' },
  { label: 'UPI', icon: 'mobile-alt', helper: 'Instant payment' },
  { label: 'Card', icon: 'credit-card', helper: 'Debit or credit' },
  { label: 'Wallet', icon: 'wallet', helper: 'Fast checkout' },
  { label: 'Net Banking', icon: 'university', helper: 'Bank transfer' },
];

const schema: yup.ObjectSchema<AddressFormValues> = yup.object({
  fullName: yup.string().trim().required('Full name is required'),
  phone: yup.string().trim().matches(/^[0-9]{10}$/, 'Enter a valid 10 digit phone number').required('Phone is required'),
  addressLine: yup.string().trim().required('Address is required'),
  city: yup.string().trim().required('City is required'),
  pincode: yup.string().trim().matches(/^[0-9]{6}$/, 'Enter a valid 6 digit pincode').required('Pincode is required'),
  locationLabel: yup.string().optional(),
  latitude: yup.number().optional(),
  longitude: yup.number().optional(),
});

const CheckoutScreen = ({ navigation }: CheckoutScreenProps) => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(state => state.cart.items);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [locationLoading, setLocationLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [cashOrderId, setCashOrderId] = useState('');
  const { width } = useWindowDimensions();
  const wideLayout = width >= 720;
  const total = useMemo(() => calculateCartTotal(cartItems), [cartItems]);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: '',
      phone: '',
      addressLine: '',
      city: '',
      pincode: '',
      locationLabel: '',
    },
  });
  const locationLabel = watch('locationLabel');

  const useCurrentLocation = useCallback(async () => {
    setLocationLoading(true);

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Toast.show('Location permission is needed to auto-fill location.', Toast.SHORT);
          return;
        }
      }

      setValue('locationLabel', 'Current location selected');
      setValue('latitude', 28.6139);
      setValue('longitude', 77.209);
      Toast.show('Current location added to delivery address.', Toast.SHORT);
    } catch {
      Toast.show('Unable to fetch location. Enter address manually.', Toast.SHORT);
    } finally {
      setLocationLoading(false);
    }
  }, [setValue]);

  const getEstimatedDeliveryAt = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    date.setHours(20, 0, 0, 0);
    return date.toISOString();
  };

  const completeOrder = useCallback((address: AddressFormValues, gatewayReference?: string) => {
    const orderId = `ORD-${Date.now()}`;
    const onlinePayment = paymentMethod !== 'Cash on Delivery';

    dispatch(
      addOrder({
        id: orderId,
        items: cartItems,
        total,
        address,
        paymentMethod,
        paymentStatus: onlinePayment ? 'Paid' : 'COD',
        gatewayReference,
        status: 'Placed',
        createdAt: new Date().toISOString(),
        estimatedDeliveryAt: getEstimatedDeliveryAt(),
        trackingNote: address.locationLabel
          ? `Delivery will be routed to ${address.locationLabel}.`
          : 'Delivery partner will use the saved address and phone number.',
      }),
    );
    dispatch(resetCart());
    if (paymentMethod === 'Cash on Delivery') {
      setCashOrderId(orderId);
      setOrderModalVisible(true);
      return;
    }

    navigation.reset({
      index: 1,
      routes: [{ name: 'Home' }, { name: 'OrderSuccess', params: { orderId } }],
    });
  }, [cartItems, dispatch, navigation, paymentMethod, total]);

  const placeOrder = useCallback((address: AddressFormValues) => {
    if (cartItems.length === 0) {
      navigation.navigate('ProductList');
      return;
    }

    const onlinePayment = paymentMethod !== 'Cash on Delivery';

    if (!onlinePayment) {
      completeOrder(address);
      return;
    }

    setPaymentLoading(true);
    navigation.navigate('Payment', {
      amount: total,
      title: 'ShopNative order payment',
      address,
      method: paymentMethod,
    });
    setPaymentLoading(false);
  }, [cartItems.length, completeOrder, navigation, paymentMethod, total]);

  const renderInput = (
    name: AddressTextField,
    label: string,
    keyboardType: 'default' | 'phone-pad' | 'number-pad' = 'default',
  ) => (
    <View style={[styles.field, name === 'addressLine' && styles.fieldFull]}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <FormInput
            label={label}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType={keyboardType}
            placeholder={label}
            errorMessage={errors[name]?.message}
            containerStyle={styles.formInputContainer}
            inputStyle={styles.formInput}
          />
        )}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryColor} />
      <AppHeader compact title="Checkout" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.checkoutShell, wideLayout && styles.checkoutShellWide]}>
          <View style={styles.mainColumn}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Delivery address</Text>
              <Text style={styles.sectionCount}>1</Text>
            </View>
            <View style={styles.addressGrid}>
              {renderInput('fullName', 'Full name')}
              {renderInput('phone', 'Phone number', 'phone-pad')}
              {renderInput('addressLine', 'Address line')}
              {renderInput('city', 'City')}
              {renderInput('pincode', 'Pincode', 'number-pad')}
            </View>

            <Pressable
              style={styles.locationButton}
              onPress={useCurrentLocation}
              disabled={locationLoading}>
              <FontAwesome name="location-arrow" size={15} color={colors.primaryColor} />
              <Text style={styles.locationButtonText}>
                {locationLoading ? 'Checking location...' : 'Use current location'}
              </Text>
            </Pressable>
            {locationLabel ? (
              <View style={styles.locationPill}>
                <FontAwesome name="map-marker-alt" size={13} color={colors.success} />
                <Text style={styles.locationText}>{locationLabel}</Text>
              </View>
            ) : null}

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Payment method</Text>
              <Text style={styles.sectionCount}>2</Text>
            </View>
            <View style={styles.paymentGrid}>
              {paymentMethods.map(method => {
                const selected = paymentMethod === method.label;
                return (
                  <Pressable
                    key={method.label}
                    style={[styles.paymentRow, selected && styles.paymentRowSelected]}
                    onPress={() => setPaymentMethod(method.label)}>
                    <View style={[styles.paymentIcon, selected && styles.paymentIconSelected]}>
                      <FontAwesome
                        name={method.icon}
                        size={15}
                        color={selected ? colors.white : colors.primaryColor}
                      />
                    </View>
                    <View style={styles.paymentCopy}>
                      <Text style={[styles.paymentText, selected && styles.paymentTextSelected]}>
                        {method.label}
                      </Text>
                      <Text style={styles.paymentHelper}>{method.helper}</Text>
                    </View>
                    <FontAwesome
                      name={selected ? 'check-circle' : 'circle'}
                      solid={selected}
                      size={18}
                      color={selected ? colors.primaryColor : colors.textMuted}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.summary, wideLayout && styles.summaryWide]}>
            <Text style={styles.summaryTitle}>Order summary</Text>
            {cartItems.map(item => (
              <View key={`${item.id}-${item.selectedColor ?? ''}`} style={styles.summaryRow}>
                <Text style={styles.summaryLabel} numberOfLines={1}>
                  {item.name} x {item.quantity}
                </Text>
                <Text style={styles.summaryValue}>{'\u20B9'}{item.price * item.quantity}</Text>
              </View>
            ))}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.freeText}>Free</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{'\u20B9'}{total}</Text>
            </View>
            <GradientButton
              title={paymentMethod === 'Cash on Delivery' ? 'Place Order' : 'Pay and Place Order'}
              disabled={cartItems.length === 0}
              loading={paymentLoading}
              onPress={handleSubmit(placeOrder)}
              style={styles.placeButton}
            />
          </View>
        </View>
      </ScrollView>
      <AppModal
        visible={orderModalVisible}
        icon="check-circle"
        title="Order placed"
        message="Your Cash on Delivery order has been placed."
        primaryAction={{
          label: 'View order',
          onPress: () => {
            setOrderModalVisible(false);
            navigation.reset({
              index: 1,
              routes: [
                { name: 'Home' },
                { name: 'OrderSuccess', params: { orderId: cashOrderId } },
              ],
            });
          },
        }}
        onRequestClose={() => setOrderModalVisible(false)}
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
    paddingBottom: 32,
  },
  checkoutShell: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    gap: 16,
  },
  checkoutShellWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionCount: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: 'hidden',
    color: colors.white,
    backgroundColor: colors.primaryColor,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '900',
  },
  addressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  field: {
    flexGrow: 1,
    flexBasis: 148,
  },
  fieldFull: {
    flexBasis: '100%',
  },
  formInputContainer: {
    marginBottom: 0,
  },
  formInput: {
    minHeight: 50,
    borderRadius: 8,
  },
  locationButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginTop: 14,
    marginBottom: 10,
  },
  locationButtonText: {
    color: colors.primaryColor,
    fontWeight: '900',
  },
  locationPill: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.successSoft,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  locationText: {
    color: colors.success,
    fontWeight: '800',
  },
  paymentGrid: {
    gap: 10,
  },
  paymentRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    gap: 12,
  },
  paymentRowSelected: {
    borderColor: colors.primaryColor,
    backgroundColor: colors.purpleTint,
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightPurple,
  },
  paymentIconSelected: {
    backgroundColor: colors.primaryColor,
  },
  paymentCopy: {
    flex: 1,
  },
  paymentText: {
    color: colors.textDark,
    fontWeight: '900',
  },
  paymentTextSelected: {
    color: colors.primaryColor,
  },
  paymentHelper: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '700',
  },
  summary: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginTop: 10,
  },
  summaryWide: {
    width: 320,
    marginTop: 8,
  },
  summaryTitle: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  summaryLabel: {
    flex: 1,
    color: colors.textMuted,
    fontWeight: '700',
  },
  summaryValue: {
    color: colors.textDark,
    fontWeight: '900',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  freeText: {
    color: colors.success,
    fontWeight: '900',
  },
  totalLabel: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '900',
  },
  totalValue: {
    color: colors.primaryColor,
    fontSize: 18,
    fontWeight: '900',
  },
  placeButton: {
    marginTop: 10,
  },
});

export default CheckoutScreen;

