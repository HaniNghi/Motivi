import { Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WhiteContainer from "../../components/WhiteContainer";
import { useCallback, useDebugValue, useEffect, useState } from "react";
import { getDate, shortDatetime } from "../../lib/utils";
import CalorieInfo from "../../components/CalorieInfo";
import { DiaryDaySession } from "../../lib/types";
import { getDiaryDay } from "../../services/diary";
import { useFocusEffect } from "expo-router";
import BarIndicator from "../../components/BarIndicator";
import colors from "../../styles/colors";

const screenWidth = Dimensions.get("window").width;

export default function Diary() {
  const [shortDt, setShortDt] = useState(shortDatetime());
  const [date, setDate] = useState(getDate());

  const [diaryDay, setDiaryDay] = useState<DiaryDaySession>();
  const [errorMsg, setErrorMsg] = useState<string>();

  const targetCalories = diaryDay?.target.calories ?? 0;
  const consumedCalories = diaryDay?.consumed.calories ?? 0;
  const remainingCalories = diaryDay?.remaining.calories ?? 0;
  const fetchDiaryDay = async () => {
    try {
      const result = await getDiaryDay(date);
      setDiaryDay(result);
      setDate(getDate());
    } catch (error: any) {
      setErrorMsg(`${error.code} ${error.message}`);
    }
  };
  useEffect(() => {
    let secTimer = setInterval(() => {
      setShortDt(shortDatetime());
    }, 60000);
    return () => clearInterval(secTimer);
  });
  useFocusEffect(
    useCallback(() => {
      fetchDiaryDay();
    }, [date]),
  );
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <WhiteContainer>
            <Text>{shortDt}</Text>
          </WhiteContainer>
        </View>
        <View style={styles.indicatorContainer}>
          <WhiteContainer>
            <CalorieInfo
              eaten={consumedCalories}
              left={remainingCalories}
              target={targetCalories}
              fontSize={20}
            />
            <BarIndicator
              value={consumedCalories}
              max={targetCalories}
              colors={colors.primaryGradient}
              size={"100%"}
              strokeWidth={8}
            />
          </WhiteContainer>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  indicatorContainer: {
    width: "90%",
  },
  safeArea: {
    backgroundColor: colors.page,
    height: "100%",
    width: screenWidth,
    flex: 1,
    alignItems: "center",
  },
  header: {
    width: "100%",
  },
});
