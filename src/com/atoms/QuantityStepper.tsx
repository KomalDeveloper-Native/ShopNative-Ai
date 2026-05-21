import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import IconButton from './IconButton';
import { colors } from '../theme/color';

type QuantityStepperProps = {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

const QuantityStepper = ({
  value,
  onDecrease,
  onIncrease,
  style,
  compact = false,
}: QuantityStepperProps) => (
  <View style={[styles.stepper, compact && styles.compactStepper, style]}>
    <IconButton
      icon="minus"
      color={colors.primaryColor}
      size={compact ? 10 : 12}
      onPress={onDecrease}
      style={[styles.stepperButton, compact && styles.compactButton]}
    />
    <Text style={[styles.quantity, compact && styles.compactQuantity]}>{value}</Text>
    <IconButton
      icon="plus"
      color={colors.primaryColor}
      size={compact ? 10 : 12}
      onPress={onIncrease}
      style={[styles.stepperButton, compact && styles.compactButton]}
    />
  </View>
);

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactStepper: {
    borderWidth: 0,
    backgroundColor: colors.lightPurple,
    borderRadius: 10,
  },
  stepperButton: {
    width: 42,
    height: 42,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  compactButton: {
    width: 32,
    height: 32,
  },
  quantity: {
    minWidth: 32,
    color: colors.textDark,
    textAlign: 'center',
    fontWeight: '900',
  },
  compactQuantity: {
    minWidth: 26,
  },
});

export default QuantityStepper;
