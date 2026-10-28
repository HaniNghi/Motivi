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
import { ApiError, CreateUser } from "../../lib/types";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;
export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);

  const [fullnameErrorMessage, setFullnameErrorMessage] = useState("");
  const [emailErrorMessage, setEmailErrorMessge] = useState("");
  const [pwErrorMessage, setPwErrorMessage] = useState("");
  const [confirmPwErrorMessage, setConfirmPwErrorMessage] = useState("");

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleFullNameChange = (fullName: string) => {
    setFullName(fullName);

    if (fullnameErrorMessage) {
      setFullnameErrorMessage("");
    }
  }

  const handleFullNameBlur = () => {
    if (!fullName.trim()) {
      setFullnameErrorMessage("Full name cannot be empty.");
    }
  }

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

  const handleConfirmPwChange = (pw: string) => {
    setConfirmPassword(pw);
    if (confirmPwErrorMessage) {
      setConfirmPwErrorMessage("");
    }
  };
  const handleConfirmPwBlur = () => {
    if (!confirmPassword.trim()) {
      setConfirmPwErrorMessage("Confirm password cannot be empty.");
    } else if (confirmPassword.trim() !== password) {
      setConfirmPwErrorMessage("Confirm password does not match");
    }
  };

  const isValid = (): boolean => {
    if (!fullName || !email.trim() ||
    !EMAIL_REGEX.test(email.trim()) ||
    password.trim().length < 8 ||
    confirmPassword !== password) {
      return false;
    } else {
      return true;
    }
  }

  const handleCreateAccount = async () => {
    handleFullNameBlur();
    handleEmailBlur();
    handlePwBlur();
    handleConfirmPwBlur();

    if (!isValid()) {
      return;
    } else {
      const createUserPayload: CreateUser = {
        email: email,
        password: password,
        display_name: fullName,
      };

      try {
        const result = await createUser(createUserPayload);
        if (result) {
          Alert.alert("Success", "Account created");
          router.dismissTo("/login")
        }
      } catch (error: any) {
        Alert.alert("Fail to sign up", error.message);
      }

    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.imageContainer}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Create your</Text>
            <Text style={styles.welcomeText}>Motivi</Text>
            <Text style={styles.subText}>Start eating with intention.</Text>
          </View>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.form}>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Full name</Text>
              <TextInput
                style={styles.inputControl}
                placeholder="Isabella Smith"
                placeholderTextColor={colors.textSoft}
                value={fullName}
                onChangeText={(value) => handleFullNameChange(value)}
                onBlur={handleFullNameBlur}
              />
              {fullnameErrorMessage ? (
                <Text style={styles.errorText}>{fullnameErrorMessage}</Text>
              ) : null}
            </View>
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
              {emailErrorMessage ? (
                <Text style={styles.errorText}>{emailErrorMessage}</Text>
              ) : null}
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
              {pwErrorMessage ? (
                <Text style={styles.errorText}>{pwErrorMessage}</Text>
              ) : null}
            </View>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Confirm password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  secureTextEntry={isConfirmPasswordSecure}
                  style={styles.inputControl}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSoft}
                  value={confirmPassword}
                  onChangeText={(value) => handleConfirmPwChange(value)}
                  onBlur={handleConfirmPwBlur}
                />
                <TouchableOpacity
                  style={styles.icon}
                  onPress={() => {
                    isConfirmPasswordSecure
                      ? setIsConfirmPasswordSecure(false)
                      : setIsConfirmPasswordSecure(true);
                  }}
                >
                  <MaterialIcons
                    name={
                      isConfirmPasswordSecure ? "visibility-off" : "visibility"
                    }
                    size={24}
                    color={colors.textSoft}
                  />
                </TouchableOpacity>
              </View>
              {confirmPwErrorMessage ? (
                <Text style={styles.errorText}>{confirmPwErrorMessage}</Text>
              ) : null}
            </View>
            <View style={styles.btnContainer}>
              <TouchableOpacity
                style={[
                  keys.primaryButton,
                  { alignSelf: "center", width: "95%" },
                ]}
                activeOpacity={0.8}
                onPress={handleCreateAccount}
              >
                <LinearGradient
                  colors={colors.primaryGradient}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={keys.primaryButtonText}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signupText}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.signupLinkText}>
              Already have an account?
              <Text style={styles.signupBoldText}>Log in</Text>
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
    height: 160,
    backgroundColor: colors.page,
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
