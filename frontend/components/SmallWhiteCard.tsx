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

export default function SmallWhiteCard({
  main,
  sub,
  width =80
}: {
  main: string;
  sub: string;
  width?: DimensionValue;
}) {

  return (
    <View style={[styles.heroCard, { width: width }]}>
      <Text style={styles.mainText}>{main}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.12)',
    boxShadow: '0 8px 40px rgba(99, 102, 241, 0.16)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sub: {
    color: colors.textSoft,
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Regular",
  },

  mainText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: "PlusJakartaSans-Bold",
  },
});

