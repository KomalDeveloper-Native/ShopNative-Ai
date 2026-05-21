import React, { ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/color';

type AuthLayoutProps = {
  kicker: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

const AuthLayout = ({ kicker, title, subtitle, children }: AuthLayoutProps) => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor={colors.primaryColor} />
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <ScrollView
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryColor,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 24,
    paddingBottom: 18,
  },
  kicker: {
    color: colors.softPink,
    fontWeight: '900',
    marginBottom: 12,
  },
  title: {
    color: colors.white,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.headerTextMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  cardContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 56,
  },
});

export default AuthLayout;
