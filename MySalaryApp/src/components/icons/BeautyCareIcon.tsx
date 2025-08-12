import React from 'react';
import Svg, { Rect, Path, Defs, ClipPath, G } from 'react-native-svg';

interface BeautyCareIconProps {
  width?: number;
  height?: number;
  fill?: string;
  backgroundColor?: string;
}

export const BeautyCareIcon: React.FC<BeautyCareIconProps> = ({
  width = 28,
  height = 28,
  fill = '#7A7E85',
  backgroundColor = '#EEF1F2',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Rect width="28" height="28" rx="14" fill={backgroundColor} />
      <G clipPath="url(#clip0_199_110)">
        <Path
          d="M16.3267 12.4202C16.22 10.8069 15.64 9.22691 14.5667 7.91357C14.2933 7.58024 13.7933 7.58024 13.52 7.91357C12.42 9.23357 11.8067 10.8136 11.6733 12.4202C12.5267 12.8736 13.3133 13.4602 14 14.1736C14.6867 13.4669 15.4733 12.8802 16.3267 12.4202ZM11.9933 14.1869C11.9 14.1202 11.7933 14.0602 11.6933 13.9936C11.7933 14.0669 11.9 14.1202 11.9933 14.1869ZM16.2733 14.0202C16.1867 14.0802 16.0933 14.1269 16.0067 14.1936C16.0933 14.1269 16.1867 14.0802 16.2733 14.0202ZM14 16.3002C12.7 14.3202 10.5733 12.9469 8.11333 12.7069C7.68667 12.6669 7.33333 13.0202 7.37333 13.4469C7.67333 16.6469 9.80667 19.3002 12.6933 20.3336C13.1133 20.4869 13.5533 20.6002 14.0067 20.6736C14.46 20.5936 14.8933 20.4802 15.32 20.3336C18.2067 19.3002 20.34 16.6536 20.64 13.4469C20.68 13.0202 20.32 12.6669 19.9 12.7069C17.4267 12.9469 15.3 14.3202 14 16.3002Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_199_110">
          <Rect width="16" height="16" fill="white" transform="translate(6 6)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};