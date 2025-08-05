import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, {
  Path,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';

export const WelcomeBackground: React.FC = () => {
  return (
    <Svg
      width="100%"
      height="100%"
      style={StyleSheet.absoluteFillObject}
      viewBox="0 0 430 932"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <RadialGradient
          id="paint0_radial_101_179"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(-17.1884 137.303) rotate(94.7492) scale(723.801 1414.01)"
        >
          <Stop stopColor="#B5FA01" />
          <Stop offset="0.522501" stopColor="#53EFAE" />
          <Stop offset="0.789018" stopColor="#72E1F5" />
          <Stop offset="1" stopColor="#C6C2FF" />
        </RadialGradient>
      </Defs>
      
      <Path
        d="M766.798 -341.141C726.913 -16.3986 580.154 669.205 312.19 813.677C-22.7653 994.267 -147.21 202.843 97.5086 46.8775C248.999 -49.6715 381.101 186.641 215.682 502.69C169.827 590.302 -284.545 1300.84 -461.618 885.113C-638.692 469.381 -516.934 1085.66 -516.934 1085.66"
        stroke="url(#paint0_radial_101_179)"
        strokeOpacity="0.08"
        strokeWidth="115"
        fill="none"
      />
    </Svg>
  );
};