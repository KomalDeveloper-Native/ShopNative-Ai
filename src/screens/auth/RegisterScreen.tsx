import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-simple-toast';
import * as yup from 'yup';
import GradientButton from '../../components/GradientButton';
import { FormInput } from '../../com/atoms';
import { AuthLayout } from '../../com/molecules';
import type { RootNavigationProp } from '../../navigation/types';
import { registerWithEmail } from '../../services/authService';
import { colors } from '../../theme';

type Props = {
  navigation: RootNavigationProp<'Register'>;
};

type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const schema: yup.ObjectSchema<RegisterFormValues> = yup.object({
  fullName: yup.string().trim().min(2, 'Enter your full name').required('Full name is required'),
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm your password'),
});

const RegisterScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const register = async (data: RegisterFormValues) => {
    if (loading) return;

    try {
      setLoading(true);
      await registerWithEmail(data.fullName, data.email, data.password);
      Toast.show('Account created. Welcome to ShopNative.', Toast.SHORT);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      Toast.show(message, Toast.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    name: keyof RegisterFormValues,
    label: string,
    secureTextEntry = false,
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <FormInput
          label={label}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          autoCapitalize={name === 'email' || secureTextEntry ? 'none' : 'words'}
          keyboardType={name === 'email' ? 'email-address' : 'default'}
          placeholder={label}
          errorMessage={errors[name]?.message}
          containerStyle={styles.field}
        />
      )}
    />
  );

  return (
    <AuthLayout
      kicker="Create account"
      title="Start your ShopNative cart"
      subtitle="One account for wishlist, cart, secure payment and order history.">
      {renderInput('fullName', 'Full name')}
      {renderInput('email', 'Email')}
      {renderInput('password', 'Password', true)}
      {renderInput('confirmPassword', 'Confirm password', true)}
      <GradientButton
        title="Create Account"
        onPress={handleSubmit(register)}
        disabled={loading}
        loading={loading}
        style={styles.button}
      />
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>Sign in</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  field: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
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

export default RegisterScreen;
