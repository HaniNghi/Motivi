import { StyleSheet, View, Text, DimensionValue, Image, ImageSourcePropType } from "react-native";
import colors from "../styles/colors";

export default function RowImageContent({
  picLink,
  first,
  second,
  width = "100%",
}: {
  picLink?: ImageSourcePropType;
  first?: string;
  second?: string;
  width?: DimensionValue;
  height?: DimensionValue;
}) {
  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.left}>
        {picLink && <Image source={picLink} style={styles.pic} resizeMode="contain" />}
        <Text style={styles.firstText}>{first}</Text>
      </View>
      {second ? <Text style={styles.secondText}>{second}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomColor: colors.page,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pic: {
    height: 20,
    width: 20,
  },
  firstText: {
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: "PlusJakartaSans-Medium",
  },
  secondText: {
    color: colors.text,
    fontSize: 15,
    fontFamily: "PlusJakartaSans-Bold",
  },
  
});
