import React from 'react';
import Svg, { Rect, Path, Defs, ClipPath, G } from 'react-native-svg';

interface SubscriptionIconProps {
  width?: number;
  height?: number;
  fill?: string;
  backgroundColor?: string;
}

export const SubscriptionIcon: React.FC<SubscriptionIconProps> = ({
  width = 28,
  height = 28,
  fill = '#7A7E85',
  backgroundColor = '#EEF1F2',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Rect width="28" height="28" rx="14" fill={backgroundColor} />
      <G clipPath="url(#clip0_311_380)">
        <Path
          d="M14 20.6665C14.7334 20.6665 15.3334 20.0665 15.3334 19.3332H12.6667C12.6667 20.0665 13.26 20.6665 14 20.6665ZM18 16.6665V13.3332C18 11.2865 16.9067 9.57317 15 9.11984V8.6665C15 8.11317 14.5534 7.6665 14 7.6665C13.4467 7.6665 13 8.11317 13 8.6665V9.11984C11.0867 9.57317 10 11.2798 10 13.3332V16.6665L9.14003 17.5265C8.72003 17.9465 9.01337 18.6665 9.6067 18.6665H18.3867C18.98 18.6665 19.28 17.9465 18.86 17.5265L18 16.6665Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_311_380">
          <Rect width="16" height="16" fill="white" transform="translate(6 6)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};