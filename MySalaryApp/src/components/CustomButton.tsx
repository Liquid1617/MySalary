import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { customButtonStyles, colors } from '../styles';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  onPress,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    return [
      customButtonStyles.container,
      variant === 'primary'
        ? customButtonStyles.primary
        : customButtonStyles.secondary,
      isDisabled && customButtonStyles.disabled,
    ].filter(Boolean);
  };

  const getTextStyle = () => {
    let textColorStyle;

    if (isDisabled) {
      textColorStyle = customButtonStyles.disabledText;
    } else if (variant === 'primary') {
      textColorStyle = customButtonStyles.primaryText;
    } else {
      textColorStyle = customButtonStyles.secondaryText;
    }

    return [customButtonStyles.text, textColorStyle];
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.white : colors.primary}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
