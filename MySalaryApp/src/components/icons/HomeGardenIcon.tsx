import React from 'react';
import Svg, { Rect, Path, Defs, ClipPath, G } from 'react-native-svg';

interface HomeGardenIconProps {
  width?: number;
  height?: number;
  fill?: string;
  backgroundColor?: string;
}

export const HomeGardenIcon: React.FC<HomeGardenIconProps> = ({
  width = 28,
  height = 28,
  fill = '#7A7E85',
  backgroundColor = '#EEF1F2',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Rect width="28" height="28" rx="14" fill={backgroundColor} />
      <G clipPath="url(#clip0_199_184)">
        <Path
          d="M12.6666 18.6666V15.3333H15.3333V18.6666C15.3333 19.0333 15.6333 19.3333 15.9999 19.3333H17.9999C18.3666 19.3333 18.6666 19.0333 18.6666 18.6666V14H19.7999C20.1066 14 20.2533 13.62 20.0199 13.42L14.4466 8.39998C14.1933 8.17331 13.8066 8.17331 13.5533 8.39998L7.97994 13.42C7.75328 13.62 7.89328 14 8.19994 14H9.33328V18.6666C9.33328 19.0333 9.63328 19.3333 9.99994 19.3333H11.9999C12.3666 19.3333 12.6666 19.0333 12.6666 18.6666Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_199_184">
          <Rect width="16" height="16" fill="white" transform="translate(6 6)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};