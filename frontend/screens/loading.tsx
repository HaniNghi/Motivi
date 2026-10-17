import { useNavigation } from "@react-navigation/native";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import keys from "../styles/keys";
import colors from "../styles/colors";
import { LinearGradient } from "expo-linear-gradient";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function Loading() {
  const navigation = useNavigation<any>();
  const logoSize = screenWidth*0.4;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.background}>
        <LinearGradient
          colors={colors.splashGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
          <View style={styles.welcomeCard}>
            <View style={{ width: logoSize }}>
              <Image
                style={styles.logo}
                source={require("../assets/logo.png")}
              />
            </View>
            <Text style={styles.splashTitle}>Motivi</Text>
            <Text style={styles.splashSubTitle}>Eat with intention</Text>
            <TouchableOpacity
              style={{ marginTop: 40 }}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.link}>Go to log in</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  logo: {
    resizeMode: "contain",
    alignSelf: "center",
    width: "100%",
    height: 120,
  },
  welcomeCard: {
    flex: 1,
    width: screenWidth * 0.5,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    flex: 1,
  },
  splashTitle: {
    fontSize: 60,
    fontWeight: 800,
    color: colors.textWhite,
    fontFamily: 'PlusJakartaSans-Bold'
  },
  splashSubTitle: {
    fontSize:20,
    color: colors.textSoft,
    fontFamily: 'PlusJakartaSans-Regular'
  },
  link:{
    fontSize:15,
    color: colors.textMuted,
    fontFamily: 'PlusJakartaSans-Regular'
  }
});
