import React from 'react';
import Svg, { Rect, Path, Defs, ClipPath, G } from 'react-native-svg';

interface RestaurantCafeBarIconProps {
  width?: number;
  height?: number;
  fill?: string;
  backgroundColor?: string;
}

export const RestaurantCafeBarIcon: React.FC<RestaurantCafeBarIconProps> = ({
  width = 28,
  height = 28,
  fill = '#7A7E85',
  backgroundColor = '#EEF1F2',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Rect width="28" height="28" rx="14" fill={backgroundColor} />
      <G clipPath="url(#clip0_302_367)">
        <Path
          d="M16.6667 10.0002V14.0002C16.6667 14.7335 17.2667 15.3335 18 15.3335H18.6667V20.0002C18.6667 20.3668 18.9667 20.6668 19.3333 20.6668C19.7 20.6668 20 20.3668 20 20.0002V8.08683C20 7.6535 19.5933 7.3335 19.1733 7.4335C17.7333 7.78683 16.6667 9.00683 16.6667 10.0002ZM13.3333 12.0002H12V8.00016C12 7.6335 11.7 7.3335 11.3333 7.3335C10.9667 7.3335 10.6667 7.6335 10.6667 8.00016V12.0002H9.33333V8.00016C9.33333 7.6335 9.03333 7.3335 8.66667 7.3335C8.3 7.3335 8 7.6335 8 8.00016V12.0002C8 13.4735 9.19333 14.6668 10.6667 14.6668V20.0002C10.6667 20.3668 10.9667 20.6668 11.3333 20.6668C11.7 20.6668 12 20.3668 12 20.0002V14.6668C13.4733 14.6668 14.6667 13.4735 14.6667 12.0002V8.00016C14.6667 7.6335 14.3667 7.3335 14 7.3335C13.6333 7.3335 13.3333 7.6335 13.3333 8.00016V12.0002Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_302_367">
          <Rect width="16" height="16" fill="white" transform="translate(6 6)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};