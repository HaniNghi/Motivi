import { TouchableOpacity, View, Text, StyleSheet, DimensionValue } from "react-native";
import keys from "../styles/keys";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../styles/colors";

interface PrimaryButtonProps {
  text: string,
  onPress: () => void,
  primary: boolean,
  width?: DimensionValue
}

export default function PrimaryButton({text, onPress, primary, width = 100} : PrimaryButtonProps) {
  return (
    <View style={[styles.btnContainer, {width: width}]}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={onPress}
          >
            {primary && 
            <LinearGradient
              colors={colors.primaryGradient}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />}
            <Text style={[styles.primaryButtonText, primary && {color: colors.textWhite}]}>{text}</Text>
          </TouchableOpacity>
          
        </View>
  )
}

const styles = StyleSheet.create({
  btnContainer: {
    marginTop: 20,
  },
  primaryButton: {
    height: 36,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.textWhite,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: colors.page
  },
  primaryButtonText: {
    color: colors.textMuted,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
  }
})