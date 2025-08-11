import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { styles } from './styles';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'plus',
  iconSize = 24,
  iconColor = '#FFFFFF',
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}>
      <FontAwesome5
        name={icon}
        size={iconSize}
        color={iconColor}
      />
    </TouchableOpacity>
  );
};