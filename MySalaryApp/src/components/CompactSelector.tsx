import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';

interface CompactSelectorProps {
  value: string;
  onPress: () => void;
  disabled?: boolean;
}

const ChevronDownIcon: React.FC = () => (
  <Svg width="7" height="5" viewBox="0 0 7 5" fill="none">
    <Path
      d="M5.9248 0.806348L3.4998 3.23135L1.0748 0.806348C0.831055 0.562598 0.437305 0.562598 0.193555 0.806348C-0.0501953 1.0501 -0.0501953 1.44385 0.193555 1.6876L3.0623 4.55635C3.30605 4.8001 3.6998 4.8001 3.94355 4.55635L6.8123 1.6876C7.05605 1.44385 7.05605 1.0501 6.8123 0.806348C6.56855 0.568848 6.16855 0.562598 5.9248 0.806348Z"
      fill="#7A7E85"
    />
  </Svg>
);

export const CompactSelector: React.FC<CompactSelectorProps> = ({
  value,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <Text style={styles.text}>{value}</Text>
      <ChevronDownIcon />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 66,
    height: 27,
    backgroundColor: '#EEF1F2',
    borderRadius: 22,
    paddingTop: 6,
    paddingRight: 12,
    paddingBottom: 6,
    paddingLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  text: {
    fontFamily: 'Commissioner',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#7A7E85',
  },
  disabled: {
    opacity: 0.6,
  },
});