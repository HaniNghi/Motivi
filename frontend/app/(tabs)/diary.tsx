import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WhiteContainer from "../../components/WhiteContainer";
import { useCallback, useEffect, useState } from "react";
import { getDate, shortDatetime } from "../../lib/utils";
import CalorieInfo from "../../components/CalorieInfo";
import { DiaryDaySession } from "../../lib/types";
import { getDiaryDay } from "../../services/diary";
import { useFocusEffect } from "expo-router";
import BarIndicator from "../../components/BarIndicator";
import colors from "../../styles/colors";
import keys from "../../styles/keys";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import EntryFood from "../../components/EntryFood";

const screenWidth = Dimensions.get("window").width;

export default function Diary() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [diaryDay, setDiaryDay] = useState<DiaryDaySession>();
  const [errorMsg, setErrorMsg] = useState<string>();

  const targetCalories = diaryDay?.target.calories ?? 0;
  const consumedCalories = diaryDay?.consumed.calories ?? 0;
  const remainingCalories = diaryDay?.remaining.calories ?? 0;

  const fetchDiaryDay = useCallback(async (dateStr: string) => {
    try {
      const result = await getDiaryDay(dateStr);
      setDiaryDay(result);
    } catch (error: any) {
      setErrorMsg(`${error.code} ${error.message}`);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDiaryDay(getDate(currentDate));
    }, [currentDate, fetchDiaryDay]),
  );

  const handlePrevDay = () => {
    setCurrentDate((prev) => {
      const nextDate = new Date(prev);
      nextDate.setDate(nextDate.getDate() - 1);
      return nextDate;
    });
  };

  const handleNextDay = () => {
    setCurrentDate((prev) => {
      const nextDate = new Date(prev);
      nextDate.setDate(nextDate.getDate() + 1);
      return nextDate;
    });
  };

  const isToday = getDate(currentDate) === getDate(new Date());
  const formattedDate = isToday
    ? `Today, ${currentDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
    : shortDatetime(currentDate);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <WhiteContainer>
            <View style={styles.dateSelector}>
              <TouchableOpacity
                onPress={handlePrevDay}
                style={styles.chevronButton}
                activeOpacity={0.7}
                accessibilityLabel="Previous day"
              >
                <Feather name="chevron-left" size={20} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCurrentDate(new Date())}
                disabled={isToday}
                activeOpacity={0.7}
              >
                <Text style={styles.dateText}>{formattedDate}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNextDay}
                style={styles.chevronButton}
                activeOpacity={0.7}
                accessibilityLabel="Next day"
              >
                <Feather
                  name="chevron-right"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </WhiteContainer>
        </View>
        <View style={styles.indicatorContainer}>
          <WhiteContainer>
            <View style={{ marginBottom: 10 }}>
              <CalorieInfo
                eaten={consumedCalories}
                left={remainingCalories}
                target={targetCalories}
                fontSize={20}
              />
            </View>
            <BarIndicator
              value={consumedCalories}
              max={targetCalories}
              colors={colors.primaryGradient}
              size={"100%"}
              strokeWidth={8}
            />
          </WhiteContainer>
          <Text>Today's foods</Text>

          <WhiteContainer>
            <ScrollView>
              <EntryFood foodName="Oat" amount={100} calories={400} protein_g={90} carbs_g={70} fat_g={9}/>
            </ScrollView>
          </WhiteContainer>

          <TouchableOpacity
            style={[keys.primaryButton, { alignSelf: "center", width: "100%" }]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.primaryGradient}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={keys.primaryButtonText}>+ Add food</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.page,
    height: "100%",
    width: screenWidth,
    flex: 1,
    alignItems: "center",
  },
  header: {
    width: "90%",
  },
  indicatorContainer: {
    width: "90%",
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chevronButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
    color: colors.text,
  },
});
