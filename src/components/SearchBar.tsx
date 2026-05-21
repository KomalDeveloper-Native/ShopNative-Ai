import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../com/theme/color';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onVoicePress?: () => void;
  isListening?: boolean;
};

const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search products',
  onVoicePress,
  isListening = false,
}: SearchBarProps) => (
  <View style={styles.container}>
    <FontAwesome name="search" size={14} color={colors.textMuted} />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      style={styles.input}
      returnKeyType="search"
    />
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voice search"
      accessibilityState={{ busy: isListening }}
      onPress={onVoicePress}
      style={[styles.micButton, isListening && styles.micButtonActive]}
    >
      <FontAwesome
        name="microphone"
        size={14}
        color={isListening ? colors.white : colors.primaryColor}
      />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.textDark,
    fontSize: 15,
    paddingVertical: 8,
  },
  micButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightPurple,
  },
  micButtonActive: {
    backgroundColor: colors.primaryColor,
  },
});

export default SearchBar;
