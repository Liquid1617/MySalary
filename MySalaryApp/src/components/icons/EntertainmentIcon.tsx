import React from 'react';
import Svg, { Rect, Path, Defs, ClipPath, G } from 'react-native-svg';

interface EntertainmentIconProps {
  width?: number;
  height?: number;
  fill?: string;
  backgroundColor?: string;
}

export const EntertainmentIcon: React.FC<EntertainmentIconProps> = ({
  width = 28,
  height = 28,
  fill = '#7A7E85',
  backgroundColor = '#EEF1F2',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Rect width="28" height="28" rx="14" fill={backgroundColor} />
      <G clipPath="url(#clip0_311_424)">
        <Path
          d="M20.3867 16.7268L19.66 11.6202C19.4733 10.3068 18.3467 9.3335 17.02 9.3335H10.98C9.65334 9.3335 8.52667 10.3068 8.34 11.6202L7.61334 16.7268C7.46667 17.7535 8.26 18.6668 9.29334 18.6668C9.74667 18.6668 10.1733 18.4868 10.4933 18.1668L12 16.6668H16L17.5 18.1668C17.82 18.4868 18.2533 18.6668 18.7 18.6668C19.74 18.6668 20.5333 17.7535 20.3867 16.7268ZM13.3333 13.3335H12V14.6668H11.3333V13.3335H10V12.6668H11.3333V11.3335H12V12.6668H13.3333V13.3335ZM16 12.6668C15.6333 12.6668 15.3333 12.3668 15.3333 12.0002C15.3333 11.6335 15.6333 11.3335 16 11.3335C16.3667 11.3335 16.6667 11.6335 16.6667 12.0002C16.6667 12.3668 16.3667 12.6668 16 12.6668ZM17.3333 14.6668C16.9667 14.6668 16.6667 14.3668 16.6667 14.0002C16.6667 13.6335 16.9667 13.3335 17.3333 13.3335C17.7 13.3335 18 13.6335 18 14.0002C18 14.3668 17.7 14.6668 17.3333 14.6668Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_311_424">
          <Rect width="16" height="16" fill="white" transform="translate(6 6)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};