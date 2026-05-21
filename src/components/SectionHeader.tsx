import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../com/theme/color';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

const SectionHeader = ({ title, actionLabel, onAction }: SectionHeaderProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {actionLabel && onAction ? (
      <Pressable onPress={onAction}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: colors.textDark,
    fontSize: 19,
    fontWeight: '900',
  },
  action: {
    color: colors.primaryColor,
    fontWeight: '800',
  },
});

export default SectionHeader;
