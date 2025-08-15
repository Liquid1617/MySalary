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
  // Масштабируем viewBox под размер иконки
  const scale = width / 28;
  const iconSize = 8 * scale; // размер внутренней иконки
  const iconRadius = iconSize / 2;
  const center = width / 2;
  
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <Rect width={width} height={height} rx={width / 2} fill={backgroundColor} />
      <Circle cx={center} cy={center} r={iconRadius} fill={fill} />
    </Svg>
  );
};