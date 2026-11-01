import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import colors from "../styles/colors";
import {
  NavigationRoute,
  ParamListBase,
} from "expo-router/build/react-navigation/routers";
import { BottomTabNavigationOptions } from "expo-router/build/react-navigation/bottom-tabs";
import { useEffect, useRef } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";


const icons = new Map<string, keyof typeof Feather.glyphMap>([
  ["index", "home"],
  ["diary", "book"],
  ["graph", "bar-chart"],
  ["profile", "user"],
]);

interface TabButtonProps {
  routeName: string;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  options: BottomTabNavigationOptions;
}

export default function TabButton({
  routeName,
  label,
  onPress,
  onLongPress,
  isFocused,
  options,
}: TabButtonProps) {
  const scale = useRef(new Animated.Value(isFocused ? 1.05 : 1)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: isFocused ? 1.05 : 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);
  return (
    <Animated.View style={styles.buttonContainer}>
      <TouchableOpacity
        key={routeName}
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarButtonTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        style={styles.touchable}
      >
        <View style={[styles.dash, isFocused && styles.dashActive]} />
        <View style={[styles.icon, isFocused && styles.iconActive]}>
          <Feather
            name={icons.get(routeName) ?? "help-circle"}
            size={20}
            color={isFocused ? colors.primary : colors.textMuted}
            style={{alignSelf: 'center'}}
          />
        </View>
        <Text style={isFocused ? styles.focusText: styles.nonFocusText }>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  touchable: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    gap: 4,
    justifyContent: "center",
    height: "100%",
    paddingBottom: 5,
    borderRadius: 18,
    cursor: "pointer",
    backgroundColor: "transparent",
  },
  focusText: {
    color: colors.primary,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,

  },
  nonFocusText: {
    color: colors.textMuted,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 10,
  },
  dash: {
    width: 30,                  
    height: 3,                  
    borderRadius: 2,            
    backgroundColor: "transparent", 
    marginBottom: 3,
    marginTop: 6,          
    alignSelf: 'center'
  },
  dashActive: {
    backgroundColor: colors.primary, 
  },
  icon: {
    width: 30,                  
    height: 30,                  
    borderRadius: 12,            
    backgroundColor: "transparent", 
    alignSelf: 'center',
    justifyContent: 'center'
  },
  iconActive: {
    backgroundColor: colors.selectedGoalTint, 
  },
});
