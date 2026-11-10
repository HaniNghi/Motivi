import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import CalorieInfo from "../../components/CalorieInfo";
import CircleIndicator from "../../components/CircleIndicator";
import WhiteContainer from "../../components/WhiteContainer";
import { useAuth } from "../../context/AuthContext";
import { DiaryDaySession, WeekAnalytics } from "../../lib/types";
import { getDate, getGreeting, prettierDatetime } from "../../lib/utils";
import { getDiaryDay } from "../../services/diary";
import colors from "../../styles/colors";
import BarIndicator from "../../components/BarIndicator";
import SquareCard from "../../components/SquareCard";
import ImageCard from "../../components/ImageCard";
import Chart from "../../components/Chart";
import { getWeek } from "../../services/analytics";
const screenWidth = Dimensions.get("window").width;

export default function Home() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [date, setDate] = useState(getDate());
  const [prettyDt, setPrettyDt] = useState(prettierDatetime());
  const [greeting, setGreeting] = useState(getGreeting());
  const [diaryDay, setDiaryDay] = useState<DiaryDaySession>();
  const [errorMsg, setErrorMsg] = useState<string>();
  const [weekAnalytics, setWeekAnalytics] = useState<WeekAnalytics>();

  const targetCalories = diaryDay?.target.calories ?? 0;
  const consumedCalories = diaryDay?.consumed.calories ?? 0;
  const remainingCalories = diaryDay?.remaining.calories ?? 0;

  const targetProtein = diaryDay?.target.protein_g ?? 0;
  const consumedProtein = diaryDay?.consumed.protein_g ?? 0;
  const remainingProtein = diaryDay?.remaining.protein_g ?? 0;

  const targetCarbs = diaryDay?.target.carbs_g ?? 0;
  const consumedCarbs = diaryDay?.consumed.carbs_g ?? 0;
  const remainingCarbs = diaryDay?.remaining.carbs_g ?? 0;

  const targetFat = diaryDay?.target.fat_g ?? 0;
  const consumedFat = diaryDay?.consumed.fat_g ?? 0;
  const remainingFat = diaryDay?.remaining.fat_g ?? 0;

  const fetchDiaryDay = async () => {
    try {
      const result = await getDiaryDay(date);
      setDiaryDay(result);
    } catch (error: any) {
      setErrorMsg(`${error.code} ${error.message}`);
    }
  };

  const fetchWeek = useCallback(async (dateStr: string) => {
    try {
      const result = await getWeek(dateStr);
      setWeekAnalytics(result);
      setErrorMsg("");
    } catch (error: any) {
      setErrorMsg(`${error.code} ${error.message}`);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWeek(getDate(new Date(date)));
    }, [date, fetchWeek]),
  );

  useEffect(() => {
    let secTimer = setInterval(() => {
      setGreeting(getGreeting());
      setPrettyDt(prettierDatetime());
      setDate(getDate());
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
        <View style={styles.imageContainer}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              {greeting}, {user?.display_name}👋
            </Text>
            <Text style={styles.subText}>{prettyDt}</Text>
          </View>
          <Image
            style={styles.logo}
            source={require("../../assets/logo.png")}
          />
        </View>
        <ScrollView style={{ alignSelf: "center", marginTop: -15 }}>
          <WhiteContainer width={"95%"}>
            <View style={styles.inRow}>
              <View>
                <CircleIndicator
                  max={targetCalories}
                  value={consumedCalories}
                />
                <CalorieInfo
                  target={targetCalories}
                  left={remainingCalories}
                  eaten={consumedCalories}
                  fontSize={14}
                />
              </View>
              <View style={styles.line} />
              <View style={{ justifyContent: "center" }}>
                <Text style={styles.macroText}>MACRONUTRIENTS</Text>
                <BarIndicator
                  text="Protein"
                  max={targetProtein}
                  value={consumedProtein}
                  colors={colors.proteinGradient}
                />
                <BarIndicator
                  text="Carbs"
                  max={targetCarbs}
                  value={consumedCarbs}
                  colors={colors.carbsGradient}
                />
                <BarIndicator
                  text="Fats"
                  max={targetFat}
                  value={consumedFat}
                  colors={colors.fatsGradient}
                />
              </View>
            </View>
          </WhiteContainer>
          <Text style={styles.header}>Quick actions</Text>
          <View style={[styles.inRow, { justifyContent: "space-between" }]}>
            <SquareCard
              main="Add food"
              sub="Log a meal"
              colors={colors.primaryGradient}
              picLink={require("../../assets/fire.png")}
              onPress={() => {
                router.push("/diary");
              }}
            />
            <SquareCard
              main="Diary"
              sub="Today's log"
              colors={colors.diaryGradient}
              picLink={require("../../assets/fire.png")}
              onPress={() => {
                router.push("/diary");
              }}
            />
            <SquareCard
              main="Weekly"
              sub="See progress"
              colors={colors.weeklyGradient}
              picLink={require("../../assets/fire.png")}
              onPress={() => {
                router.push("/graph");
              }}
            />
          </View>
          <View>
            <WhiteContainer
              title="This week"
              titleColor={colors.text}
              button={true}
              buttonTitle="See all ➜"
              buttonPill={false}
              onPress={() => router.push("/graph")}
            >
              {weekAnalytics && <Chart width={screenWidth*0.8} rawData={weekAnalytics} small={true} />}
            </WhiteContainer>
          </View>
          <View>
            <ImageCard
              picLink={require("../../assets/login-banner.png")}
              width={"100%"}
              title="Recalculate your plan"
              sub="Update your calorie target"
              button={true}
              buttonPill={true}
              buttonTitle="Update ➜"
              onPress={() => router.push("/(onboarding)/calculator")}
            />
          </View>
        </ScrollView>
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
  },
  imageContainer: {
    width: screenWidth,
    marginTop: 10,
    height: 80,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  welcomeContainer: {
    flex: 1,
    marginLeft: 20,
  },
  welcomeText: {
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.5,
    fontFamily: "PlusJakartaSans-ExtraBold",
  },
  subText: {
    fontSize: 14,
    fontWeight: 400,
    color: colors.textMuted,
    marginTop: 5,
    fontFamily: "PlusJakartaSans-Regular",
  },
  logo: {
    resizeMode: "contain",
    width: 60,
    height: 60,
    marginRight: 10,
  },
  inRow: {
    flexDirection: "row",
  },
  line: {
    width: 1,
    height: "80%",
    backgroundColor: colors.page,
    margin: 10,
  },
  macroText: {
    color: colors.textSoft,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  header: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans-SemiBold",
    color: colors.text,
  },
});
