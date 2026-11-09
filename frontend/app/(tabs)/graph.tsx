import {
  Alert,
  Dimensions,
  Image,
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
import { DiaryDaySession, Entry, WeekAnalytics } from "../../lib/types";
import { getDiaryDay } from "../../services/diary";
import { useFocusEffect, useRouter } from "expo-router";
import BarIndicator from "../../components/BarIndicator";
import colors from "../../styles/colors";
import keys from "../../styles/keys";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import EntryFood from "../../components/EntryFood";
import AddEntry from "../../components/AddEntry";
import { getWeek } from "../../services/analytics";
import ImageCard from "../../components/ImageCard";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function Graph() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<Date>();
  const [weekAnalytics, setWeekAnalytics] = useState<WeekAnalytics>();
  const [errorMsg, setErrorMsg] = useState<string>();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [weekAverage, setWeekAverage] = useState<number>();
  const [daysOnTarget, setDaysOnTarget] = useState<number>();



  const handleAverage = (week: WeekAnalytics) => {
    const days : number[] = week?.days ? week.days.map((d)=> d.calories) : [];
    const weekAverage = days.length ? Math.round(days.reduce((sum, d) => sum + d, 0)/7) : 0 ;
    const daysOnTarget = days.filter(d => d > week.target_calories).length;

    setWeekAverage(weekAverage);
    setDaysOnTarget(daysOnTarget);

  }

  const fetchWeek = async (dateStr: string) => {
    try {
      const result = await getWeek(dateStr);
      setWeekAnalytics(result);
      setCurrentWeekStartDate(new Date(result.week_start));
      handleAverage(result);
      setErrorMsg("");
    } catch (error: any) {
      setErrorMsg(`${error.code} ${error.message}`);
    }
  };

  useEffect(() => {
      fetchWeek(getDate(currentDate));
    }, [currentDate]);

  const handlePrevWeek = () => {
    setCurrentDate((prev) => {
      const nextDate = new Date(prev);
      nextDate.setDate(nextDate.getDate() - 7);
      return nextDate;
    });
  };

  const handleNextWeek = () => {
    if (isToday) return;
    setCurrentDate((prev) => {
      const nextDate = new Date(prev);
      nextDate.setDate(nextDate.getDate() + 7);
      return nextDate;
    });
  };

  const isToday = getDate(currentDate) === getDate(new Date());
  const formattedDate =
    currentWeekStartDate && weekAnalytics?.week_end
      ? `${currentWeekStartDate.toLocaleDateString("en-GB", { day: "numeric" })} - ${new Date(weekAnalytics.week_end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : shortDatetime(currentDate);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Weekly intake</Text>
          <View style={styles.dateSelector}>
            <TouchableOpacity
              onPress={handlePrevWeek}
              style={styles.chevronButton}
              activeOpacity={0.7}
              accessibilityLabel="Previous day"
            >
              <Feather name="chevron-left" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNextWeek}
              style={styles.chevronButton}
              activeOpacity={0.7}
              accessibilityLabel="Next day"
              disabled={isToday}
            >
              <Feather
                name="chevron-right"
                size={20}
                color={isToday ? colors.inactive : colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        <View style={styles.header}>
          <WhiteContainer width={"48%"}>
            <Image
              style={styles.image}
              source={require("../../assets/bar-graph.png")}
              resizeMode="contain"
            />
            <Text style={styles.mainText}>{weekAverage} kcal</Text>
            <Text style={styles.subText}>Weekly average</Text>
          </WhiteContainer>
          <WhiteContainer width={"48%"}>
            <Image
              style={styles.image}
              source={require("../../assets/target.png")}
              resizeMode="contain"
            />
            <Text style={styles.mainText}>{daysOnTarget} of 6</Text>
            <Text style={styles.subText}>Days on target</Text>
          </WhiteContainer>
        </View>
          <ImageCard
            picLink={require("../../assets/login-banner.png")}
            width={"90%"}
            title="Calories only"
            sub="No macro tracking"
          />
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
    flexDirection: "row",
    justifyContent: "space-between",
  },
  indicatorContainer: {
    width: "90%",
    flex: 1,
    paddingBottom: 65,
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
    backgroundColor: colors.textWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans-Bold",
    color: colors.text,
    alignSelf: "center",
  },
  infoText: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans-Regular",
    color: colors.textMuted,
  },
  scrollView: {
    marginTop: -10,
    paddingRight: 5,
  },
  listCard: {
    flex: 1,
  },
  errorText: {
    color: colors.danger,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  date: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Bold",
    margin: 20,
  },
  image: {
    height: 20,
    width: 20,
    alignSelf: "center",
  },
  mainText: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
    alignSelf: "center",
    margin: 5,
  },
  subText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Regular",
    alignSelf: "center",
  },
});
