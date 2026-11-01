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

const screenWidth = Dimensions.get("window").width;
export default function Signup() {
  const router = useRouter();

  const { profile } = useAuth(); 



const handleGoToHome = async () => {
    router.replace("/(tabs)")
  }


  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
          <Text>{profile?.tdee}</Text>
          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={[
                keys.primaryButton,
                { alignSelf: "center", width: "90%" },
              ]}
              activeOpacity={0.8}
              onPress={handleGoToHome}
            >
              <LinearGradient
                colors={colors.primaryGradient}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={keys.primaryButtonText}>Continue</Text>
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
