import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface BackgroundCurveProps {
  width?: number;
  height?: number;
  style?: any;
}

export const BackgroundCurve: React.FC<BackgroundCurveProps> = ({
  width = 425, // Увеличиваем на 5% (было 405)
  height = 907, // Увеличиваем на 5% (было 864)
  style,
}) => {
  return (
    <View
      style={[
        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
        style,
      ]}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 533 1134"
        style={{ position: 'absolute', top: 0, right: 0 }}>
        <Defs>
          <LinearGradient
            id="paint0_linear_89_2167"
            x1="512.985"
            y1="1022.68"
            x2="252.004"
            y2="21.1567"
            gradientUnits="userSpaceOnUse">
            <Stop stopColor="#D1CCFF" />
            <Stop offset="0.210982" stopColor="#8CE6F3" />
            <Stop offset="0.477499" stopColor="#7AF0C4" />
            <Stop offset="1" stopColor="#C7FB33" />
          </LinearGradient>
        </Defs>
        <Path
          d="M-621.186 679.377C-226.215 1016.86 234.524 960.082 414.414 698.624C617.48 403.483 509.575 3.53517 236.296 59.5256C-147.747 138.21 -415.898 1172.62 96.0495 1126.04C505.608 1088.77 1051.77 314.944 1273.66 -67.3105"
          stroke="url(#paint0_linear_89_2167)"
          strokeOpacity="0.1"
          strokeWidth="141.822"
          fill="none"
        />
      </Svg>
    </View>
  );
};
