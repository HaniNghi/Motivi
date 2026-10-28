import { LinearGradient } from "expo-linear-gradient";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  DimensionValue,
} from "react-native";
import keys from "../styles/keys";
import colors from "../styles/colors";

interface SmallGradientButtonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  text?: string;
  color?: readonly [string, string, ...string[]];
  clicked?: boolean;
  borderRadius?: number;
  onPress?: () => void;
}

export default function SmallGradientButton({
  width = 30,
  height = 30,
  text = "button",
  color = colors.primaryGradient,
  clicked = false,
  borderRadius = 16,
  onPress,
}: SmallGradientButtonProps) {
  return (
    <View style={{width: width, margin: 2}}>
      <TouchableOpacity
        style={[
          clicked? styles.primaryButton : styles.nonClickedButton,
          { alignSelf: "center", width: '100%', height: height , borderRadius: borderRadius},
        ]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        {clicked && (
          <LinearGradient
            colors={color}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        <Text style={[styles.buttonText, clicked? styles.clicked : styles.nonClicked]}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Bold",
  },
  nonClicked: {
    color: colors.textMuted,

  },
  clicked: {
    color: colors.textWhite,
  },
  primaryButton: {
    paddingHorizontal: 10,
    backgroundColor: '#6366f1',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
  },
  nonClickedButton: {
    paddingHorizontal: 10,
    backgroundColor: colors.buttonSecondary,
    borderColor: colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
    borderWidth: 1.5,
  },
});
