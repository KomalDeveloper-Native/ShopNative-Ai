import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../com/theme/color';

type GradientButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

const GradientButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
}: GradientButtonProps) => (
  <LinearGradient
    colors={
      disabled
        ? [colors.disabled, colors.disabled]
        : [colors.primaryColor, colors.accentColor]
    }
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={[styles.gradient, style]}>
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={styles.pressable}>
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  pressable: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default GradientButton;
