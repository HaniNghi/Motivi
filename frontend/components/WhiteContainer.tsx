import {
  StyleSheet,
  View,
  Text,
  DimensionValue,
  TouchableOpacity,
} from "react-native";
import keys from "../styles/keys";
import { ReactNode } from "react";
import colors from "../styles/colors";

export default function WhiteContainer({
  title,
  children,
  width,
  titleColor,
  button = false,
  buttonPill = true,
  buttonTitle,
  onPress,
}: {
  title?: string;
  children?: ReactNode;
  width?: DimensionValue;
  titleColor?: string;
  button?: boolean;
  buttonPill?: boolean
  buttonTitle?: string;
  onPress?: () => void;
}) {
  const showHeader = Boolean(title || (button && buttonTitle));

  return (
    <View style={[styles.heroCard, { width: width }]}>
      {showHeader && (
        <View style={styles.header}>
          {title ? (
            <Text style={[styles.title, titleColor && { color: titleColor }]}>
              {title}
            </Text>
          ) : (
            <View />
          )}
          {button && buttonTitle && (
            <TouchableOpacity
              style={[styles.button, {backgroundColor : buttonPill ? colors.surfaceMuted: '' } ]}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>{buttonTitle}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: keys.heroCard,

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  title: {
    color: colors.textSoft,
    fontSize: 14,
    fontFamily: "PlusJakartaSans-Bold",
  },

  button: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Bold",
  },
});

