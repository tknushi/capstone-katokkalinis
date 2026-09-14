import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SilhouetteProps {
  variant?: "forest" | "city";
  height?: number;
}

export default function IllustrationSilhouettes({
  variant = "forest",
  height = 140,
}: SilhouetteProps) {
  if (variant === "city") {
    return (
      <View style={[styles.container, { height }]}>
        <Svg width={SCREEN_WIDTH} height={height} viewBox={`0 0 ${SCREEN_WIDTH} ${height}`} fill="none">
          {/* Background hills */}
          <Path
            d={`M0 ${height * 0.75} Q ${SCREEN_WIDTH * 0.25} ${height * 0.45} ${SCREEN_WIDTH * 0.5} ${height * 0.65} T ${SCREEN_WIDTH} ${height * 0.55} L ${SCREEN_WIDTH} ${height} L 0 ${height} Z`}
            fill="#E2F4DF"
            opacity="0.7"
          />
          {/* Distant building silhouettes */}
          <G fill="#C8EBC3" opacity="0.65">
            <Rect x={SCREEN_WIDTH * 0.1} y={height * 0.42} width={28} height={height * 0.58} rx={2} />
            <Rect x={SCREEN_WIDTH * 0.16} y={height * 0.32} width={34} height={height * 0.68} rx={2} />
            <Rect x={SCREEN_WIDTH * 0.28} y={height * 0.48} width={24} height={height * 0.52} rx={2} />
            <Rect x={SCREEN_WIDTH * 0.68} y={height * 0.35} width={36} height={height * 0.65} rx={2} />
            <Rect x={SCREEN_WIDTH * 0.78} y={height * 0.45} width={28} height={height * 0.55} rx={2} />
          </G>
          {/* Foreground city buildings & modern town shapes */}
          <G fill="#B0E2A8">
            <Rect x={SCREEN_WIDTH * 0.05} y={height * 0.55} width={32} height={height * 0.45} rx={3} />
            <Rect x={SCREEN_WIDTH * 0.22} y={height * 0.48} width={38} height={height * 0.52} rx={3} />
            <Rect x={SCREEN_WIDTH * 0.35} y={height * 0.58} width={30} height={height * 0.42} rx={3} />
            <Rect x={SCREEN_WIDTH * 0.52} y={height * 0.50} width={42} height={height * 0.50} rx={3} />
            <Rect x={SCREEN_WIDTH * 0.85} y={height * 0.52} width={36} height={height * 0.48} rx={3} />
          </G>
          {/* Subtle trees */}
          <G fill="#79B96A">
            <Circle cx={SCREEN_WIDTH * 0.18} cy={height * 0.72} r={14} />
            <Circle cx={SCREEN_WIDTH * 0.46} cy={height * 0.74} r={16} />
            <Circle cx={SCREEN_WIDTH * 0.66} cy={height * 0.70} r={18} />
          </G>
        </Svg>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={SCREEN_WIDTH} height={height} viewBox={`0 0 ${SCREEN_WIDTH} ${height}`} fill="none">
        {/* Soft background landscape */}
        <Path
          d={`M0 ${height * 0.7} Q ${SCREEN_WIDTH * 0.3} ${height * 0.45} ${SCREEN_WIDTH * 0.6} ${height * 0.6} T ${SCREEN_WIDTH} ${height * 0.5} L ${SCREEN_WIDTH} ${height} L 0 ${height} Z`}
          fill="#D9F2D5"
          opacity="0.8"
        />

        {/* Layer of pine / forest trees */}
        <G fill="#88CB7A" opacity="0.6">
          {/* Left Tree cluster */}
          <Path d={`M${SCREEN_WIDTH * 0.05} ${height * 0.75} L${SCREEN_WIDTH * 0.08} ${height * 0.35} L${SCREEN_WIDTH * 0.11} ${height * 0.75} Z`} />
          <Path d={`M${SCREEN_WIDTH * 0.1} ${height * 0.8} L${SCREEN_WIDTH * 0.14} ${height * 0.28} L${SCREEN_WIDTH * 0.18} ${height * 0.8} Z`} />
          <Path d={`M${SCREEN_WIDTH * 0.17} ${height * 0.82} L${SCREEN_WIDTH * 0.2} ${height * 0.4} L${SCREEN_WIDTH * 0.23} ${height * 0.82} Z`} />

          {/* Right Tree cluster */}
          <Path d={`M${SCREEN_WIDTH * 0.75} ${height * 0.8} L${SCREEN_WIDTH * 0.8} ${height * 0.32} L${SCREEN_WIDTH * 0.85} ${height * 0.8} Z`} />
          <Path d={`M${SCREEN_WIDTH * 0.83} ${height * 0.82} L${SCREEN_WIDTH * 0.88} ${height * 0.25} L${SCREEN_WIDTH * 0.93} ${height * 0.82} Z`} />
          <Path d={`M${SCREEN_WIDTH * 0.9} ${height * 0.85} L${SCREEN_WIDTH * 0.95} ${height * 0.38} L${SCREEN_WIDTH * 1.0} ${height * 0.85} Z`} />
        </G>

        {/* Darker foreground pine trees */}
        <G fill="#57A547" opacity="0.85">
          <Path d={`M${SCREEN_WIDTH * 0.02} ${height * 0.9} L${SCREEN_WIDTH * 0.06} ${height * 0.45} L${SCREEN_WIDTH * 0.1} ${height * 0.9} Z`} />
          <Path d={`M${SCREEN_WIDTH * 0.12} ${height * 0.92} L${SCREEN_WIDTH * 0.16} ${height * 0.42} L${SCREEN_WIDTH * 0.2} ${height * 0.92} Z`} />
          <Path d={`M${SCREEN_WIDTH * 0.86} ${height * 0.92} L${SCREEN_WIDTH * 0.91} ${height * 0.36} L${SCREEN_WIDTH * 0.96} ${height * 0.92} Z`} />
        </G>

        {/* Small Garbage Truck Silhouette driving on bottom right */}
        <G transform={`translate(${SCREEN_WIDTH * 0.64}, ${height * 0.65}) scale(0.65)`} fill="#2E6325">
          {/* Main Truck Body & Hopper */}
          <Rect x="0" y="5" width="38" height="24" rx="4" />
          {/* Cab */}
          <Rect x="38" y="11" width="16" height="18" rx="2" />
          {/* Cab Window */}
          <Rect x="44" y="14" width="8" height="7" rx="1" fill="#E8F8EE" />
          {/* Recycle emblem on truck body */}
          <Circle cx="19" cy="17" r="6" fill="#E8F8EE" />
          <Path d="M19 13l2 3h-4z" fill="#2E6325" />
          {/* Wheels */}
          <Circle cx="10" cy="30" r="5" fill="#1C3D16" />
          <Circle cx="10" cy="30" r="2.5" fill="#E8F8EE" />
          <Circle cx="44" cy="30" r="5" fill="#1C3D16" />
          <Circle cx="44" cy="30" r="2.5" fill="#E8F8EE" />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
});
