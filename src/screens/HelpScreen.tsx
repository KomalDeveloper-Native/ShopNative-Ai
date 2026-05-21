import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { AppHeader } from '../com/molecules';
import { colors } from '../com/theme/color';
import type { RootNavigationProp } from '../navigation/types';

type HelpScreenProps = {
  navigation: RootNavigationProp<'Help'>;
};

const helpItems = [
  {
    icon: 'robot',
    title: 'AI chat support',
    body: 'Tap the assistant button to ask about products, payments, delivery, or your cart.',
  },
  {
    icon: 'map-marked-alt',
    title: 'Delivery tracking',
    body: 'Open My Orders to see delivery stage, estimated time, payment status, and saved location.',
  },
  {
    icon: 'credit-card',
    title: 'Payment gateway',
    body: 'Checkout supports Cash on Delivery, UPI, Card, Wallet, and Net Banking.',
  },
  {
    icon: 'headset',
    title: 'Need human help?',
    body: 'Call support at 1800-123-456 or email support@shopnative.ai.',
  },
];

const HelpScreen = ({ navigation }: HelpScreenProps) => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor={colors.primaryColor} />
    <AppHeader compact title="Help" onBack={() => navigation.goBack()} />

    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.assistantPanel}>
        <FontAwesome name="robot" size={22} color={colors.primaryColor} />
        <View style={styles.assistantCopy}>
          <Text style={styles.assistantTitle}>AI Assistant is here</Text>
          <Text style={styles.assistantText}>
            Use the floating chat button for quick help with delivery time, payment, location,
            product suggestions, and order questions.
          </Text>
        </View>
      </View>

      {helpItems.map(item => (
        <View key={item.title} style={styles.helpCard}>
          <View style={styles.iconWrap}>
            <FontAwesome name={item.icon} size={16} color={colors.primaryColor} />
          </View>
          <View style={styles.helpCopy}>
            <Text style={styles.helpTitle}>{item.title}</Text>
            <Text style={styles.helpBody}>{item.body}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 96,
  },
  assistantPanel: {
    flexDirection: 'row',
    gap: 13,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  assistantCopy: {
    flex: 1,
  },
  assistantTitle: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '900',
  },
  assistantText: {
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: 6,
  },
  helpCard: {
    flexDirection: 'row',
    gap: 13,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightPurple,
  },
  helpCopy: {
    flex: 1,
  },
  helpTitle: {
    color: colors.textDark,
    fontWeight: '900',
  },
  helpBody: {
    color: colors.textMuted,
    lineHeight: 19,
    marginTop: 4,
  },
});

export default HelpScreen;

