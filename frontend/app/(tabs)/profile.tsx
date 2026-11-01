import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Profile(){
    return (
        <SafeAreaProvider>
          <SafeAreaView>
            <Text>Profile</Text>
          </SafeAreaView>
        </SafeAreaProvider>
      );
}