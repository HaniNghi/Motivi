import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import colors from "../styles/colors";
import TabButton from "./TabButton";

export default function MyTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        // // Do not render hidden tabs
        // const itemStyle = StyleSheet.flatten(options.tabBarItemStyle);
        // if (itemStyle?.display === "none" || (options as any).href === null) {
        //   return null;
        // }
        const label =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabButton 
            key={route.name}
            routeName={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            label={label}
            options={options}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.textWhite,
    width: '100%',
    height: 55,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
})

