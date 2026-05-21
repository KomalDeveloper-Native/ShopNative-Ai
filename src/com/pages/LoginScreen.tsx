import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CommonActions } from '@react-navigation/native';
import { DeviceEventEmitter, Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-simple-toast';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import * as yup from 'yup';
import GradientButton from '../../components/GradientButton';
import type { RootNavigationProp } from '../../types/navigationTypes';
import { FormInput } from '../atoms';
import { AuthLayout, GoogleAuthButton } from '../molecules';
import { colors } from '../theme/color';
import { signInWithGoogle } from '../utils/Auth/googleSignIn';

type Props = {
  navigation: RootNavigationProp<'Login'>;
};

const SESSION_KEY = 'shopNativeSession';

type LoginFormValues = {
  email: string;
  password: string;
};

const schema: yup.ObjectSchema<LoginFormValues> = yup.object({
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [secure, setSecure] = useState(true);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const resetToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      }),
    );
  };

  const saveSession = async (
    user: { uid: string; displayName: string | null; email: string | null },
    provider: string,
  ) => {
    const session = {
      uid: user.uid,
      fullName: user.displayName ?? '',
      email: user.email ?? '',
      provider,
      signedInAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      'userProfile',
      JSON.stringify(session),
    );
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    DeviceEventEmitter.emit('authSessionChanged');
  };

  const login = async (data: LoginFormValues) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      const credential = await auth().signInWithEmailAndPassword(data.email.trim(), data.password);
      if (!credential.user.emailVerified) {
        await credential.user.sendEmailVerification();
        await auth().signOut();
        Toast.show('Please verify your email. We sent the link again.', Toast.LONG);
        return;
      }

      await saveSession(credential.user, 'firebase-email');
      Toast.show('Welcome back', Toast.SHORT);
      resetToHome();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      Toast.show(message, Toast.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    if (googleLoading) {
      return;
    }

    try {
      setGoogleLoading(true);
      const credential = await signInWithGoogle();
      if (credential) {
        await saveSession(credential.user, 'google');
        Toast.show('Signed in with Google', Toast.SHORT);
        resetToHome();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed';
      Toast.show(message, Toast.SHORT);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      kicker="ShopNative_AI"
      title="Sign in to keep shopping"
      subtitle="Curated style, smart search, quick checkout.">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormInput
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            errorMessage={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormInput
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={secure}
            placeholder="Enter password"
            errorMessage={errors.password?.message}
            rightAccessory={
              <Pressable onPress={() => setSecure(current => !current)} style={styles.eyeButton}>
                <FontAwesome
                  name={secure ? 'eye' : 'eye-slash'}
                  size={16}
                  color={colors.textMuted}
                />
              </Pressable>
            }
          />
        )}
      />

      <GradientButton
        title="Sign In"
        onPress={handleSubmit(login)}
        disabled={loading || googleLoading}
        loading={loading}
        style={styles.primaryButton}
      />

      <GoogleAuthButton
        label="Continue with Google"
        loading={googleLoading}
        disabled={loading || googleLoading}
        onPress={googleSignIn}
      />

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>New here?</Text>
        <Pressable onPress={() => navigation.navigate('RegisterScreen')}>
          <Text style={styles.footerLink}>Create account</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  eyeButton: {
    padding: 14,
  },
  primaryButton: {
    marginTop: 22,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 7,
    marginTop: 22,
  },
  footerText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  footerLink: {
    color: colors.primaryColor,
    fontWeight: '900',
  },
});

export default LoginScreen;
