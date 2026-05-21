import { yupResolver } from '@hookform/resolvers/yup';
import auth from '@react-native-firebase/auth';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CommonActions } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-simple-toast';
import * as yup from 'yup';
import GradientButton from '../../components/GradientButton';
import type { RootNavigationProp } from '../../types/navigationTypes';
import { FormInput } from '../atoms';
import { AuthLayout } from '../molecules';
import { colors } from '../theme/color';

type RegisterScreenProps = {
  navigation: RootNavigationProp<'RegisterScreen'>;
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
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
});

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const resetToLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
  };

  const register = async (data: RegisterFormValues) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      const credential = await auth().createUserWithEmailAndPassword(
        data.email.trim(),
        data.password,
      );
      await credential.user.updateProfile({ displayName: data.fullName.trim() });
      await credential.user.sendEmailVerification();
      await auth().signOut();
      Toast.show('Verification email sent. Please sign in after verifying.', Toast.LONG);
      resetToLogin();
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
  ) => {
    const isPassword = name === 'password';
    const isConfirmPassword = name === 'confirmPassword';

    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <FormInput
            label={label}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={false}
            autoCapitalize={name === 'email' || secureTextEntry ? 'none' : 'words'}
            keyboardType={name === 'email' ? 'email-address' : 'default'}
            placeholder={label}
            errorMessage={errors[name]?.message}
            containerStyle={styles.field}
            textContentType={isPassword ? 'newPassword' : secureTextEntry ? 'password' : 'none'}
            autoComplete={isPassword ? 'new-password' : secureTextEntry ? 'password' : undefined}
            returnKeyType={isConfirmPassword ? 'done' : 'next'}
          />
        )}
      />
    );
  };

  return (
    <AuthLayout
      kicker="Create account"
      title="Start your ShopNative cart"
      subtitle="A polished shopping flow from login to checkout.">
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
