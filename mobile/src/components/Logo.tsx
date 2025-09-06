import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle } from 'react-native-svg';

interface LogoProps {
  size?: number;
  style?: any;
}

export default function Logo({ size = 40, style }: LogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          <LinearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#A8E6CF" />
            <Stop offset="100%" stopColor="#88D8C0" />
          </LinearGradient>
        </Defs>
        {/* Background shape */}
        <Rect x="10" y="10" width="80" height="80" rx="20" fill="url(#backgroundGradient)" />
        {/* Book/journal pages */}
        <Path d="M30 25 H70 V35 H30 Z" fill="#F5F5F5" />
        <Path d="M30 40 H70 V50 H30 Z" fill="#F5F5F5" />
        <Path d="M30 55 H60 V65 H30 Z" fill="#F5F5F5" />
        {/* AI/Thought bubble */}
        <Circle cx="75" cy="25" r="10" fill="#E8E8E8" opacity="0.8" />
        <Circle cx="65" cy="35" r="5" fill="#E8E8E8" opacity="0.8" />
        {/* Growth leaf */}
        <Path d="M25 70 C20 75, 20 80, 25 85 C30 80, 30 75, 25 70 Z" fill="#66BB6A" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
