import { ComponentProps } from "react";
import { View, Text, StyleSheet} from "react-native";
import colors from "../styles/colors";
import { LinearGradient } from "expo-linear-gradient";


interface BarIndicatorProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  colors: ComponentProps<typeof LinearGradient>["colors"],
  text: string
}

export default function BarIndicator({
  value,
  max,
  size = 160,
  colors,
  text 
}: BarIndicatorProps) {
  const safeValue = Math.min(value, max);
  const progress = max > 0 ? safeValue*size / max : 0;

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
      <View style={styles.textContainer}>
        <Text style={[styles.text, {color: colors[0]}]}>{text}</Text>
        <Text style={styles.label}>{value}/{max}g</Text>
      </View>
      <View style={{width: size}}>
        {/* Background */}
        <View style={[styles.background, { width: size }]} />

        {/* Progress */}
        <View style={[styles.progress, { width: progress }]}>
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
    justifyContent: 'space-between',
    flexDirection: 'row',
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
    height: 5,
    backgroundColor: colors.page,
    borderRadius: 28,
    overflow: "hidden"
  },
  progress: {
    height: 5,
    position: 'absolute',
    borderRadius: 28,
    overflow: "hidden"
  },
});
