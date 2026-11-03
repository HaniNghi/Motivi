import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  DimensionValue,
} from "react-native";
import colors from "../styles/colors";

export interface EntryFoodProps {
  picLink?: string | ImageSourcePropType;
  foodName?: string;
  title?: string;
  name?: string;
  amount?: string | number;
  subtitle?: string;
  sub?: string;
  protein?: string | number;
  protein_g?: string | number;
  carbs?: string | number;
  carbs_g?: string | number;
  fats?: string | number;
  fat?: string | number;
  fat_g?: string | number;
  calories?: string | number;
  width?: DimensionValue;
  onPress?: () => void;
}

export default function EntryFood({
  picLink,
  foodName,
  title,
  name,
  amount,
  subtitle,
  sub,
  protein,
  protein_g,
  carbs,
  carbs_g,
  fats,
  fat,
  fat_g,
  calories = 0,
  width = "100%",
  onPress,
}: EntryFoodProps) {
  const displayName = foodName || title || name || "";
  const displayAmount = amount ?? subtitle ?? sub ?? "";
  const displayProtein = protein ?? protein_g;
  const displayCarbs = carbs ?? carbs_g;
  const displayFat = fats ?? fat ?? fat_g;
  const hasMacros =
    displayProtein !== undefined ||
    displayCarbs !== undefined ||
    displayFat !== undefined;

  const imageSource =
    typeof picLink === "string" ? { uri: picLink } : picLink;

  const formatMacro = (val?: number | string) => {
    if (val === undefined || val === null) return "0g";
    if (typeof val === "number") return `${val}g`;
    return val.endsWith("g") ? val : `${val}g`;
  };

  const content = (
    <View style={[styles.container, { width }]}>
      {/* Left: Picture */}
      <View style={styles.left}>
        <View style={styles.badge}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="contain"
            />
          ) : null}
        </View>

        {/* Food name & Amount */}
        <View style={styles.textContainer}>
          <Text style={styles.foodName} numberOfLines={1}>
            {displayName}
          </Text>
          {displayAmount !== "" ? (
            <Text style={styles.amount} numberOfLines={1}>
              {typeof displayAmount === "number" ||
              (!isNaN(Number(displayAmount)) &&
                !String(displayAmount).endsWith("g"))
                ? `${displayAmount}g`
                : displayAmount}
            </Text>
          ) : null}
          {hasMacros && (
            <View style={styles.macrosRow}>
              <Text style={styles.macroText}>
                <Text style={styles.macroProtein}>P:</Text>{" "}
                {formatMacro(displayProtein)}
              </Text>
              <Text style={styles.macroText}>
                <Text style={styles.macroCarbs}>C:</Text>{" "}
                {formatMacro(displayCarbs)}
              </Text>
              <Text style={styles.macroText}>
                <Text style={styles.macroFat}>F:</Text>{" "}
                {formatMacro(displayFat)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Right: Calories */}
      <View style={styles.caloriesContainer}>
        <Text style={styles.calories}>{calories}</Text>
        <Text style={styles.unit}>kcal</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F3F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 32,
    height: 32,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
    justifyContent: "center",
  },
  foodName: {
    color: colors.text,
    fontSize: 15,
    fontFamily: "PlusJakartaSans-Bold",
  },
  amount: {
    color: colors.textSoft,
    fontSize: 13,
    fontFamily: "PlusJakartaSans-Regular",
    marginTop: 2,
  },
  macrosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  macroText: {
    color: colors.textSoft,
    fontSize: 11,
    fontFamily: "PlusJakartaSans-Regular",
  },
  macroProtein: {
    color: colors.protein,
    fontFamily: "PlusJakartaSans-Bold",
  },
  macroCarbs: {
    color: colors.carbs,
    fontFamily: "PlusJakartaSans-Bold",
  },
  macroFat: {
    color: colors.fat,
    fontFamily: "PlusJakartaSans-Bold",
  },
  caloriesContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  calories: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: "PlusJakartaSans-Bold",
  },
  unit: {
    color: colors.textSoft,
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Regular",
  },
});
