import React from 'react';
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { AppHeader } from '../com/molecules';
import { colors } from '../com/theme/color';
import { cancelOrder } from '../redux/slices/orderSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import EmptyState from '../components/EmptyState';
import AppModal from '../components/AppModal';
import type { Order } from '../types/productTypes';
import type { RootNavigationProp } from '../navigation/types';

type MyOrdersScreenProps = {
  navigation: RootNavigationProp<'MyOrders'>;
};

const statusFlow = ['Placed', 'Packed', 'Shipped', 'Delivered'];

const formatDeliveryTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString([], {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Delivery time will update soon';

const MyOrdersScreen = ({ navigation }: MyOrdersScreenProps) => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(state => state.orders.items);
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const [cancelTarget, setCancelTarget] = React.useState<Order | null>(null);

  const requestCancelOrder = (order: Order) => {
    setCancelTarget(order);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderPanel}>
      <View style={styles.cardTop}>
        <View style={styles.orderTitleBlock}>
          <Text style={styles.orderId}>{item.id}</Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString([], {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.amountBlock}>
          <Text style={styles.total}>{'\u20B9'}{item.total}</Text>
          <Text style={[styles.statusBadge, item.status === 'Cancelled' && styles.cancelledBadge]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.itemsText}>
        {item.items.length} item{item.items.length === 1 ? '' : 's'} - {item.paymentMethod}
      </Text>

      <View style={styles.deliveryBox}>
        <View style={styles.deliveryRow}>
          <FontAwesome name="clock" size={13} color={colors.primaryColor} />
          <Text style={styles.deliveryText}>
            Estimated delivery by {formatDeliveryTime(item.estimatedDeliveryAt)}
          </Text>
        </View>
        <View style={styles.deliveryRow}>
          <FontAwesome name="credit-card" size={13} color={colors.primaryColor} />
          <Text style={styles.deliveryText}>
            Payment {item.paymentStatus ?? 'Pending'}
            {item.gatewayReference ? ` - ${item.gatewayReference}` : ''}
          </Text>
        </View>
        <View style={styles.deliveryRow}>
          <FontAwesome name="map-marker-alt" size={13} color={colors.primaryColor} />
          <Text style={styles.deliveryText}>
            {item.address.locationLabel || `${item.address.city} ${item.address.pincode}`}
          </Text>
        </View>
        {item.trackingNote ? <Text style={styles.trackingNote}>{item.trackingNote}</Text> : null}
      </View>

      <View style={[styles.statusRow, compact && styles.statusRowCompact]}>
        {item.status === 'Cancelled' ? (
          <View style={styles.cancelledState}>
            <FontAwesome name="times-circle" size={18} color={colors.error} />
            <Text style={styles.cancelledText}>Cancelled before delivery</Text>
          </View>
        ) : (
          statusFlow.map((status, index) => {
            const active = statusFlow.indexOf(status) <= statusFlow.indexOf(item.status);
            return (
              <View key={status} style={styles.statusItem}>
                {index > 0 ? (
                  <View style={[styles.statusLine, active && styles.statusLineActive]} />
                ) : null}
                <View style={[styles.statusDot, active && styles.statusDotActive]} />
                <Text style={[styles.statusText, active && styles.statusTextActive]}>
                  {status}
                </Text>
              </View>
            );
          })
        )}
      </View>

      {item.status !== 'Delivered' && item.status !== 'Cancelled' ? (
        <Pressable style={styles.cancelButton} onPress={() => requestCancelOrder(item)}>
          <FontAwesome name="ban" size={13} color={colors.error} />
          <Text style={styles.cancelButtonText}>Cancel order</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryColor} />
      <AppHeader compact title="My Orders" onBack={() => navigation.goBack()} />
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <EmptyState
            icon="box-open"
            title="No orders yet"
            message="Your placed orders will appear here with live shopping status."
            actionLabel="Shop now"
            onAction={() => navigation.navigate('ProductList')}
          />
        }
      />
      <AppModal
        visible={Boolean(cancelTarget)}
        icon="ban"
        title="Cancel order?"
        message={
          cancelTarget?.paymentStatus === 'Paid'
            ? 'Your payment will be marked for refund after cancellation.'
            : 'This order will be removed from active delivery.'
        }
        secondaryAction={{
          label: 'Keep order',
          onPress: () => setCancelTarget(null),
        }}
        primaryAction={{
          label: 'Cancel order',
          variant: 'danger',
          onPress: () => {
            if (cancelTarget) {
              dispatch(cancelOrder(cancelTarget.id));
            }
            setCancelTarget(null);
          },
        }}
        onRequestClose={() => setCancelTarget(null)}
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
    paddingBottom: 28,
  },
  orderPanel: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  orderTitleBlock: {
    flex: 1,
  },
  orderId: {
    color: colors.textDark,
    fontWeight: '900',
  },
  date: {
    color: colors.textMuted,
    marginTop: 4,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  total: {
    color: colors.primaryColor,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'right',
  },
  statusBadge: {
    marginTop: 6,
    overflow: 'hidden',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.lightPurple,
    color: colors.primaryColor,
    fontSize: 11,
    fontWeight: '900',
  },
  cancelledBadge: {
    backgroundColor: colors.errorSoft,
    color: colors.error,
  },
  itemsText: {
    color: colors.textMuted,
    marginTop: 12,
  },
  deliveryBox: {
    borderRadius: 8,
    backgroundColor: colors.purpleTint,
    padding: 12,
    marginTop: 12,
    gap: 7,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryText: {
    flex: 1,
    color: colors.textDark,
    fontSize: 12,
    fontWeight: '800',
  },
  trackingNote: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    minHeight: 44,
  },
  statusRowCompact: {
    marginHorizontal: -4,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.disabled,
    marginBottom: 6,
  },
  statusDotActive: {
    backgroundColor: colors.primaryColor,
  },
  statusLine: {
    position: 'absolute',
    top: 5,
    right: '50%',
    width: '100%',
    height: 2,
    backgroundColor: colors.disabled,
    zIndex: -1,
  },
  statusLineActive: {
    backgroundColor: colors.primaryColor,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusTextActive: {
    color: colors.primaryColor,
  },
  cancelledState: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: colors.errorSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelledText: {
    color: colors.error,
    fontWeight: '900',
  },
  cancelButton: {
    minHeight: 42,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorSurface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButtonText: {
    color: colors.error,
    fontWeight: '900',
  },
});

export default MyOrdersScreen;

