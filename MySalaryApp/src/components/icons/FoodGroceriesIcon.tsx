import React from 'react';
import Svg, { Rect, Path, Defs, ClipPath, G } from 'react-native-svg';

interface FoodGroceriesIconProps {
  width?: number;
  height?: number;
  fill?: string;
  backgroundColor?: string;
}

export const FoodGroceriesIcon: React.FC<FoodGroceriesIconProps> = ({
  width = 28,
  height = 28,
  fill = '#7A7E85',
  backgroundColor = '#EEF1F2',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Rect width="28" height="28" rx="14" fill={backgroundColor} />
      <G clipPath="url(#clip0_198_190)">
        <Path
          d="M10.6666 18.0002C9.93329 18.0002 9.33996 18.6002 9.33996 19.3335C9.33996 20.0668 9.93329 20.6668 10.6666 20.6668C11.4 20.6668 12 20.0668 12 19.3335C12 18.6002 11.4 18.0002 10.6666 18.0002ZM6.66663 8.00016C6.66663 8.36683 6.96663 8.66683 7.33329 8.66683H7.99996L10.4 13.7268L9.49996 15.3535C9.01329 16.2468 9.65329 17.3335 10.6666 17.3335H18C18.3666 17.3335 18.6666 17.0335 18.6666 16.6668C18.6666 16.3002 18.3666 16.0002 18 16.0002H10.6666L11.4 14.6668H16.3666C16.8666 14.6668 17.3066 14.3935 17.5333 13.9802L19.92 9.6535C20.1666 9.2135 19.8466 8.66683 19.34 8.66683H9.47329L9.02663 7.7135C8.91996 7.48016 8.67996 7.3335 8.42663 7.3335H7.33329C6.96663 7.3335 6.66663 7.6335 6.66663 8.00016ZM17.3333 18.0002C16.6 18.0002 16.0066 18.6002 16.0066 19.3335C16.0066 20.0668 16.6 20.6668 17.3333 20.6668C18.0666 20.6668 18.6666 20.0668 18.6666 19.3335C18.6666 18.6002 18.0666 18.0002 17.3333 18.0002Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_198_190">
          <Rect width="16" height="16" fill="white" transform="translate(6 6)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};