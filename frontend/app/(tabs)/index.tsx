import { Text, View, StyleSheet, Dimensions, Image } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import colors from "../../styles/colors";
import { useEffect, useState } from "react";
import { getGreeting, prettierDatetime } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import WhiteContainer from "../../components/WhiteContainer";
import CircleIndicator from "../../components/CircleIndicator";
import CalorieInfo from "../../components/CalorieInfo";
const screenWidth = Dimensions.get("window").width;

export default function Home() {
  const { user, profile } = useAuth();
  const [prettyDt, setPrettyDt] = useState(prettierDatetime());
  const [greeting, setGreeting] = useState(getGreeting());

  const targetCalorie = Number(profile?.tdee) ?? 0;

  useEffect(() => {
    let secTimer = setInterval(() => {
      setGreeting(getGreeting());
      setPrettyDt(prettierDatetime());
    }, 60000);
    return () => clearInterval(secTimer);
  }, []);

  const greetings = new Map<string, string>([
    ["12:00", "Good morning"],
    ["16:00", "Good afternoon"],
    ["19:00", "Good evening"],
    ["00:00", "Good night"],
  ]);

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
        <View>
          <WhiteContainer width={"95%"}>
            <View>
              <CircleIndicator max={targetCalorie} value={1000} />
              <CalorieInfo />
            </View>
          </WhiteContainer>
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
  logo: {
    resizeMode: "contain",
    width: 60,
    height: 60,
    marginRight: 10,
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
  btnContainer: {
    width: "100%",
    marginTop: 20,
  },
  gradient: {
    flex: 1,
  },
  imageContainer: {
    width: screenWidth,
    marginTop: 10,
    height: 80,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
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
    marginTop: 0,
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
