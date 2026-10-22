import { useNavigation } from "@react-navigation/native";
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
import colors from "../styles/colors";
import keys from "../styles/keys";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { createUser } from "../services/auth";
import { CreateUser } from "../types";

const screenWidth = Dimensions.get("window").width;
export default function Login() {
  const navigation = useNavigation<any>();
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

  const getPasswordError = () => {
    setPwErrorMessage('');
    setConfirmPwErrorMessage('');
    if (password.trim() === '') {
      setPwErrorMessage("Cannot leave empty field.");
      return;
    }
    if (confirmPassword.trim() === '') {
      setConfirmPwErrorMessage("Cannot leave empty field.");
      return;
    }
    if (confirmPassword.trim() !== password.trim()) {
      setConfirmPwErrorMessage("Password do not match.");
      return;
    }
    if (confirmPassword.trim() === password.trim() && password.trim().length < 8) {
      setPwErrorMessage("At least 8 characters.");
      setConfirmPwErrorMessage("At least 8 characters.");
      return;
    }
  }

  const getEmailError = () => {
    setEmailErrorMessge('');
    if (email.trim() === '' || email.trim().length === 0) {
      setEmailErrorMessge('Cannot leave empty email.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailErrorMessge('Invalid email.');
      return;
    }
  }
  const getFullnameError = () => {
    setFullnameErrorMessage('');
    if (fullName.trim() === '' || fullName.trim().length === 0) {
      setFullnameErrorMessage('Cannot leave empty full name.');
      return;
    }
  }

  const resetErrorMessage = () => {
    setFullnameErrorMessage('');
    setEmailErrorMessge('');
    setPwErrorMessage('');
    setConfirmPwErrorMessage('');
  }

  const handleCreateAccount = async () => {
    resetErrorMessage();
    getFullnameError();
    getEmailError();
    getPasswordError();

    const createUserPayload: CreateUser = {
      email: email,
      password: password,
      display_name: fullName,
    }

    const result = await createUser(createUserPayload);

    console.log("result", result)
    if (!result.ok) {
      Alert.alert("Fail to sign up", result.error.message);
      return;
    }

    // success flow
    Alert.alert("Success", "Account created");

  }


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
                onChangeText={(value) => setFullName(value)}
              />
              {fullnameErrorMessage ? <Text style={styles.errorText}>{fullnameErrorMessage}</Text> : null}
            </View>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.inputControl}
                placeholder="example@gmail.com"
                placeholderTextColor={colors.textSoft}
                value={email}
                onChangeText={(value) => setEmail(value)}
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
                  onChangeText={(value) => setPassword(value)}
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
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Confirm password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  secureTextEntry={isConfirmPasswordSecure}
                  style={styles.inputControl}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSoft}
                  value={confirmPassword}
                  onChangeText={(value) => setConfirmPassword(value)}
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
                    name={isConfirmPasswordSecure ? "visibility-off" : "visibility"}
                    size={24}
                    color={colors.textSoft}
                  />
                </TouchableOpacity>
              </View>
              {confirmPwErrorMessage ? <Text style={styles.errorText}>{confirmPwErrorMessage}</Text> : null}
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
            onPress={() => navigation.navigate("Login")}
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
