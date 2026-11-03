import { View, Text, StyleSheet } from "react-native";
import colors from "../styles/colors";


interface CalorieInfoProps {
  eaten: number,
  left: number,
  target: number,
  fontSize: number,
}

export default function CalorieInfo({eaten, left, target, fontSize}: CalorieInfoProps) {
  return (
    <View style={styles.infoContainer}>
      <View>
        <Text style={[styles.number, {color: colors.primary, fontSize: fontSize}]}>{eaten}</Text>
        <Text style={[styles.text, {fontSize: fontSize - 4}]}>Eaten</Text>
      </View>
      <View>
        <Text style={[styles.number, {color: colors.teal, fontSize: fontSize}]}>{left}</Text>
        <Text style={[styles.text, {fontSize: fontSize - 4}]}>Left</Text>
      </View>
      <View>
        <Text style={[styles.number, {color: colors.textSoft, fontSize: fontSize}]}>{target}</Text>
        <Text style={[styles.text, {fontSize: fontSize - 4}]}>Target</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  text: {
    color: colors.textSoft,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    alignSelf: 'center'

  },
  number: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    
    alignSelf: 'center'
  }
})