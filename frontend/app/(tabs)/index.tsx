import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Text>Home</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
