import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import WhiteContainer from "../../components/WhiteContainer";
import { useEffect, useState } from "react";
import { User } from "../../lib/types";
import { getUser } from "../../lib/storage";
import colors from "../../styles/colors";
import { useAuth } from "../../context/AuthContext";
import { router, useRouter } from "expo-router";
import RowImageContent from "../../components/RowImageContent";
import CardImageContainer from "../../components/CardImageContainer";

const screenWidth = Dimensions.get("window").width;

export default function Profile() {
  const router = useRouter();
  const { user, profile, logout } = useAuth();

  const genders = new Map<string,string> ([
    ["female", "Female"],
    ["male", "Male"]
  ])

  const goals = new Map<string,string> ([
    ["lose", "Lose weight"],
    ["gain", "Gain weight"],
    ["maintain", "Maintain"],
  ])

  const activityLevels = new Map<string,string> ([
    ["sedentary", "Sedentary"],
    ["light", "Light"],
    ["moderate", "Moderate"],
    ["active", "Active"],
    ["very_active", "Very active"],
  ])

  const handleEditPlan = async () => {
    router.push("/(onboarding)/calculator");
  };

  const handleLogout = async () => {
    await logout();
    router.dismissTo("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contentContainer}>
        <WhiteContainer width="90%">
          <Text style={styles.mainText}>
            {user?.display_name ?? "Emty name"}
          </Text>
          <Text style={styles.subText}>{user?.email ?? "empty email"}</Text>
        </WhiteContainer>
        <WhiteContainer
          title="Your plan"
          width="90%"
          titleColor={colors.text}
          button={true}
          buttonTitle="Edit plan"
          onPress={handleEditPlan}
        >
          <RowImageContent
            picLink={require("../../assets/fire.png")}
            first="Daily target"
            second={`${profile?.tdee.toString()} kcal`}
          />
          <RowImageContent
            picLink={require("../../assets/target.png")}
            first="Goal"
            second={`${profile?.goal ? goals.get(profile?.goal): ""}`}
          />
          <RowImageContent
            picLink={require("../../assets/training.png")}
            first="Activity"
            second={profile?.activity_level ? activityLevels.get(profile?.activity_level) : ""}
          />
        </WhiteContainer>
        <WhiteContainer
          title="Personal details"
          width="90%"
          titleColor={colors.text}
        >
          <View style={{flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center'}}>
            <CardImageContainer
              picLink={require("../../assets/age-range.png")}
              firstText={`${profile?.age ?? ""} years`}
              secondText="Age"
              width="45%"
            />
            <CardImageContainer
              picLink={require("../../assets/gender-fluid.png")}
              firstText={`${profile?.gender ? genders.get(profile?.gender): null}`}
              secondText="Gender"
              width="45%"
            />
            <CardImageContainer
              picLink={require("../../assets/ruler.png")}
              firstText={`${profile?.height_cm ?? ""} cm`}
              secondText="Height"
              width="45%"
            />
            <CardImageContainer
              picLink={require("../../assets/weighing-scale.png")}
              firstText={`${profile?.weight_cm ?? ""} kg`}
              secondText="Weight"
              width="45%"
            />
          </View>
        </WhiteContainer>

        <View style={styles.criticalBtn}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.criticalText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.page,
    height: "100%",
    width: screenWidth,
    flex: 1,
  },
  mainText: {
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.8,
    fontFamily: "PlusJakartaSans-ExtraBold",
  },
  subText: {
    fontSize: 12,
    fontWeight: 400,
    color: colors.textMuted,
    marginTop: 10,
    fontFamily: "PlusJakartaSans-Regular",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 5,
    backgroundColor: colors.page,
    paddingTop: 0,
  },
  criticalBtn: {
    width: "90%",
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.redTint,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.redTint2,
    margin: 20,
  },
  criticalText: {
    color: colors.danger,
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
  },
});
