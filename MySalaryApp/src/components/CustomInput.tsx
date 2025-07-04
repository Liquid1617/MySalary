import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { customInputStyles } from '../styles';
import { colors } from '../styles/colors';

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  isPassword = false,
  loading = false,
  value,
  onChangeText,
  onBlur,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = () => setIsFocused(true);

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getInputContainerStyle = () => {
    return [
      customInputStyles.inputContainer,
      ...(isFocused ? [customInputStyles.focused] : []),
      ...(error ? [customInputStyles.error] : []),
    ];
  };

  return (
    <View style={[customInputStyles.container, style]}>
      {label && <Text style={customInputStyles.label}>{label}</Text>}
      <View style={getInputContainerStyle()}>
        <TextInput
          style={customInputStyles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize="none"
          editable={!loading}
          {...props}
        />
        {loading && (
          <View style={customInputStyles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        {isPassword && !loading && (
          <TouchableOpacity
            style={customInputStyles.eyeIcon}
            onPress={togglePasswordVisibility}>
            <Text style={customInputStyles.eyeIconText}>
              {isPasswordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={customInputStyles.errorText}>{error}</Text>}
    </View>
  );
};
