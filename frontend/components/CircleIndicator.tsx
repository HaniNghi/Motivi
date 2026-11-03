import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import colors from "../styles/colors";
import { addComma } from "../lib/utils";

interface CircleIndicatorProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
}

export default function CircleIndicator({
  value,
  max,
  size = 150,
  strokeWidth = 12,
}: CircleIndicatorProps) {
  const safeValue = Math.min(value, max);
  const progress = max > 0 ? safeValue / max : 0;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size, alignSelf: "center", justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient
            id="primaryGradient"
            x1="0%"
            y1="100%"
            x2="100%"
            y2="0%"
          >
            <Stop offset="0%" stopColor={colors.primaryGradient[0]} />
            <Stop offset="100%" stopColor={colors.primaryGradient[1]} />
          </LinearGradient>
        </Defs>

        {/* Background */}
        <Circle
          stroke={colors.track}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Progress */}
        <Circle
          stroke="url(#primaryGradient)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.value}>{addComma(value)}</Text>
        <Text style={styles.label}>kcal eaten</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    position: "absolute",
    alignItems: "center",
    alignSelf: 'center',
  },
  value: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "600",
  },
  label: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 4,
  },
});
