import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme';

type PremiumButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  style?: ViewStyle;
};

const PremiumButton = ({ title, onPress, loading, disabled, variant = 'primary', style }: PremiumButtonProps) => {
  const content = loading ? (
    <ActivityIndicator color={variant === 'ghost' ? colors.primaryColor : colors.white} />
  ) : (
    <Text style={[styles.title, variant === 'ghost' && styles.ghostTitle]}>{title}</Text>
  );

  if (variant === 'ghost') {
    return (
      <Pressable disabled={disabled || loading} onPress={onPress} style={[styles.ghost, disabled && styles.disabled, style]}>
        {content}
      </Pressable>
    );
  }

  return (
    <LinearGradient
      colors={disabled ? [colors.surfaceElevated, colors.surfaceElevated] : [colors.primaryColor, colors.accentColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}>
      <Pressable disabled={disabled || loading} onPress={onPress} style={styles.pressable}>
        {content}
      </Pressable>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primaryColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 5,
  },
  pressable: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  ghost: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  disabled: {
    opacity: 0.58,
  },
  title: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  ghostTitle: {
    color: colors.textDark,
  },
});

export default PremiumButton;
