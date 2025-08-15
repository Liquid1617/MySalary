import React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

interface SearchIconProps {
  size?: number;
  color?: string;
}

export const SearchIcon: React.FC<SearchIconProps> = ({ 
  size = 24, 
  color = '#252233' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_274_295)">
        <Path
          d="M15.4996 13.9999H14.7096L14.4296 13.7299C15.6296 12.3299 16.2496 10.4199 15.9096 8.38989C15.4396 5.60989 13.1196 3.38989 10.3196 3.04989C6.08965 2.52989 2.52965 6.08989 3.04965 10.3199C3.38965 13.1199 5.60965 15.4399 8.38965 15.9099C10.4196 16.2499 12.3296 15.6299 13.7296 14.4299L13.9996 14.7099V15.4999L18.2496 19.7499C18.6596 20.1599 19.3296 20.1599 19.7396 19.7499C20.1496 19.3399 20.1496 18.6699 19.7396 18.2599L15.4996 13.9999ZM9.49965 13.9999C7.00965 13.9999 4.99965 11.9899 4.99965 9.49989C4.99965 7.00989 7.00965 4.99989 9.49965 4.99989C11.9896 4.99989 13.9996 7.00989 13.9996 9.49989C13.9996 11.9899 11.9896 13.9999 9.49965 13.9999Z"
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_274_295">
          <Rect width="24" height="24" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};