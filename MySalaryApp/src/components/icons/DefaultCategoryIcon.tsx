import React from 'react';
import Svg, { Rect, Circle } from 'react-native-svg';

interface DefaultCategoryIconProps {
  width?: number;
  height?: number;
  fill?: string;
  backgroundColor?: string;
}

export const DefaultCategoryIcon: React.FC<DefaultCategoryIconProps> = ({
  width = 28,
  height = 28,
  fill = '#7A7E85',
  backgroundColor = '#EEF1F2',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Rect width="28" height="28" rx="14" fill={backgroundColor} />
      <Circle cx="14" cy="14" r="4" fill={fill} />
    </Svg>
  );
};