import {
  StyleSheet,
  View,
  Text,
  Image,
  DimensionValue,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import keys from "../styles/keys";
import { ReactNode } from "react";
import colors from "../styles/colors";

export default function CardImageContainer({
  picLink,
  firstText,
  secondText,
  width = 120,
}: {
  picLink?: ImageSourcePropType;
  firstText: string;
  secondText: string;
  width?: DimensionValue
}) {

  return (
    <View style={[styles.container, {width: width}]}>
      {picLink && <Image source={picLink} style={styles.pic} resizeMode="contain"/>}
      <Text style={styles.mainText}>{firstText}</Text>
      <Text style={styles.subText}>{secondText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: "space-between",
    paddingVertical: 8,
    backgroundColor: colors.surfaceAlt,
    padding: 20,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.selectedGoalTint2,
    margin: 4,
  },
  mainText: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: "PlusJakartaSans-Bold",
    marginTop: 2,
    marginBottom: 2,
  },
  subText: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: "PlusJakartaSans-Regular",
    marginTop: 2,
    marginBottom: 2,
  },
  pic: {
    height: 20,
    width: 20,
    marginTop: 5,
    marginBottom: 5,
  },
});

