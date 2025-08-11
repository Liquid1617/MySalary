import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface DebitCardIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

export const DebitCardIcon: React.FC<DebitCardIconProps> = ({
  width = 29,
  height = 24,
  fill = '#32C4DE',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 29 24" fill="none">
      <Path
        d="M25.8335 0.666687H3.16683C1.59433 0.666687 0.347663 1.92752 0.347663 3.50002L0.333496 20.5C0.333496 22.0725 1.59433 23.3334 3.16683 23.3334H25.8335C27.406 23.3334 28.6668 22.0725 28.6668 20.5V3.50002C28.6668 1.92752 27.406 0.666687 25.8335 0.666687ZM24.4168 20.5H4.5835C3.80433 20.5 3.16683 19.8625 3.16683 19.0834V12H25.8335V19.0834C25.8335 19.8625 25.196 20.5 24.4168 20.5ZM25.8335 6.33335H3.16683V4.91669C3.16683 4.13752 3.80433 3.50002 4.5835 3.50002H24.4168C25.196 3.50002 25.8335 4.13752 25.8335 4.91669V6.33335Z"
        fill={fill}
      />
    </Svg>
  );
};