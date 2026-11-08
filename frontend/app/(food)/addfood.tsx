import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WhiteContainer from "../../components/WhiteContainer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDate, shortDatetime } from "../../lib/utils";
import { DiaryDaySession, Entry, Food, SearchedFood } from "../../lib/types";
import { getDiaryDay } from "../../services/diary";
import { useFocusEffect, useRouter } from "expo-router";
import colors from "../../styles/colors";
import EntryFood from "../../components/EntryFood";
import AddEntry from "../../components/AddEntry";
import { getFoods } from "../../services/food";

export default function AddFood() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchedFoods, setSearchedFoods] = useState<Food[]>();
  const [inputFood, setInputFood] = useState<string>();
  const [errorMsg, setErrorMsg] = useState<string>();
  const [addModalVisible, setAddModalVisible] = useState(false);

  const foods = searchedFoods ?? [];

  const fetchSearchedFoods = useCallback(
    async (input: string, limit: number) => {
      if (!limit) {
        limit = 20;
      }
      try {
        const result = await getFoods(input, limit);
        setSearchedFoods(result.foods);
      } catch (error: any) {
        setErrorMsg(`${error.code} ${error.message}`);
      }
    },
    [],
  );

  useEffect(() => {
    const trimmed = (inputFood ?? "").trim();
    if (!trimmed) {
      fetchSearchedFoods("", 20);
      return;
    }
    if (trimmed.length < 3) return;

    const delayDebounceFn = setTimeout(() => {
      fetchSearchedFoods(trimmed, 50);
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [inputFood, fetchSearchedFoods]);


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
        <WhiteContainer
          title="Add food"
          titleColor={colors.text}
          titleFontsize={18}
          button={true}
          buttonPill={true}
          buttonTitle="Done"
          width={"100%"}
          style={styles.topContainer}
          onPress={() => router.back()}
        >
          <View style={styles.textInputContainer}>
            <TextInput
              placeholder="Search foods"
              value={inputFood}
              onChangeText={(value) => setInputFood(value)}
            />
          </View>
          <View style={styles.options}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
              <Text style={styles.backButtonText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
              <Text style={styles.backButtonText}>Saved</Text>
            </TouchableOpacity>
          </View>
        </WhiteContainer>

        <View style={styles.indicatorContainer}>
          <WhiteContainer style={styles.listCard}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {foods.length === 0 ? (
                <Text style={styles.infoText}>No food</Text>
              ) : (
                foods.map((food) => (
                  <EntryFood
                    key={food.id}
                    foodName={food.name}
                    amount={100}
                    calories={food.calories_per_100g}
                    protein_g={food.protein_per_100g}
                    carbs_g={food.carbs_per_100g}
                    fat_g={food.fat_per_100g}
                    picLink={food.image_url}
                  />
                ))
              )}
            </ScrollView>
          </WhiteContainer>
        </View>

        <TouchableOpacity
          style={styles.createCustomButton}
          activeOpacity={0.8}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.backButtonText}>+ Create custom food</Text>
        </TouchableOpacity>
        <AddEntry
          modalVisible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.page,
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  topContainer: {
    maxWidth: 600,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  textInputContainer: {
    minHeight: 40,
    width: "95%",
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.page,
    borderRadius: 10,
    alignSelf: "center",
  },
  indicatorContainer: {
    width: "90%",
    maxWidth: 600,
    flex: 1,
  },
  listCard: {
    flex: 1,
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
  infoText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Regular",
    color: colors.textMuted,
  },
  scrollView: {
    flex: 1,
    paddingRight: 5,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  backButton: {
    height: 28,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
    marginLeft: 5,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Bold",
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
    width: "95%",
    alignSelf: "center",
  },
  createCustomButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
