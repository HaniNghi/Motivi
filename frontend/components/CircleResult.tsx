import { View, Text, StyleSheet } from "react-native";
import colors from "../styles/colors";
import { addComma } from "../lib/utils";

interface CircleResultProps {
  calorie: number;
}

export default function CircleResult({ calorie }: CircleResultProps) {

  const calorieString = addComma(calorie);
  return (
    <View style={styles.circle}>
      <Text style={styles.calorieText}>{calorieString}</Text>
      <Text style={styles.subText}>kcal / day</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 1,
    borderColor: colors.selectedGoalTint3,
    backgroundColor: colors.selectedGoalTint,
    borderRadius: 999,
    width: 200,
    height: 200,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  },
  calorieText: {
    color: colors.primary,
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 50
  },
  subText: {
color: colors.textMuted,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
  }
});
