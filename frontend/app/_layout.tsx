import { StyleSheet } from "react-native";
import Loading from "./loading";
import Login from "./(auth)/login";
import Signup from "./(auth)/signup";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

export default function App() {
  const [fontsLoaded] = useFonts({
    "PlusJakartaSans": require("../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf"),
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
  });

  if (!fontsLoaded) {
    return null; // Render loading screen or splash screen until fonts load
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Main App Groups */}
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />

        {/* Utility Screens */}
        <Stack.Screen name="loading" options={{ animation: "fade" }} />
      </Stack>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
