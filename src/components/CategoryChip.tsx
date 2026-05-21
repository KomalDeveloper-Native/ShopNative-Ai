import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../com/theme/color';

type CategoryChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

const CategoryChip = ({ label, selected = false, onPress }: CategoryChipProps) => (
  <Pressable
    onPress={onPress}
    style={[styles.container, selected && styles.containerSelected]}>
    <Text style={[styles.text, selected && styles.textSelected]} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    minWidth: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 10,
    marginRight: 10,
    paddingHorizontal: 12,
  },
  containerSelected: {
    backgroundColor: colors.primaryColor,
    borderColor: colors.primaryColor,
  },
  text: {
    color: colors.textDark,
    maxWidth: 96,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  textSelected: {
    color: colors.white,
  },
});

export default CategoryChip;
