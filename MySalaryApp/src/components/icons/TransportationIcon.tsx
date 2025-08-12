import React from 'react';
import Svg, { Rect, Path, Defs, ClipPath, G } from 'react-native-svg';

interface TransportationIconProps {
  width?: number;
  height?: number;
  fill?: string;
  backgroundColor?: string;
}

export const TransportationIcon: React.FC<TransportationIconProps> = ({
  width = 28,
  height = 28,
  fill = '#7A7E85',
  backgroundColor = '#EEF1F2',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Rect width="28" height="28" rx="14" fill={backgroundColor} />
      <G clipPath="url(#clip0_301_329)">
        <Path
          d="M20 15.7202C20 15.4802 19.8734 15.2602 19.6734 15.1268L14.6667 12.0002V8.3335C14.6667 7.78016 14.22 7.3335 13.6667 7.3335C13.1134 7.3335 12.6667 7.78016 12.6667 8.3335V12.0002L7.66004 15.1268C7.46004 15.2535 7.33337 15.4802 7.33337 15.7202C7.33337 16.1868 7.78671 16.5268 8.24004 16.3868L12.6667 15.0002V18.6668L11.4667 19.5668C11.38 19.6268 11.3334 19.7268 11.3334 19.8335V20.2268C11.3334 20.4468 11.5467 20.6068 11.76 20.5468L13.6667 20.0002L15.5734 20.5468C15.7867 20.6068 16 20.4468 16 20.2268V19.8335C16 19.7268 15.9534 19.6268 15.8667 19.5668L14.6667 18.6668V15.0002L19.0934 16.3868C19.5467 16.5268 20 16.1868 20 15.7202Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_301_329">
          <Rect width="16" height="16" fill="white" transform="translate(6 6)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};