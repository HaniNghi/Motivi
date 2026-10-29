import { EvilIcons, Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../styles/colors";


interface IconContentButtonProps {
  mainTitle: string;
  subTitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  clicked: boolean;
  color?: string;
  tintColor?: string;
  onPress?: () => void;
}

export default function IconContentButton({
  mainTitle,
  subTitle,
  icon,
  color = colors.primary,
  clicked,
  tintColor = colors.selectedGoalTint,
  onPress,
}: IconContentButtonProps) {
  return (
    <View >
      <TouchableOpacity style={[styles.buttonBase, clicked? [styles.clickedContainer, {borderColor: color}]: styles.nonClickedContainer]} onPress={onPress}>
        {clicked && (
          <View
            style={[StyleSheet.absoluteFill, {backgroundColor: tintColor}]}
          />
        )}
        <View  style={styles.boxInRow}>
          <View style={styles.icon}>
            <Ionicons name={icon} size={20} color={clicked? color: colors.text} />
          </View>
          <View style={styles.textInColumn}>
            <Text style={clicked? [styles.clickedMainText, {color: color}]: styles.nonClickedMainText}>{mainTitle}</Text>
            <Text style={styles.subText}>{subTitle}</Text>
          </View>
        {clicked &&  <EvilIcons name="check" size={24} color={color} />}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    backgroundColor: colors.featureOverlayStart,
    borderRadius: 12,
    padding: 8,
    marginTop: 10,
    overflow: "hidden",
    position: "relative",
  },
  icon: {
    marginLeft: 5,
    marginRight: 5,
  },
  boxInRow:{
    flex: 1,
    flexDirection: 'row',
    width: '95%',
    alignItems: 'center'
  },
  textInColumn:{
    flex: 1,
    flexDirection: 'column',
    marginLeft: 5,
  },
  clickedContainer: {
    borderRadius: 12,
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  clickedMainText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-SemiBold'
  },
  nonClickedContainer: {
    borderRadius: 12,
    backgroundColor: colors.buttonSecondary,
    borderColor: colors.border,
    borderWidth: 1.5,
  },
  nonClickedMainText: {
    color: colors.text,
    fontFamily: 'PlusJakartaSans-SemiBold'
  },
  subText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: colors.textMuted,
  }
})