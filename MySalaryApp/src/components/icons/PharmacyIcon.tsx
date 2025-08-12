import React from 'react';
import Svg, { Rect, Path, Defs, ClipPath, G } from 'react-native-svg';

interface PharmacyIconProps {
  width?: number;
  height?: number;
  fill?: string;
  backgroundColor?: string;
}

export const PharmacyIcon: React.FC<PharmacyIconProps> = ({
  width = 28,
  height = 28,
  fill = '#7A7E85',
  backgroundColor = '#EEF1F2',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Rect width="28" height="28" rx="14" fill={backgroundColor} />
      <G clipPath="url(#clip0_302_374)">
        <Path
          d="M18.6667 8H9.33333C8.6 8 8.00667 8.6 8.00667 9.33333L8 18.6667C8 19.4 8.6 20 9.33333 20H18.6667C19.4 20 20 19.4 20 18.6667V9.33333C20 8.6 19.4 8 18.6667 8ZM17.3333 15.3333H15.3333V17.3333C15.3333 17.7 15.0333 18 14.6667 18H13.3333C12.9667 18 12.6667 17.7 12.6667 17.3333V15.3333H10.6667C10.3 15.3333 10 15.0333 10 14.6667V13.3333C10 12.9667 10.3 12.6667 10.6667 12.6667H12.6667V10.6667C12.6667 10.3 12.9667 10 13.3333 10H14.6667C15.0333 10 15.3333 10.3 15.3333 10.6667V12.6667H17.3333C17.7 12.6667 18 12.9667 18 13.3333V14.6667C18 15.0333 17.7 15.3333 17.3333 15.3333Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_302_374">
          <Rect width="16" height="16" fill="white" transform="translate(6 6)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};