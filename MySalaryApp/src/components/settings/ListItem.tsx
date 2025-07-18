import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { tokens } from '../../styles/tokens';

interface ListItemProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  leftIcon?: string;
  avatar?: React.ReactNode;
  disabled?: boolean;
  style?: any;
}

export const ListItem: React.FC<ListItemProps> = ({
  label,
  value,
  onPress,
  showChevron = false,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  leftIcon,
  avatar,
  disabled = false,
  style,
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}>
      <View style={styles.content}>
        {leftIcon && (
          <FontAwesome5 
            name={leftIcon} 
            size={16} 
            color={tokens.colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        {avatar && <View style={styles.avatar}>{avatar}</View>}
        
        <View style={styles.textContainer}>
          <Text style={[styles.label, disabled && styles.disabledText]}>
            {label}
          </Text>
          {value && (
            <Text style={[styles.value, disabled && styles.disabledText]}>
              {value}
            </Text>
          )}
        </View>
        
        {showSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#E0E0E0', true: tokens.colors.primary }}
            thumbColor={tokens.colors.surface}
            disabled={disabled}
          />
        )}
        
        {showChevron && (
          <FontAwesome5 
            name="chevron-right" 
            size={14} 
            color={tokens.colors.textSecondary}
          />
        )}
      </View>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.divider,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    minHeight: tokens.heights.listItem,
  },
  leftIcon: {
    marginRight: tokens.spacing.md,
  },
  avatar: {
    marginRight: tokens.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...tokens.typography.listItemLabel,
  },
  value: {
    ...tokens.typography.listItemValue,
    marginTop: 2,
  },
  disabledText: {
    opacity: 0.5,
  },
});