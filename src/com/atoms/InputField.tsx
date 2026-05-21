import React from 'react';
import { TextInput, TextInputProps } from 'react-native-paper';
import { colors } from '../theme/color';

type InputFieldProps = Omit<TextInputProps, 'label'> & {
  name?: string;
  icon?: string;
};

const InputField = ({
  name,
  style,
  icon,
  error,
  ...props
}: InputFieldProps) => (
    <TextInput
      label={name}
      mode="outlined"
      activeOutlineColor={error ? colors.red : colors.primaryColor}
      textColor={colors.black}
      placeholderTextColor={colors.black}
      outlineColor={colors.gray}
      style={[{ backgroundColor: colors.white }, style]}
      right={
        icon ? (
          <TextInput.Icon icon={icon} color={colors.black} size={20} />
        ) : undefined
      }
      {...props}
    />
);

export default InputField;
