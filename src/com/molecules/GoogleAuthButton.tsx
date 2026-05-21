import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../theme/color';

type GoogleAuthButtonProps = {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

const GoogleAuthButton = ({
  label,
  loadingLabel = 'Connecting...',
  loading,
  disabled,
  onPress,
  style,
}: GoogleAuthButtonProps) => (
  <Pressable
    disabled={disabled}
    onPress={onPress}
    style={[styles.button, disabled && styles.disabled, style]}>
    <FontAwesome name="google" size={18} color={colors.googleRed} />
    <Text style={styles.text}>{loading ? loadingLabel : label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 12,
  },
  disabled: {
    opacity: 0.65,
  },
  text: {
    color: colors.textDark,
    fontWeight: '800',
  },
});

export default GoogleAuthButton;
