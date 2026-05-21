import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { colors } from '../theme/color';

type ButtonProps = {
  text?: string;
  onPress?: () => void;
  style?: object;
};

export const Button = ({ text, onPress, style }: ButtonProps) => {
  return (
    <Pressable onPress={onPress} style={[styles.btn, style]}>
      <Typography text={text} style={styles.text} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
