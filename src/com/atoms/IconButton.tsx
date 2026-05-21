import React, { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../theme/color';

type IconButtonProps = PressableProps & {
  icon?: string;
  solid?: boolean;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

const IconButton = ({
  icon,
  solid,
  size = 16,
  color = colors.white,
  style,
  disabled,
  children,
  ...props
}: IconButtonProps) => (
  <Pressable
    disabled={disabled}
    style={[styles.button, disabled && styles.disabled, style]}
    {...props}>
    {icon ? <FontAwesome name={icon} solid={solid} size={size} color={color} /> : null}
    {children}
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlayLight,
  },
  disabled: {
    opacity: 0.55,
  },
});

export default IconButton;
