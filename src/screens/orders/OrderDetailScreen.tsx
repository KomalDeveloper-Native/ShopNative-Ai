import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../com/molecules';
import EmptyState from '../../components/EmptyState';
import type { RootNavigationProp, RootRouteProp } from '../../navigation/types';
import { useAppSelector } from '../../redux/hooks';
import { colors } from '../../theme';
import { formatCurrency } from '../../utils/format';

type Props = {
  navigation: RootNavigationProp<'OrderDetail'>;
  route: RootRouteProp<'OrderDetail'>;
};

const OrderDetailScreen = ({ navigation, route }: Props) => {
  const order = useAppSelector(state =>
    state.orders.items.find(item => item.id === route.params.orderId),
  );

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="receipt"
          title="Order not found"
          message="This order is not available in your history."
          actionLabel="Back to orders"
          onAction={() => navigation.navigate('Orders')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader compact title={order.id} onBack={() => navigation.goBack()} />
      <FlatList
        data={order.items}
        keyExtractor={item => `${item.id}-${item.selectedColor ?? ''}-${item.selectedSize ?? ''}`}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.summary}>
            <Text style={styles.status}>{order.status}</Text>
            <Text style={styles.total}>{formatCurrency(order.total)}</Text>
            <Text style={styles.meta}>
              {order.paymentMethod} - {order.paymentStatus ?? 'Pending'}
            </Text>
            <Text style={styles.meta}>
              {order.address.addressLine}, {order.address.city} {order.address.pincode}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.itemBody}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>Qty {item.quantity}</Text>
            </View>
            <Text style={styles.price}>{formatCurrency(item.price * item.quantity)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  summary: { padding: 16, borderRadius: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  status: { color: colors.primaryColor, fontSize: 15, fontWeight: '900' },
  total: { color: colors.textDark, fontSize: 28, fontWeight: '900', marginTop: 6 },
  meta: { color: colors.textMuted, fontSize: 12, lineHeight: 18, fontWeight: '700', marginTop: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  image: { width: 62, height: 62, borderRadius: 8, backgroundColor: colors.lightPurple },
  itemBody: { flex: 1, minWidth: 0 },
  name: { color: colors.textDark, fontWeight: '900' },
  price: { color: colors.primaryColor, fontWeight: '900' },
});

export default OrderDetailScreen;
