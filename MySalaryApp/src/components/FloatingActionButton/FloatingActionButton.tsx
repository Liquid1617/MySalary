import React from 'react';
import { TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { styles } from './styles';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  size?: number;
  position?: 'absolute' | 'relative';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'plus',
  iconSize = 14,
  iconColor = '#252233',
  size = 54,
  position = 'absolute',
}) => {
  return (
    <TouchableOpacity
      style={[
        position === 'absolute' ? styles.container : styles.containerRelative,
        { width: size, height: size, borderRadius: size / 2 }
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      <LinearGradient
        colors={[
          'rgba(198, 194, 255, 0.7)',
          'rgba(114, 225, 245, 0.7)',
          'rgba(83, 239, 174, 0.7)',
          'rgba(181, 250, 1, 0.7)'
        ]}
        locations={[0.0242, 0.3221, 0.717, 1.0]}
        useAngle={true}
        angle={217.04}
        style={[styles.gradient, { width: size, height: size, borderRadius: size / 2 }]}>
        <FontAwesome5
          name={icon}
          size={iconSize}
          color={iconColor}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};