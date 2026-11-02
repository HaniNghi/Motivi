import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import colors from "../styles/colors";
import keys from "../styles/keys";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import CircleResult from "../components/CircleResult";
import SmallWhiteCard from "../components/SmallWhiteCard";

const screenWidth = Dimensions.get("window").width;
export default function Signup() {
  const router = useRouter();

  const { profile } = useAuth();

  const handleGoToHome = async () => {
    router.replace("/(tabs)");
  };

  const handleRecalculate = async () => {
    router.push("/(onboarding)/calculator")
  }

  const activityLevels = new Map<string, string>([
    ["sedentary", "sedentary"],
    ["light", "light"],
    ["moderate", "moderate"],
    ["active", "active"],
    ["very_active", "very active"],
  ]);

  const goal = profile?.goal ?? "";
  const activity = profile?.activity_level
    ? activityLevels.get(profile.activity_level)
    : "";
  const tdee: number = profile?.tdee ?? 0;
  const age = profile?.age ? profile?.age.toString(): "";
  const gender = profile?.gender === 'female' ? "Female": "Male";
  const height = profile?.height_cm ? profile?.height_cm.toString(): "";
  const weight = profile?.weight_kg ? profile?.weight_kg.toString(): "";


  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.leadText}>YOUR DAILY CALORIE NEED</Text>
          <CircleResult calorie={tdee}></CircleResult>
          <Text style={styles.subText1}>
            To <Text style={{fontFamily: "PlusJakartaSans-Bold"}}>{goal}</Text> weight at a {activity} activity level.
          </Text>
          <View style={styles.cardContainer}>
            <SmallWhiteCard main={`${age} yrs`} sub="Age"/>
            <SmallWhiteCard main={gender} sub="Gender"/>
            <SmallWhiteCard main={`${height} cm`} sub="Height"/>
            <SmallWhiteCard main={`${weight} kg`} sub="Weight"/>
          </View>
        </View>

        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={[keys.primaryButton, { alignSelf: "center", width: "90%" }]}
            activeOpacity={0.8}
            onPress={handleGoToHome}
          >
            <LinearGradient
              colors={colors.primaryGradient}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={keys.primaryButtonText}>Continue To Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignSelf: "center", width: "90%"}} onPress={handleRecalculate}>
            <Text style={[styles.subText2, {alignSelf: "center"}]}>Recalculate</Text>
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
  },
  
  btnContainer: {
    width: "100%",
    marginTop: 20,
    paddingBottom: 20,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  cardContainer: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  leadText: {
    fontSize: 14,
    fontWeight: 400,
    color: colors.textSoft,
    marginBottom: 16,
    fontFamily: "PlusJakartaSans-Bold",
  },
  subText1: {
    fontSize: 15,
    fontWeight: 400,
    color: colors.textMuted,
    marginTop: 10,
    fontFamily: "PlusJakartaSans-Regular",
  },
  subText2: {
    fontSize: 14,
    fontWeight: 400,
    color: colors.textMuted,
    marginTop: 10,
    fontFamily: "PlusJakartaSans-Regular",
  },
 
});
