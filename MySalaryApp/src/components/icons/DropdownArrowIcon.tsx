import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface DropdownArrowIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const DropdownArrowIcon: React.FC<DropdownArrowIconProps> = ({
  width = 8,
  height = 5,
  color = '#252233',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 8 5" fill="none">
      <Path
        d="M6.26296 0.91916L3.99962 3.18249L1.73629 0.91916C1.50879 0.69166 1.14129 0.69166 0.913789 0.91916C0.686289 1.14666 0.686289 1.51416 0.913789 1.74166L3.59129 4.41916C3.81879 4.64666 4.18629 4.64666 4.41379 4.41916L7.09129 1.74166C7.31879 1.51416 7.31879 1.14666 7.09129 0.91916C6.86379 0.697493 6.49046 0.69166 6.26296 0.91916Z"
        fill={color}
      />
    </Svg>
  );
};