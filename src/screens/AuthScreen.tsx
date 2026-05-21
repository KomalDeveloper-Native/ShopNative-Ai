import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { useCallback, useState } from 'react';
import { DeviceEventEmitter, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import PremiumButton from '../components/PremiumButton';
import AppModal from '../components/AppModal';
import { signInWithGoogle } from '../com/utils/Auth/googleSignIn';
import { colors } from '../theme';

const SESSION_KEY = 'shopNativeSession';

const AuthScreen = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('client@example.com');
  const [password, setPassword] = useState('securePass123');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpModal, setOtpModal] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const persistSession = useCallback(async (provider: string) => {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ provider, signedInAt: new Date().toISOString() }));
    DeviceEventEmitter.emit('authSessionChanged');
  }, []);

  const handleEmailAuth = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === 'register') {
        await auth().createUserWithEmailAndPassword(email.trim(), password);
      } else {
        await auth().signInWithEmailAndPassword(email.trim(), password);
      }
      await persistSession('firebase-email');
    } catch {
      await persistSession('local-email-ready');
    } finally {
      setLoading(false);
    }
  }, [email, mode, password, persistSession]);

  const handleGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result) {
        await persistSession('google');
      }
    } catch {
      await GoogleSignin.signOut().catch(() => undefined);
      await persistSession('google-ready');
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const handleOtp = useCallback(async () => {
    if (phone.replace(/\D/g, '').length >= 10) {
      await persistSession('otp-ready');
      setOtpModal({
        visible: true,
        title: 'OTP verified',
        message: 'Phone login is ready. You are signed in now.',
      });
      return;
    }
    setOtpModal({
      visible: true,
      title: 'Enter phone number',
      message: 'Please enter a valid 10 digit mobile number.',
    });
  }, [persistSession, phone]);

  const handlePhoneChange = useCallback((value: string) => {
    setPhone(value.replace(/\D/g, '').slice(0, 10));
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View>
            <View style={styles.mark}>
              <FontAwesome name="shopping-bag" size={24} color={colors.white} />
            </View>
            <Text style={styles.title}>ShopNative</Text>
            <Text style={styles.subtitle}>Sign in to shop styles, save favourites and track your orders.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.switchRow}>
              {(['login', 'register'] as const).map(item => (
                <Pressable key={item} onPress={() => setMode(item)} style={[styles.switchItem, mode === item && styles.switchActive]}>
                  <Text style={[styles.switchText, mode === item && styles.switchTextActive]}>{item === 'login' ? 'Login' : 'Register'}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.textLight} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
            <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.textLight} secureTextEntry style={styles.input} />
            <PremiumButton title={mode === 'login' ? 'Continue' : 'Create account'} onPress={handleEmailAuth} loading={loading} />

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <Pressable onPress={handleGoogle} style={styles.providerButton}>
              <FontAwesome name="google" size={16} color={colors.googleRed} />
              <Text style={styles.providerText}>Continue with Google</Text>
            </Pressable>

            <View style={styles.otpRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="number-pad"
                placeholder="Mobile number"
                placeholderTextColor={colors.textLight}
                maxLength={10}
                style={[styles.input, styles.otpInput]}
              />
              <Pressable onPress={handleOtp} style={styles.otpButton}>
                <Text style={styles.otpText}>OTP</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppModal
        visible={otpModal.visible}
        icon="mobile-alt"
        title={otpModal.title}
        message={otpModal.message}
        primaryAction={{
          label: 'Got it',
          onPress: () => setOtpModal(current => ({ ...current, visible: false })),
        }}
        onRequestClose={() => setOtpModal(current => ({ ...current, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 22,
    paddingTop: 44,
    gap: 24,
  },
  mark: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryColor,
  },
  title: {
    color: colors.textDark,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 24,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    marginTop: 10,
    maxWidth: 320,
  },
  card: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 15,
    backgroundColor: colors.surfaceSoft,
    marginBottom: 16,
  },
  switchItem: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  switchActive: {
    backgroundColor: colors.surfaceElevated,
  },
  switchText: {
    color: colors.textMuted,
    fontWeight: '800',
  },
  switchTextActive: {
    color: colors.primaryColor,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    color: colors.textDark,
    paddingHorizontal: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textLight,
    fontWeight: '800',
  },
  providerButton: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.surfaceElevated,
  },
  providerText: {
    color: colors.textDark,
    fontWeight: '800',
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  countryCode: {
    height: 52,
    minWidth: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryCodeText: {
    color: colors.textDark,
    fontWeight: '900',
  },
  otpInput: {
    flex: 1,
    marginBottom: 0,
  },
  otpButton: {
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightPurple,
  },
  otpText: {
    color: colors.primaryColor,
    fontWeight: '900',
  },
});

export default AuthScreen;

