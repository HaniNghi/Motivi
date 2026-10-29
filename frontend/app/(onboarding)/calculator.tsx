import {
  Dimensions,
  ScrollView,
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
import { ActiveLevel, ApiError, CreateUser, Gender, Goal } from "../../lib/types";
import { useRouter } from "expo-router";
import WhiteContainer from "../../components/WhiteContainer";
import SmallGradientButton from "../../components/SmallGradientButton";
import IconContentButton from "../../components/IconContentButton";

const screenWidth = Dimensions.get("window").width;
export default function Signup() {
  const router = useRouter();

  const [age, setAge] = useState("");
  const [ageErrorMessage, setAgeErrorMessage] = useState("");

  const [height, setHeight] = useState("");
  const [heightErrorMessage, setHeightErrorMessage] = useState("");

  const [weight, setWeight] = useState("");
  const [weightErrorMessage, setWeightErrorMessage] = useState("");

  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState<ActiveLevel>("sedentary");
  const [goal, setGoal] = useState<Goal>("lose");

  const handleAgeChange = (age: string) => {
    setAge(age);

    if (ageErrorMessage) {
      setAgeErrorMessage("");
    }
  }

  const handleAgeBlur = () => {
    const num = Number(age);

    if (!age.trim()) {
      setHeightErrorMessage("Age cannot be empty.");
    } else if (isNaN(num)) {
      setHeightErrorMessage("Age must be a number.");
    } else if (num < 14 || num > 100 ) {
      setHeightErrorMessage("Age must be between 14 and 100.");
    }
  };

  const handleHeightChange = (height: string) => {
    setHeight(height);

    if (heightErrorMessage) {
      setHeightErrorMessage("");
    }
  }

  const handleHeightBlur = () => {
    const num = Number(height);

    if (!height.trim()) {
      setHeightErrorMessage("Height cannot be empty.");
    } else if (isNaN(num)) {
      setHeightErrorMessage("Height must be a number.");
    } else if (num < 100 || num > 250) {
      setHeightErrorMessage("Height must be between 100 and 250.");
    }
  };

const isAgeValid = (): boolean =>{
    const number = Number(age);

    if (!age || isNaN(number) || number < 14 || number > 100) {
      return false;
    }
    return true;
  }

  const isHeightValid = (): boolean =>{
    const number = Number(height);

    if (!height || isNaN(number) || number < 100 || number > 250) {
      return false;
    }
    return true;
  }

  const isWeightValid = (): boolean =>{
    const number = Number(weight);

    if (!weight || isNaN(number) || number < 30 || number > 300) {
      return false;
    }
    return true;
  }

  const isValid = (): boolean => {
    if(!isAgeValid || !gender || !isHeightValid || !isWeightValid || !activity || !goal) {
      return false;
    }
    return true;
  }

  const handleWeightChange = (weight: string) => {
    setWeight(weight);

    if (weightErrorMessage) {
      setWeightErrorMessage("");
    }
  }

  const handleWeightBlur = () => {
    const num = Number(weight);

    if (!weight.trim()) {
      setWeightErrorMessage("Weight cannot be empty.");
    } else if (isNaN(num)) {
      setWeightErrorMessage("Weight must be a number.");
    } else if (num < 30 || num > 300) {
      setWeightErrorMessage("Weight must be between 30 and 300.");
    }
  }

const handleCalculator = () => {
    handleAgeBlur();
    handleHeightBlur();
    handleWeightBlur();

    if (!isValid) {
      return;
    } else {
      const payloadPostMe = {
        age: age,
        gender: gender,
        height_cm: height,
        weight_cm: weight,
        activity_level: activity,
        goal: goal,
      }
    }
  }


  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.imageContainer}>
          <Text style={styles.welcomeText}>Your daily target</Text>
          <Text style={styles.subText}>
            We'll set your calorie goal based on this
          </Text>
        </View>
        <ScrollView>
          <View style={styles.contentContainer}>
            <WhiteContainer title="PERSONAL INFO" width="90%">
              <View style={styles.form}>
                <View style={styles.input}>
                  <Text style={styles.inputLabel}>Age</Text>
                  <TextInput
                    style={styles.inputControl}
                    placeholder="24"
                    placeholderTextColor={colors.textSoft}
                    value={age}
                    onChangeText={(value) => handleAgeChange(value)}
                    onBlur={handleAgeBlur}
                  />
                  {ageErrorMessage ? (
                        <Text style={styles.errorText}>{ageErrorMessage}</Text>
                      ) : null}
                </View>
                <View style={styles.input}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <View style={styles.inputBoxRow}>
                    <SmallGradientButton
                      text="Female"
                      width="48%"
                      height={40}
                      borderRadius={12}
                      clicked={gender === "female"}
                      onPress={() => setGender("female")}
                    />
                    <SmallGradientButton
                      text="Male"
                      width="48%"
                      height={40}
                      borderRadius={12}
                      clicked={gender === "male"}
                      onPress={() => setGender("male")}
                    />
                  </View>
                </View>
                <View style={styles.input}>
                  <View style={styles.inputBoxRow}>
                    <View style={styles.inRow}>
                      <Text style={[styles.inputLabel, { marginLeft: 5 }]}>
                        Height(cm)
                      </Text>
                      <TextInput
                        style={styles.inputControl}
                        placeholder="162"
                        placeholderTextColor={colors.textSoft}
                        value={height}
                        onChangeText={(value) =>handleHeightChange(value)}
                        onBlur={handleHeightBlur}
                        keyboardType="numeric"
                      />
                      {heightErrorMessage ? (
                        <Text style={styles.errorText}>{heightErrorMessage}</Text>
                      ) : null}
                    </View>
                    <View style={styles.inRow}>
                      <Text style={[styles.inputLabel, { marginLeft: 5 }]}>
                        Weight(kg)
                      </Text>
                      <TextInput
                        style={styles.inputControl}
                        placeholder="60"
                        placeholderTextColor={colors.textSoft}
                        value={weight}
                        onChangeText={(value) =>handleWeightChange(value)}
                        onBlur={handleWeightBlur}
                        keyboardType="numeric"
                      />
                      {weightErrorMessage ? (
                        <Text style={styles.errorText}>{weightErrorMessage}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
            </WhiteContainer>
            <WhiteContainer title="ACTIVITY LEVEL" width="90%">
              <View style={styles.activityRow}>
                <SmallGradientButton
                  text="Sedentary"
                  width={100}
                  height={30}
                  clicked={activity === "sedentary"}
                  onPress={() => setActivity("sedentary")}
                />
                <SmallGradientButton
                  text="Light"
                  width={70}
                  height={30}
                  clicked={activity === "light"}
                  onPress={() => setActivity("light")}
                />
                <SmallGradientButton
                  text="Moderate"
                  width={90}
                  height={30}
                  clicked={activity === "moderate"}
                  onPress={() => setActivity("moderate")}
                />
                <SmallGradientButton
                  text="Active"
                  width={80}
                  height={30}
                  clicked={activity === "active"}
                  onPress={() => setActivity("active")}
                />
                <SmallGradientButton
                  text="Very active"
                  width={100}
                  height={30}
                  clicked={activity === "very_active"}
                  onPress={() => setActivity("very_active")}
                />
              </View>
            </WhiteContainer>
            <WhiteContainer title="GOAL" width="90%">
              <View style={styles.form}>
                <IconContentButton
                  mainTitle="Lose weight"
                  subTitle="Calorie deficit"
                  icon="trending-down"
                  clicked={goal === "lose"}
                  onPress={() => setGoal("lose")}
                />
                <IconContentButton
                  mainTitle="Maintain weight"
                  subTitle="Stay balance"
                  icon="barbell"
                  clicked={goal === "maintain"}
                  onPress={() => setGoal("maintain")}
                />
                <IconContentButton
                  mainTitle="Gain weight"
                  subTitle="Calorie surplus"
                  icon="trending-up"
                  clicked={goal === "gain"}
                  onPress={() => setGoal("gain")}
                />
              </View>
            </WhiteContainer>
          </View>
          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={[
                keys.primaryButton,
                { alignSelf: "center", width: "90%" },
              ]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.primaryGradient}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={keys.primaryButtonText}>Calculate my target</Text>
            </TouchableOpacity>
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
  input: {
    alignItems: "center",
  },
  inputBoxRow: {
    flex: 1,
    flexDirection: "row",
    width: "95%",
    justifyContent: "space-between",
  },
  activityRow: {
    flex: 1,
    flexDirection: "row",
    width: "95%",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingTop: 10,
    alignContent: "space-between",
  },
  inputLabel: {
    alignSelf: "flex-start",
    fontFamily: "PlusJakartaSans-Medium",
    marginTop: 15,
    margin: 10,
    fontSize: 14,
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
    fontSize: 12,
  },
  inRow: {
    width: "50%",
  },
  form: {
    alignSelf: "center",
    width: "100%",
    paddingBottom: 5,
  },
  btnContainer: {
    width: "100%",
    marginTop: 20,
  },
  gradient: {
    flex: 1,
  },
  imageContainer: {
    width: screenWidth,
    backgroundColor: colors.page,
    marginLeft: 20,
    marginTop: 20,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
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
  signupText: {
    alignItems: "center",
  },
  signupLinkText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: "PlusJakartaSans-Regular",
  },
  signupBoldText: {
    color: colors.buttonPrimaryStart,
    fontFamily: "PlusJakartaSans-Bold",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    backgroundColor: colors.page,
    marginTop: 10,
    paddingTop: 0,
  },
  icon: {
    position: "absolute",
    right: 16,
  },
  passwordContainer: {
    width: "100%",
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  errorText: {
    color: colors.danger,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
});
