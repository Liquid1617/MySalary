import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from './styles';

export type ActionButtonVariant = 'add' | 'manage' | 'view' | 'primary' | 'secondary';

interface ActionButtonProps {
  title?: string;
  variant: ActionButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  variant,
  onPress,
  disabled = false,
  size = 'medium',
}) => {
  const getDefaultTitle = () => {
    switch (variant) {
      case 'add':
        return 'Add';
      case 'manage':
        return 'Manage';
      case 'view':
        return 'View All';
      case 'primary':
        return 'OK';
      case 'secondary':
        return 'Cancel';
      default:
        return 'Button';
    }
  };

  const actualTitle = title || getDefaultTitle();
  const getButtonStyle = () => {
    switch (variant) {
      case 'add':
        return styles.addButton;
      case 'manage':
        return styles.manageButton;
      case 'view':
        return styles.viewButton;
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'add':
        return styles.addButtonText;
      case 'manage':
        return styles.manageButtonText;
      case 'view':
        return styles.viewButtonText;
      case 'primary':
        return styles.primaryButtonText;
      case 'secondary':
        return styles.secondaryButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <Text style={[
        getTextStyle(),
        disabled && styles.disabledButtonText,
      ]}>
        {actualTitle}
      </Text>
    </TouchableOpacity>
  );
};