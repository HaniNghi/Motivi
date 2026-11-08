import {
  Alert,
  Button,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import colors from "../../styles/colors";
import keys from "../../styles/keys";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { createUser } from "../../services/auth";
import { ApiError, CreateUser, CustomPayload } from "../../lib/types";
import { useRouter } from "expo-router";
import PrimaryButton from "../../components/PrimaryButton";
import { postCustomFood } from "../../services/food";

const screenWidth = Dimensions.get("window").width;
export default function CustomFood() {
  const router = useRouter();
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const [foodnameErrorMessage, setFoodnameErrorMessage] = useState("");
  const [caloriesErrorMessage, setCaloriesErrorMessage] = useState("");
  const [proteinErrorMessage, setProteinErrorMessage] = useState("");
  const [carbsErrorMessage, setCarbsErrorMessage] = useState("");
  const [fatErrorMessage, setFatErrorMessage] = useState("");

  const isValidPositiveNumber = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return false;
    const num = Number(trimmed);
    return !isNaN(num) && num >= 0;
  };

  const handleFoodNameChange = (fullName: string) => {
    setFoodName(fullName);

    if (foodnameErrorMessage) {
      setFoodnameErrorMessage("");
    }
  };

  const handleFoodNameBlur = () => {
    if (!foodName.trim()) {
      setFoodnameErrorMessage("Food name cannot be empty.");
    } else if (foodName.trim().length > 120) {
      setFoodnameErrorMessage("Food name must be at most 120 characters.");
    }
  };

  const handleCaloriesChange = (val: string) => {
    setCalories(val);
    if (caloriesErrorMessage) {
      setCaloriesErrorMessage("");
    }
  };

  const handleCaloriesBlur = () => {
    if (!calories.trim()) {
      setCaloriesErrorMessage("Calories cannot be empty.");
    } else if (!isValidPositiveNumber(calories)) {
      setCaloriesErrorMessage("Calories must be a number 0 or greater.");
    }
  };

  const handleProteinChange = (val: string) => {
    setProtein(val);
    if (proteinErrorMessage) {
      setProteinErrorMessage("");
    }
  };

  const handleProteinBlur = () => {
    if (!protein.trim()) {
      setProteinErrorMessage("Protein cannot be empty.");
    } else if (!isValidPositiveNumber(protein)) {
      setProteinErrorMessage("Protein must be a number 0 or greater.");
    }
  };

  const handleCarbsChange = (val: string) => {
    setCarbs(val);
    if (carbsErrorMessage) {
      setCarbsErrorMessage("");
    }
  };

  const handleCarbsBlur = () => {
    if (!carbs.trim()) {
      setCarbsErrorMessage("Carbohydrates cannot be empty.");
    } else if (!isValidPositiveNumber(carbs)) {
      setCarbsErrorMessage("Carbohydrates must be a number 0 or greater.");
    }
  };

  const handleFatChange = (val: string) => {
    setFat(val);
    if (fatErrorMessage) {
      setFatErrorMessage("");
    }
  };

  const handleFatBlur = () => {
    if (!fat.trim()) {
      setFatErrorMessage("Fat cannot be empty.");
    } else if (!isValidPositiveNumber(fat)) {
      setFatErrorMessage("Fat must be a number 0 or greater.");
    }
  };

  const isValid = (): boolean => {
    if (
      !foodName.trim() ||
      foodName.trim().length > 120 ||
      !isValidPositiveNumber(calories) ||
      !isValidPositiveNumber(protein) ||
      !isValidPositiveNumber(carbs) ||
      !isValidPositiveNumber(fat)
    ) {
      return false;
    } else {
      return true;
    }
  };

  const handleSaveFood = async () => {
    handleFoodNameBlur();
    handleCaloriesBlur();
    handleProteinBlur();
    handleCarbsBlur();
    handleFatBlur();

    if (!isValid()) {
      return;
    } else {
      const customFoodPayload: CustomPayload = {
        name: foodName.trim(),
        calories_per_100g: Number(calories),
        protein_per_100g: Number(protein),
        carbs_per_100g: Number(carbs),
        fat_per_100g: Number(fat),
      };

      try {
        const result = await postCustomFood(customFoodPayload);
        if (result) {
          Alert.alert("Success", "Custom food added");
          router.back();
        }
      } catch (error: any) {
        Alert.alert("Fail to add custom food", error.message);
      }
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.imageContainer}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Custom food</Text>
            <Text style={styles.subText}>
              Saved to your food list next time
            </Text>
          </View>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.form}>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Food name</Text>
              <TextInput
                style={styles.inputControl}
                placeholder="e.g Homemade granola"
                placeholderTextColor={colors.textSoft}
                value={foodName}
                onChangeText={(value) => handleFoodNameChange(value)}
                onBlur={handleFoodNameBlur}
              />
              {foodnameErrorMessage ? (
                <Text style={styles.errorText}>{foodnameErrorMessage}</Text>
              ) : null}
            </View>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Calories(kcal)</Text>
              <TextInput
                style={styles.inputControl}
                placeholder="e.g. 250"
                placeholderTextColor={colors.textSoft}
                keyboardType="numeric"
                value={calories}
                onChangeText={(value) => handleCaloriesChange(value)}
                onBlur={handleCaloriesBlur}
              />
              {caloriesErrorMessage ? (
                <Text style={styles.errorText}>{caloriesErrorMessage}</Text>
              ) : null}
            </View>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Protein(g)</Text>
              <TextInput
                style={styles.inputControl}
                placeholder="e.g. 10"
                placeholderTextColor={colors.textSoft}
                keyboardType="numeric"
                value={protein}
                onChangeText={(value) => handleProteinChange(value)}
                onBlur={handleProteinBlur}
              />
              {proteinErrorMessage ? (
                <Text style={styles.errorText}>{proteinErrorMessage}</Text>
              ) : null}
            </View>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Carbohydrates(g)</Text>
              <TextInput
                style={styles.inputControl}
                placeholder="e.g. 30"
                placeholderTextColor={colors.textSoft}
                keyboardType="numeric"
                value={carbs}
                onChangeText={(value) => handleCarbsChange(value)}
                onBlur={handleCarbsBlur}
              />
              {carbsErrorMessage ? (
                <Text style={styles.errorText}>{carbsErrorMessage}</Text>
              ) : null}
            </View>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Fat(g)</Text>
              <TextInput
                style={styles.inputControl}
                placeholder="e.g. 8"
                placeholderTextColor={colors.textSoft}
                keyboardType="numeric"
                value={fat}
                onChangeText={(value) => handleFatChange(value)}
                onBlur={handleFatBlur}
              />
              {fatErrorMessage ? (
                <Text style={styles.errorText}>{fatErrorMessage}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.container}>
            <PrimaryButton
              text="Cancel"
              width={"45%"}
              height={40}
              textSize={14}
              onPress={() => router.back()}
              primary={false}
            />
            <PrimaryButton
              text="Save food"
              width={"45%"}
              height={40}
              textSize={14}
              onPress={handleSaveFood}
              primary={true}
            />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.page,
    width: screenWidth,
    flex: 1,
  },
  input: {
    alignItems: "center",
  },
  inputLabel: {
    alignSelf: "flex-start",
    fontFamily: "PlusJakartaSans-Medium",
    marginTop: 15,
    margin: 10,
    fontSize: 15,
  },
  inputControl: {
    fontFamily: "PlusJakartaSans-Regular",
    alignSelf: "center",
    width: "95%",
    height: 52,
    backgroundColor: colors.buttonSecondary,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
  },
  form: {
    alignSelf: "center",
    width: "95%",
    paddingTop: 10,
    paddingBottom: 16,
  },
  imageContainer: {
    width: screenWidth,
    height: 80,
    backgroundColor: colors.page,
  },
  welcomeContainer: {
    left: 20,
  },
  welcomeText: {
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.8,
    fontFamily: "PlusJakartaSans-ExtraBold",
  },
  subText: {
    fontSize: 14,
    fontWeight: 400,
    color: colors.textMuted,
    marginTop: 10,
    fontFamily: "PlusJakartaSans-Regular",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    backgroundColor: colors.page,
    marginTop: 0,
    paddingTop: 0,
  },
  errorText: {
    color: colors.danger,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  container: {
    width: "95%",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "space-around",
  },
});
