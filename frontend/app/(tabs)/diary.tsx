import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Diary(){
    return (
        <SafeAreaProvider>
          <SafeAreaView>
            <Text>Diary</Text>
          </SafeAreaView>
        </SafeAreaProvider>
      );
}