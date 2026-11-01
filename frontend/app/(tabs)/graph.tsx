import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Graph(){
    return (
        <SafeAreaProvider>
          <SafeAreaView>
            <Text>Graph</Text>
          </SafeAreaView>
        </SafeAreaProvider>
      );
}