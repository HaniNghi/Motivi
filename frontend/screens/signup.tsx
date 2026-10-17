import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Signup() {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Text>Signup</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
