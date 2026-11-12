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
import { LinearGradient } from "expo-linear-gradient";
import { imageSource, prettyFoodName } from "../lib/utils";

export interface EntryFoodProps {
  picLink?: string | ImageSourcePropType | null;
  foodName: string;
  amount: string | number;
  protein?: number;
  protein_g?: number;
  carbs?: number;
  carbs_g?: number;
  fat?: number;
  fat_g?: number;
  calories?: number;
  width?: DimensionValue;
  addButton?: boolean;
  onPress?: () => void;
}

export default function EntryFood({
  picLink,
  foodName,
  amount = 100,
  protein,
  protein_g,
  carbs,
  carbs_g,
  fat,
  fat_g,
  calories,
  addButton = false,
  width = "100%",
  onPress,
}: EntryFoodProps) {
  const displayName = foodName ? prettyFoodName(foodName): "";
  const displayAmount = amount ?? "";
  const displayProtein = protein ?? protein_g;
  const displayCarbs = carbs ?? carbs_g;
  const displayFat = fat ?? fat_g;
  const hasMacros =
    displayProtein !== undefined ||
    displayCarbs !== undefined ||
    displayFat !== undefined;

  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [picLink]);

  const resolvedImage = React.useMemo(
    () => imageSource(picLink, imageError),
    [picLink, imageError],
  );

  const formatMacro = (val?: number | string) => {
    if (val === undefined || val === null) return "0g";
    if (typeof val === "number") return `${val}g`;
    return val.endsWith("g") ? val : `${val}g`;
  };

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.left}>
        <View style={styles.badge}>
          <Image
            source={resolvedImage}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        </View>

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

      <View style={styles.caloriesContainer}>
        <Text style={styles.calories}>{calories}</Text>
        <Text style={styles.unit}>kcal</Text>
      </View>
      {onPress && addButton && (
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={onPress}
        >
          <LinearGradient
            colors={colors.primaryGradient}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
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
    overflow: "hidden",
  },
  image: {
    width: 36,
    height: 36,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
    justifyContent: "center",
  },
  foodName: {
    color: colors.text,
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Bold",
  },
  amount: {
    color: colors.textSoft,
    fontSize: 11,
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
    fontSize: 9,
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
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
  },
  unit: {
    color: colors.textSoft,
    fontSize: 10,
    fontFamily: "PlusJakartaSans-Regular",
  },
  addButton: {
    height: 20,
    width: 20,
    borderRadius: 5,
    marginLeft: 5,
    overflow: 'hidden'
  },
  addButtonText: {
    color: colors.textWhite,
    alignSelf: 'center'
  }
});
