import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';

interface CustomSelectorProps {
  placeholder: string;
  value?: string;
  onPress: () => void;
  disabled?: boolean;
  renderSelectedValue?: () => React.ReactNode;
}

const ChevronDownIcon: React.FC = () => (
  <Svg width="10" height="6" viewBox="0 0 10 6" fill="none">
    <Path
      d="M8.23307 0.741553L4.99974 3.97489L1.76641 0.741553C1.44141 0.416553 0.916406 0.416553 0.591406 0.741553C0.266406 1.06655 0.266406 1.59155 0.591406 1.91655L4.41641 5.74155C4.74141 6.06655 5.26641 6.06655 5.59141 5.74155L9.4164 1.91655C9.7414 1.59155 9.7414 1.06655 9.4164 0.741553C9.0914 0.424886 8.55807 0.416553 8.23307 0.741553Z"
      fill="#252233"
    />
  </Svg>
);

export const CustomSelector: React.FC<CustomSelectorProps> = ({
  placeholder,
  value,
  onPress,
  disabled = false,
  renderSelectedValue,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <View style={styles.content}>
        {renderSelectedValue && value ? (
          renderSelectedValue()
        ) : (
          <Text style={[styles.text, !value && styles.placeholder]}>
            {value || placeholder}
          </Text>
        )}
      </View>
      <ChevronDownIcon />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 353,
    height: 44,
    backgroundColor: '#FDFDFE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEF1F2',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  content: {
    flex: 1,
  },
  text: {
    fontFamily: 'Commissioner',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 0,
    color: '#252233',
  },
  placeholder: {
    color: '#D3D6D7',
  },
  disabled: {
    opacity: 0.6,
  },
});
