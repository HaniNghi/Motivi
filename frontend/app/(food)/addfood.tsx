import {
  ActivityIndicator,
  Alert,
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
import {
  DiaryDaySession,
  Entry,
  EntryPayload,
  Food,
  SearchedFood,
} from "../../lib/types";
import { getDiaryDay, postEntry } from "../../services/diary";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import colors from "../../styles/colors";
import EntryFood from "../../components/EntryFood";
import AddEntry from "../../components/AddEntry";
import { get_saved_food, getFoods } from "../../services/food";

export default function AddFood() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const [today, setToday] = useState<Date>(new Date());
  const [searchedFoods, setSearchedFoods] = useState<Food[]>();
  const [inputFood, setInputFood] = useState<string>();
  const [errorMsg, setErrorMsg] = useState<string>();
  const [clickedFood, setClickedFood] = useState<Food>();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");

  const foods = searchedFoods ?? [];

  const fetchSearchedFoods = useCallback(
    async (input: string, limit: number) => {
      if (!limit) {
        limit = 20;
      }
      setIsLoading(true);
      setErrorMsg(undefined);
      try {
        const result = await getFoods(input, limit);
        setSearchedFoods(result.foods);
      } catch (error: any) {
        setErrorMsg(`${error.code} ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchSavedFoods = async () => {
    setIsLoading(true);
    setErrorMsg(undefined);
    try {
      const result = await get_saved_food();
      if (result.length < 1) {
        setErrorMsg("No saved foods");
      }
      setSearchedFoods(result);
    } catch (error: any) {
      setErrorMsg(`${error.code} ${error.message}`);
    } finally {
      setIsLoading(false);
      setInputFood("");
    }
  };

  useEffect(() => {
    if (activeTab !== "all") return;
    const trimmed = (inputFood ?? "").trim();
    if (!trimmed) {
      fetchSearchedFoods("", 20);
      return;
    }
    if (trimmed.length < 3) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchSearchedFoods(trimmed, 50);
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [inputFood, fetchSearchedFoods]);

  const addEntry = async (amountG: number, food: Food) => {
    if (!amountG || !food || amountG <= 0) return;
    if (!date) return;

    const payload: EntryPayload = {
      food_id: food.id,
      date: date,
      amount_g: amountG,
    };

    try {
      await postEntry(payload);
    } catch (error: any) {
      Alert.alert("Failed to add a food", error.message);
    }
  };
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
            <TouchableOpacity
              style={[
                styles.backButton,
                activeTab === "all" && { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.7}
              onPress={() => {
                setErrorMsg(undefined);
                setActiveTab("all");
                fetchSearchedFoods((inputFood ?? "").trim(), 20);
              }}
            >
              <Text
                style={[
                  styles.backButtonText,
                  activeTab === "all" && { color: colors.textWhite },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.backButton,
                activeTab === "saved" && { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.7}
              onPress={() => {
                setErrorMsg(undefined);
                setActiveTab("saved");
                fetchSavedFoods();
              }}
            >
              <Text
                style={[
                  styles.backButtonText,
                  activeTab === "saved" && { color: colors.textWhite },
                ]}
              >
                Saved
              </Text>
            </TouchableOpacity>
          </View>
        </WhiteContainer>

        <View style={styles.indicatorContainer}>
          <WhiteContainer style={styles.listCard}>
            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {errorMsg ? (
                  <Text style={styles.infoText}>{errorMsg}</Text>
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
                      addButton={true}
                      onPress={() => {
                        setAddModalVisible(true);
                        setClickedFood(food);
                      }}
                    />
                  ))
                )}
              </ScrollView>
            )}
          </WhiteContainer>
        </View>
        <Text style={styles.sourceText}>Data from OpenFoodFacts</Text>

        <TouchableOpacity
          style={styles.createCustomButton}
          activeOpacity={0.8}
          onPress={() => router.push("/(food)/customfood")}
        >
          <Text style={styles.backButtonText}>+ Create custom food</Text>
        </TouchableOpacity>
        {clickedFood && (
          <AddEntry
            modalVisible={addModalVisible}
            food={clickedFood}
            onClose={() => setAddModalVisible(false)}
            onAdd={(amountG, food) => addEntry(amountG, food)}
          />
        )}
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
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  sourceText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Regular",
    color: colors.textMuted,
    alignSelf: "flex-end",
    marginRight: 20,
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
