import React from 'react';
import Svg, { Rect, Path, Defs, ClipPath, G } from 'react-native-svg';

interface PublicTransportTaxiIconProps {
  width?: number;
  height?: number;
  fill?: string;
  backgroundColor?: string;
}

export const PublicTransportTaxiIcon: React.FC<PublicTransportTaxiIconProps> = ({
  width = 28,
  height = 28,
  fill = '#7A7E85',
  backgroundColor = '#EEF1F2',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Rect width="28" height="28" rx="14" fill={backgroundColor} />
      <G clipPath="url(#clip0_302_360)">
        <Path
          d="M18.6133 10.0067C18.48 9.61333 18.1067 9.33333 17.6667 9.33333H16V8.66667C16 8.3 15.7 8 15.3333 8H12.6667C12.3 8 12 8.3 12 8.66667V9.33333H10.3333C9.89333 9.33333 9.52667 9.61333 9.38667 10.0067L8.07333 13.7867C8.02667 13.9267 8 14.0733 8 14.2267V19C8 19.5533 8.44667 20 9 20C9.55333 20 10 19.5533 10 19V18.6667H18V19C18 19.5467 18.4467 20 19 20C19.5467 20 20 19.5533 20 19V14.2267C20 14.08 19.9733 13.9267 19.9267 13.7867L18.6133 10.0067ZM10.3333 16.6667C9.78 16.6667 9.33333 16.22 9.33333 15.6667C9.33333 15.1133 9.78 14.6667 10.3333 14.6667C10.8867 14.6667 11.3333 15.1133 11.3333 15.6667C11.3333 16.22 10.8867 16.6667 10.3333 16.6667ZM17.6667 16.6667C17.1133 16.6667 16.6667 16.22 16.6667 15.6667C16.6667 15.1133 17.1133 14.6667 17.6667 14.6667C18.22 14.6667 18.6667 15.1133 18.6667 15.6667C18.6667 16.22 18.22 16.6667 17.6667 16.6667ZM9.33333 13.3333L10.3333 10.3333H17.6667L18.6667 13.3333H9.33333Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_302_360">
          <Rect width="16" height="16" fill="white" transform="translate(6 6)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};