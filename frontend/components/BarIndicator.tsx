import { ComponentProps } from "react";
import { View, Text, StyleSheet, DimensionValue } from "react-native";
import colors from "../styles/colors";
import { LinearGradient } from "expo-linear-gradient";

interface BarIndicatorProps {
  value: number;
  max: number;
  size?: DimensionValue;
  strokeWidth?: number;
  colors: ComponentProps<typeof LinearGradient>["colors"];
  text?: string;
}

export default function BarIndicator({
  value,
  max,
  size = 160,
  strokeWidth = 5,
  colors,
  text,
}: BarIndicatorProps) {
  const safeValue = Math.min(value, max);
  const progressPercent = max > 0 ? (safeValue / max) * 100 : 0;

  return (
    <View
      style={{
        width: size,
        alignSelf: "center",
        justifyContent: "center",
        marginBottom: 5,
      }}
    >
      {/* Text */}
      {text && (
        <View style={styles.textContainer}>
          <Text style={[styles.text, { color: colors[0] }]}>{text}</Text>
          <Text style={styles.label}>
            {value}/{max}g
          </Text>
        </View>
      )}
      <View style={{ width: "100%" }}>
        {/* Background */}
        <View style={[styles.background, { width: "100%" , height: strokeWidth}]} />

        {/* Progress */}
        <View style={[styles.progress, { width: `${progressPercent}%`, height: strokeWidth }]}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
  },
  label: {
    color: colors.textSoft,
    fontSize: 10,
    marginTop: 4,
  },
  background: {
    backgroundColor: colors.page,
    borderRadius: 28,
    overflow: "hidden",
  },
  progress: {
    position: "absolute",
    borderRadius: 28,
    overflow: "hidden",
  },
});
