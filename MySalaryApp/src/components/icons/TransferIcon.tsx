import React from 'react';
import Svg, { Rect, Path, Defs, ClipPath, G, RadialGradient, Stop } from 'react-native-svg';

interface TransactionIconProps {
  width?: number;
  height?: number;
  fill?: string;
  backgroundColor?: string;
  // Gradient props for transfer transactions
  useGradient?: boolean;
  fromColor?: string;
  toColor?: string;
}

export const TransferIcon: React.FC<TransactionIconProps> = ({
  width = 28,
  height = 28,
  fill = '#7A7E85',
  backgroundColor = '#EEF1F2',
  useGradient = false,
  fromColor,
  toColor,
}) => {
  const gradientId = `transfer-gradient-${Math.random().toString(36).substring(2, 11)}`;
  
  // When using gradient, arrows should be white, background gets the gradient
  const iconFill = useGradient && fromColor && toColor ? '#FFFFFF' : fill;
  const backgroundFill = useGradient && fromColor && toColor ? `url(#${gradientId})` : backgroundColor;

  return (
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
      <Defs>
        {useGradient && fromColor && toColor && (
          <RadialGradient
            id={gradientId}
            cx="-0.1176"
            cy="0.4853"
            r="1.1176"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0%" stopColor={fromColor} />
            <Stop offset="90.38%" stopColor={toColor} />
          </RadialGradient>
        )}
        
        <ClipPath id="clip0_198_93">
          <Rect
            width="16"
            height="16"
            fill="white"
            transform="translate(6 6)"
          />
        </ClipPath>
      </Defs>
      
      <Rect width="28" height="28" rx="14" fill={backgroundFill} />
      <G clipPath="url(#clip0_198_93)">
        <Path
          d="M20.4333 11.1002L18.5733 9.24018C18.36 9.02685 18 9.17352 18 9.47352V10.6668H8.66667C8.3 10.6668 8 10.9668 8 11.3335C8 11.7002 8.3 12.0002 8.66667 12.0002H18V13.1935C18 13.4935 18.36 13.6402 18.5667 13.4268L20.4267 11.5668C20.56 11.4402 20.56 11.2268 20.4333 11.1002Z"
          fill={iconFill}
        />
        <Path
          d="M7.56672 16.9003L9.42672 18.7603C9.64005 18.9737 10.0001 18.827 10.0001 18.527V17.3337H19.3334C19.7001 17.3337 20.0001 17.0337 20.0001 16.667C20.0001 16.3003 19.7001 16.0003 19.3334 16.0003H10.0001V14.807C10.0001 14.507 9.64005 14.3603 9.43338 14.5737L7.57338 16.4337C7.44005 16.5603 7.44005 16.7737 7.56672 16.9003Z"
          fill={iconFill}
        />
      </G>
    </Svg>
  );
};
