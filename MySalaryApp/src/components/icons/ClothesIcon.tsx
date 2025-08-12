import React from 'react';
import Svg, { Rect, Path, Defs, ClipPath, G } from 'react-native-svg';

interface ClothesIconProps {
  width?: number;
  height?: number;
  fill?: string;
  backgroundColor?: string;
}

export const ClothesIcon: React.FC<ClothesIconProps> = ({
  width = 28,
  height = 28,
  fill = '#7A7E85',
  backgroundColor = '#EEF1F2',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Rect width="28" height="28" rx="14" fill={backgroundColor} />
      <G clipPath="url(#clip0_302_402)">
        <Path
          d="M18.6667 9.99984H17.3333C17.3333 8.15984 15.84 6.6665 14 6.6665C12.16 6.6665 10.6667 8.15984 10.6667 9.99984H9.33333C8.6 9.99984 8 10.5998 8 11.3332V19.3332C8 20.0665 8.6 20.6665 9.33333 20.6665H18.6667C19.4 20.6665 20 20.0665 20 19.3332V11.3332C20 10.5998 19.4 9.99984 18.6667 9.99984ZM14 7.99984C15.1067 7.99984 16 8.89317 16 9.99984H12C12 8.89317 12.8933 7.99984 14 7.99984ZM14 14.6665C12.4467 14.6665 11.14 13.6065 10.7733 12.1665C10.66 11.7465 10.9867 11.3332 11.42 11.3332C11.7333 11.3332 11.9867 11.5598 12.0733 11.8665C12.3067 12.7132 13.08 13.3332 14 13.3332C14.92 13.3332 15.6933 12.7132 15.9267 11.8665C16.0133 11.5598 16.2667 11.3332 16.58 11.3332C17.0133 11.3332 17.3333 11.7465 17.2267 12.1665C16.86 13.6065 15.5533 14.6665 14 14.6665Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_302_402">
          <Rect width="16" height="16" fill="white" transform="translate(6 6)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};