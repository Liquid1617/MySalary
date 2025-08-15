import React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

interface SendArrowIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const SendArrowIcon: React.FC<SendArrowIconProps> = ({ 
  width = 20, 
  height = 20, 
  color = '#252233' 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <G clipPath="url(#clip0_381_626)">
        <Path 
          d="M10.8333 15.8332V6.5249L14.8999 10.5916C15.2249 10.9166 15.7583 10.9166 16.0833 10.5916C16.4083 10.2666 16.4083 9.74157 16.0833 9.41657L10.5916 3.9249C10.2666 3.5999 9.7416 3.5999 9.4166 3.9249L3.9166 9.40824C3.5916 9.73324 3.5916 10.2582 3.9166 10.5832C4.2416 10.9082 4.7666 10.9082 5.0916 10.5832L9.1666 6.5249V15.8332C9.1666 16.2916 9.5416 16.6666 9.99994 16.6666C10.4583 16.6666 10.8333 16.2916 10.8333 15.8332Z" 
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_381_626">
          <Rect width="20" height="20" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
};