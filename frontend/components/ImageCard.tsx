import {
  StyleSheet,
  View,
  Text,
  DimensionValue,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";
import keys from "../styles/keys";
import { ReactNode } from "react";
import colors from "../styles/colors";
import { LinearGradient } from "expo-linear-gradient";

export default function ImageCard({
  title,
  sub,
  width = 200,
  height = 100,
  button = false,
  buttonPill = true,
  buttonTitle,
  onPress,
  picLink,
}: {
  title?: string;
  sub?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  button?: boolean;
  buttonPill?: boolean;
  buttonTitle?: string;
  onPress?: () => void;
  picLink: ImageSourcePropType;
}) {
  return (
    <View style={[styles.heroCard, { width: width, height: height }]}>
      <View style={StyleSheet.absoluteFill}>
        <Image style={styles.image} source={picLink} resizeMode="cover" />
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { opacity: 0.65 }]}
        />
      </View>

      <View style={styles.header}>
        {title && sub ? (
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.sub}>{sub}</Text>
          </View>
        ) : (
          <View />
        )}
        {button && buttonTitle && (
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: buttonPill ? colors.whiteTint : "" },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>{buttonTitle}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 28,
    overflow: "hidden",
    justifyContent: "center",
  },

  header: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    position: "absolute",
  },

  title: {
    color: colors.textWhite,
    fontSize: 14,
    fontFamily: "PlusJakartaSans-Bold",
  },
  sub: {
    color: colors.surfaceSoft,
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Regular",
  },

  button: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth:1,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: colors.textWhite,
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Bold",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 28,
  },
});
