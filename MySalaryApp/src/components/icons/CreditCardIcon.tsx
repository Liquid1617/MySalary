import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CreditCardIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

export const CreditCardIcon: React.FC<CreditCardIconProps> = ({
  width = 29,
  height = 24,
  fill = '#9D97E9',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 29 24" fill="none">
      <Path
        d="M25.8335 0.666656H3.16683C1.59433 0.666656 0.347663 1.92749 0.347663 3.49999L0.333496 20.5C0.333496 22.0725 1.59433 23.3333 3.16683 23.3333H25.8335C27.406 23.3333 28.6668 22.0725 28.6668 20.5V3.49999C28.6668 1.92749 27.406 0.666656 25.8335 0.666656ZM24.4168 20.5H4.5835C3.80433 20.5 3.16683 19.8625 3.16683 19.0833V12H25.8335V19.0833C25.8335 19.8625 25.196 20.5 24.4168 20.5ZM25.8335 6.33332H3.16683V4.91666C3.16683 4.13749 3.80433 3.49999 4.5835 3.49999H24.4168C25.196 3.49999 25.8335 4.13749 25.8335 4.91666V6.33332Z"
        fill={fill}
      />
    </Svg>
  );
};