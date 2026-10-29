import {
  Alert,
  Button,
  Dimensions,
  Image,
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
import { ApiError, CreateUser } from "../../lib/types";
import { useRouter } from "expo-router";
import WhiteContainer from "../../components/WhiteContainer";
import SmallGradientButton from "../../components/SmallGradientButton";
import IconContentButton from "../../components/IconContentButton";

const screenWidth = Dimensions.get("window").width;
export default function Signup() {
  const router = useRouter();

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
                    placeholder="Isabella Smith"
                    placeholderTextColor={colors.textSoft}
                  />
                </View>
                <View style={styles.input}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <View style={styles.inputBoxRow}>
                    <SmallGradientButton
                      text="Female"
                      width="48%"
                      height={40}
                      borderRadius={12}
                    />
                    <SmallGradientButton 
                      text="Male" 
                      width="48%" 
                      height={40} 
                      clicked={true} 
                      borderRadius={12}/>
                  </View>
                </View>
                <View style={styles.input}>
                  <View style={styles.inputBoxRow}>
                    <View style={styles.inRow}>
                      <Text style={[styles.inputLabel, {marginLeft: 5}]}>Height(cm)</Text>
                      <TextInput
                        style={styles.inputControl}
                        placeholder="162"
                        placeholderTextColor={colors.textSoft}
                      />
                    </View>
                    <View style={styles.inRow}>
                      <Text style={[styles.inputLabel, {marginLeft: 5}]}>Weight(kg)</Text>
                      <TextInput
                        style={styles.inputControl}
                        placeholder="60"
                        placeholderTextColor={colors.textSoft}
                      />
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
                    clicked={true}/>
                    <SmallGradientButton 
                    text="Light" 
                    width={70}
                    height={30} 
                    clicked={false}/>
                    <SmallGradientButton 
                    text="Moderate" 
                    width={90}
                    height={30} 
                    clicked={false}/>
                    <SmallGradientButton 
                    text="Active" 
                    width={80} 
                    height={30} 
                    clicked={false}/>
                    <SmallGradientButton 
                    text="Very active" 
                    width={100} 
                    height={30} 
                    clicked={false}/>
              </View>
            </WhiteContainer>
            <WhiteContainer title="GOAL" width="90%">
              <View style={styles.form}>
                <IconContentButton mainTitle="Lose weight" subTitle="Calorie deficit" icon="trending-down" clicked={true}/>
                <IconContentButton mainTitle="Maintain weight" subTitle="Stay balance" icon="barbell" clicked={false}/>
                <IconContentButton mainTitle="Gain weight" subTitle="Calorie surplus" icon="trending-up" clicked={false}/>
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
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingTop: 10,
    alignContent: 'space-between'
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
