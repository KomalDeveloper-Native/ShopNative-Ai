import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-simple-toast';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import * as yup from 'yup';
import GradientButton from '../../components/GradientButton';
import { FormInput } from '../../com/atoms';
import { AuthLayout, GoogleAuthButton } from '../../com/molecules';
import type { RootNavigationProp } from '../../navigation/types';
import { loginWithEmail, signInWithGoogle } from '../../services/authService';
import { colors } from '../../theme';

type Props = {
  navigation: RootNavigationProp<'Login'>;
};

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

  const login = async (data: LoginFormValues) => {
    if (loading) return;

    try {
      setLoading(true);
      await loginWithEmail(data.email, data.password);
      Toast.show('Welcome back', Toast.SHORT);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      Toast.show(message, Toast.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    if (googleLoading) return;

    try {
      setGoogleLoading(true);
      const credential = await signInWithGoogle();

      if (credential) {
        Toast.show('Signed in with Google', Toast.SHORT);
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
      kicker="ShopNative"
      title="Sign in to keep shopping"
      subtitle="Premium fashion, fast checkout, saved wishlist and order tracking.">
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
        onPress={googleLogin}
      />

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>New here?</Text>
        <Pressable onPress={() => navigation.navigate('Register')}>
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
