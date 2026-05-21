import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/color';

type OptionSelectorProps = {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
};

const OptionSelector = ({ title, options, selected, onSelect }: OptionSelectorProps) => (
  <>
    <Text style={styles.title}>{title}</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
      contentContainerStyle={styles.row}>
      <View style={styles.optionLine}>
        {options.map(option => {
          const active = selected === option;
          return (
            <Pressable
              key={option}
              style={[styles.option, active && styles.optionSelected]}
              onPress={() => onSelect(option)}>
              <Text
                style={[styles.optionText, active && styles.optionTextSelected]}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  </>
);

const styles = StyleSheet.create({
  title: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 20,
  },
  scroller: {
    marginTop: 10,
    flexGrow: 0,
  },
  row: {
    paddingRight: 4,
    paddingBottom: 4,
  },
  optionLine: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    minWidth: 48,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    borderColor: colors.primaryColor,
    backgroundColor: colors.lightPurple,
  },
  optionText: {
    color: colors.textDark,
    fontWeight: '800',
  },
  optionTextSelected: {
    color: colors.primaryColor,
  },
});

export default OptionSelector;
