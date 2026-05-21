import React, { ReactNode } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/color';

type FormInputProps = TextInputProps & {
  label: string;
  errorMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  rightAccessory?: ReactNode;
};

const FormInput = ({
  label,
  errorMessage,
  containerStyle,
  inputStyle,
  rightAccessory,
  style,
  placeholder,
  placeholderTextColor = colors.textMuted,
  ...props
}: FormInputProps) => (
  <View style={[styles.field, containerStyle]}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrap, errorMessage && styles.inputError, inputStyle]}>
      <TextInput
        placeholder={placeholder ?? label}
        placeholderTextColor={placeholderTextColor}
        style={[styles.input, rightAccessory ? styles.inputWithAccessory : null, style]}
        {...props}
      />
      {rightAccessory}
    </View>
    {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  field: {
    marginBottom: 12,
  },
  label: {
    color: colors.textDark,
    fontWeight: '800',
    marginBottom: 8,
  },
  inputWrap: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    color: colors.textDark,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 50,
    color: colors.textDark,
    paddingHorizontal: 14,
    
  },
  inputWithAccessory: {
    paddingRight: 0,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
  },
});

export default FormInput;
