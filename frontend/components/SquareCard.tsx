import {
  StyleSheet,
  View,
  Text,
  DimensionValue,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import colors from "../styles/colors";
import { LinearGradient } from "expo-linear-gradient";
import { ComponentProps } from "react";

export default function SquareCard({
  main,
  sub,
  width = 110,
  picLink,
  colors,
  onPress,
}: {
  main: string;
  sub: string;
  width?: DimensionValue;
  picLink: ImageSourcePropType;
  colors: ComponentProps<typeof LinearGradient>["colors"];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.heroCard, { width: width, height: width }]}
      onPress={onPress}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Image source={picLink} style={styles.pic} resizeMode="contain" />
      <Text style={styles.mainText}>{main}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 26,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.12)",
    boxShadow: "0 8px 40px rgba(99, 102, 241, 0.16)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  sub: {
    color: colors.surfaceMuted,
    fontSize: 10,
    marginTop: 5,
    fontFamily: "PlusJakartaSans-Regular",
  },

  mainText: {
    color: colors.textWhite,
    fontSize: 12,
    marginTop: 5,
    fontFamily: "PlusJakartaSans-Bold",
  },
  pic: {
    height: "25%",
    width: "25%",
    marginTop: 5,
    marginBottom: 5,
  },
});
