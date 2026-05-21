import React from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../com/theme/color';
import GradientButton from '../components/GradientButton';
import type { RootNavigationProp, RootRouteProp } from '../navigation/types';

type OrderSuccessScreenProps = {
  navigation: RootNavigationProp<'OrderSuccess'>;
  route: RootRouteProp<'OrderSuccess'>;
};

const OrderSuccessScreen = ({ navigation, route }: OrderSuccessScreenProps) => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor={colors.primaryColor} />
    <View style={styles.content}>
      <View style={styles.iconWrap}>
        <FontAwesome name="check" size={36} color={colors.white} />
      </View>
      <Text style={styles.title}>Order placed</Text>
      <Text style={styles.message}>
        Your order {route.params.orderId} is confirmed and will move through packing shortly.
      </Text>
      <GradientButton title="View My Orders" onPress={() => navigation.navigate('MyOrders')} />
      <Pressable style={styles.linkButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.linkText}>Continue shopping</Text>
      </Pressable>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  iconWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: colors.success,
    marginBottom: 22,
  },
  title: {
    color: colors.textDark,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 28,
  },
  linkButton: {
    alignItems: 'center',
    padding: 16,
  },
  linkText: {
    color: colors.primaryColor,
    fontWeight: '900',
  },
});

export default OrderSuccessScreen;

