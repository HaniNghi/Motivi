import {
  Alert,
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
import { loginUser } from "../../services/auth";
import { LoginUser } from "../../lib/types";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

const screenWidth = Dimensions.get("window").width;
export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);

  const [emailErrorMessage, setEmailErrorMessge] = useState("");
  const [pwErrorMessage, setPwErrorMessage] = useState("");

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailChange = (email: string) => {
    setEmail(email);
    if (emailErrorMessage) {
      setEmailErrorMessge("");
    }
  };

  const handleEmailBlur = () => {
    if (!email.trim()) {
      setEmailErrorMessge("Email cannot be empty.");
    } else if (!EMAIL_REGEX.test(email.trim())) {
      setEmailErrorMessge("Please enter a valid email address.");
    }
  };

  const handlePwChange = (pw: string) => {
    setPassword(pw);
    if (pwErrorMessage) {
      setPwErrorMessage("");
    }
  };
  const handlePwBlur = () => {
    if (!password.trim()) {
      setPwErrorMessage("Password cannot be empty.");
    } else if (password.trim().length < 8) {
      setPwErrorMessage("Password must be at least 8 characters.");
    }
  };
  
  const isValid = (): boolean => {
    if (!email.trim() || !EMAIL_REGEX.test(email.trim()) || password.trim().length < 8) {
      return false;
    } else return true;
  }
  
  const handleLogin = async () => {
    handleEmailBlur();
    handlePwBlur();

    if (!isValid()) {
      return;
    } else {
      const payload: LoginUser = {
        email: email,
        password: password
      }
      try {
        const result = await loginUser(payload)
        Alert.alert("Success", "Login successfully");
        await login(result);
      } catch (error: any) {
        Alert.alert("Fail to login", error.message)
      }

    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require("../../assets/login-banner.png")}
          />
          <LinearGradient
            colors={[colors.heroOverlay, colors.page]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.subText}>Continue your calorie diary.</Text>
          </View>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.form}>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.inputControl}
                placeholder="example@gmail.com"
                placeholderTextColor={colors.textSoft}
                value={email}
                onChangeText={(value) => handleEmailChange(value)}
                onBlur={handleEmailBlur}
              />
              {emailErrorMessage ? <Text style={styles.errorText}>{emailErrorMessage}</Text> : null}
            </View>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  secureTextEntry={isPasswordSecure}
                  style={styles.inputControl}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSoft}
                  value={password}
                  onChangeText={(value) => handlePwChange(value)}
                  onBlur={handlePwBlur}
                />
                <TouchableOpacity
                  style={styles.icon}
                  onPress={() => {
                    isPasswordSecure
                      ? setIsPasswordSecure(false)
                      : setIsPasswordSecure(true);
                  }}
                >
                  <MaterialIcons
                    name={isPasswordSecure ? "visibility-off" : "visibility"}
                    size={24}
                    color={colors.textSoft}
                  />
                </TouchableOpacity>
              </View>
              {pwErrorMessage ? <Text style={styles.errorText}>{pwErrorMessage}</Text> : null}
            </View>
            <View style={styles.btnContainer}>
              <TouchableOpacity
                style={[
                  keys.primaryButton,
                  { alignSelf: "center", width: "95%" },
                ]}
                activeOpacity={0.8}
                onPress={handleLogin}
              >
                <LinearGradient
                  colors={colors.primaryGradient}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={keys.primaryButtonText}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signupText}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.signupLinkText}>
              Don't have an account?
              <Text style={styles.signupBoldText}>Sign up</Text>
            </Text>
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
    height: 200,
    position: "relative",
    overflow: "hidden",
    backgroundColor: colors.page,
    marginBottom: 0,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  welcomeContainer: {
    position: "absolute",
    left: 20,
    bottom: 20,
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
    marginTop: 0,
    paddingTop: 0,
  },
  icon: {
    position: 'absolute',
    right: 16,
  },
  passwordContainer: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    position: 'relative',
  },
  errorText: {
    color: colors.danger,
    alignSelf: 'flex-start',
    marginLeft: 10
  }
});
