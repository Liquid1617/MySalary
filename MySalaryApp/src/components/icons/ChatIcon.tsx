import React from 'react';
import Svg, {
  G,
  Path,
  Rect,
  Defs,
  Filter,
  FeFlood,
  FeColorMatrix,
  FeOffset,
  FeGaussianBlur,
  FeComposite,
  FeBlend,
  RadialGradient,
  Stop,
} from 'react-native-svg';

export const ChatIcon: React.FC = () => (
  <Svg width="54" height="54" viewBox="0 0 54 54" fill="none">
    <G filter="url(#filter0_d_338_422)">
      <Rect
        x="4"
        y="4"
        width="42"
        height="42"
        rx="21"
        fill="url(#paint0_radial_338_422)"
        shapeRendering="crispEdges"
      />
      <Path
        d="M23.5 18.25H26.5C28.0913 18.25 29.6174 18.8821 30.7426 20.0074C31.8679 21.1326 32.5 22.6587 32.5 24.25C32.5 25.8413 31.8679 27.3674 30.7426 28.4926C29.6174 29.6179 28.0913 30.25 26.5 30.25V32.875C22.75 31.375 17.5 29.125 17.5 24.25C17.5 22.6587 18.1321 21.1326 19.2574 20.0074C20.3826 18.8821 21.9087 18.25 23.5 18.25ZM25 28.75H26.5C27.6935 28.75 28.8381 28.2759 29.682 27.432C30.5259 26.5881 31 25.4435 31 24.25C31 23.0565 30.5259 21.9119 29.682 21.068C28.8381 20.2241 27.6935 19.75 26.5 19.75H23.5C22.3065 19.75 21.1619 20.2241 20.318 21.068C19.4741 21.9119 19 23.0565 19 24.25C19 26.9575 20.8465 28.7245 25 30.61V28.75Z"
        fill="#252233"
      />
    </G>
    <Defs>
      <Filter
        id="filter0_d_338_422"
        x="0"
        y="0"
        width="54"
        height="54"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <FeFlood floodOpacity="0" result="BackgroundImageFix" />
        <FeColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <FeOffset dx="2" dy="2" />
        <FeGaussianBlur stdDeviation="3" />
        <FeComposite in2="hardAlpha" operator="out" />
        <FeColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"
        />
        <FeBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_338_422"
        />
        <FeBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_338_422"
          result="shape"
        />
      </Filter>
      <RadialGradient
        id="paint0_radial_338_422"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(9.04 39.7) rotate(-51.6135) scale(41.2584 90.0166)">
        <Stop stopColor="#C6C2FF" />
        <Stop offset="0.278846" stopColor="#72E1F5" />
        <Stop offset="0.6875" stopColor="#53EFAE" />
        <Stop offset="1" stopColor="#B5FA01" />
      </RadialGradient>
    </Defs>
  </Svg>
);