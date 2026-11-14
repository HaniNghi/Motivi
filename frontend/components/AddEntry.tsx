import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Entry, Food } from "../lib/types";
import { imageSource, prettyFoodName } from "../lib/utils";
import colors from "../styles/colors";
import PrimaryButton from "./PrimaryButton";

interface AddEntryProps {
  modalVisible: boolean;
  food?: Food | null;
  entry?: Entry | null;
  initialAmount?: number;
  onClose: () => void;
  onAdd?: (amountG: number, food: Food) => void;
  onModify?: (amountG: number, entry: Entry) => void;
  onDelete?: (entry: Entry) => void;
}

export default function AddEntry({
  modalVisible,
  food,
  entry,
  initialAmount,
  onClose,
  onAdd,
  onModify,
  onDelete,
}: AddEntryProps) {
  const [servingSize, setServingSize] = useState("100");
  const [imageError, setImageError] = useState(false);

  const isEditMode = Boolean(entry && onModify);

  // Derive food metadata whether passed a Food or an Entry
  const effectiveFood: Food | null = useMemo(() => {
    if (food) return food;
    if (entry) {
      const baseAmount = entry.amount_g > 0 ? entry.amount_g : 100;
      return {
        id: entry.food_id,
        name: entry.food_name,
        brand: null,
        calories_per_100g: (entry.calories / baseAmount) * 100,
        calories_per_100ml: null,
        protein_per_100g: (entry.protein_g / baseAmount) * 100,
        carbs_per_100g: (entry.carbs_g / baseAmount) * 100,
        fat_per_100g: (entry.fat_g / baseAmount) * 100,
        source: "custom",
        off_code: null,
        image_url: entry.image_url ?? null,
      };
    }
    return null;
  }, [food, entry]);

  useEffect(() => {
    if (modalVisible) {
      if (initialAmount !== undefined) {
        setServingSize(String(initialAmount));
      } else if (entry) {
        setServingSize(String(entry.amount_g));
      } else {
        setServingSize("100");
      }
      setImageError(false);
    }
  }, [modalVisible, food, entry, initialAmount]);

  const resolvedImage = useMemo(
    () => imageSource(effectiveFood?.image_url, imageError),
    [effectiveFood?.image_url, imageError],
  );

  const numericServing = parseFloat(servingSize.replace(",", ".")) || 0;
  const ratio = numericServing / 100;

  const formatValue = (val: number) => {
    const rounded = Math.round(val * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded}` : `${rounded.toFixed(1)}`;
  };

  const totalCalories = Math.round(
    (effectiveFood?.calories_per_100g ?? 0) * ratio,
  );
  const totalProtein = formatValue(
    (effectiveFood?.protein_per_100g ?? 0) * ratio,
  );
  const totalCarbs = formatValue((effectiveFood?.carbs_per_100g ?? 0) * ratio);
  const totalFat = formatValue((effectiveFood?.fat_per_100g ?? 0) * ratio);
  const displayName = effectiveFood?.name
    ? prettyFoodName(effectiveFood.name)
    : "";

  const handleAdd = () => {
    if (onAdd && effectiveFood) {
      onAdd(numericServing, effectiveFood);
    }
    onClose();
  };

  const handleModify = () => {
    if (onModify && entry) {
      onModify(numericServing, entry);
    }
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && entry) {
      Alert.alert(
        "Delete Entry",
        `Are you sure you want to remove "${displayName}" from today's diary?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              onDelete(entry);
              onClose();
            },
          },
        ],
      );
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.container}>
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
                <Text style={styles.amount} numberOfLines={1}>
                  {Math.round(effectiveFood?.calories_per_100g ?? 0)} kcal / 100g
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.servingSection}>
            <Text style={styles.servingLabel}>Serving size</Text>
            <View style={styles.servingInputWrapper}>
              <TextInput
                style={styles.servingInput}
                value={servingSize}
                onChangeText={setServingSize}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSoft}
              />
              <Text style={styles.servingUnit}>grams (g)</Text>
            </View>
          </View>

          <View style={styles.caloriesRow}>
            <Text style={styles.caloriesValue}>{totalCalories}</Text>
            <Text style={styles.caloriesUnit}> kcal</Text>
          </View>

          <View style={styles.nutrientsBox}>
            <Text style={styles.nutrientsTitle}>NUTRIENTS</Text>
            <View style={styles.nutrientsRow}>
              <View style={styles.nutrientItem}>
                <View
                  style={[styles.dot, { backgroundColor: colors.protein }]}
                />
                <Text style={styles.nutrientLabel}>
                  Protein:{" "}
                  <Text style={styles.nutrientValue}>{totalProtein}g</Text>
                </Text>
              </View>

              <View style={styles.nutrientItem}>
                <View
                  style={[styles.dot, { backgroundColor: colors.carbs }]}
                />
                <Text style={styles.nutrientLabel}>
                  Carbs: <Text style={styles.nutrientValue}>{totalCarbs}g</Text>
                </Text>
              </View>

              <View style={styles.nutrientItem}>
                <View
                  style={[styles.dot, { backgroundColor: colors.fat }]}
                />
                <Text style={styles.nutrientLabel}>
                  Fat: <Text style={styles.nutrientValue}>{totalFat}g</Text>
                </Text>
              </View>
            </View>
          </View>

          {isEditMode ? (
            <View style={styles.editActionsContainer}>
              <View style={styles.buttonRow}>
                <PrimaryButton
                  text="Cancel"
                  width={"48%"}
                  onPress={onClose}
                  primary={false}
                />
                <PrimaryButton
                  text="Modify"
                  width={"48%"}
                  onPress={handleModify}
                  primary={true}
                />
              </View>
              {onDelete && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  activeOpacity={0.8}
                  onPress={handleDelete}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <PrimaryButton
                text="Cancel"
                width={"48%"}
                onPress={onClose}
                primary={false}
              />
              <PrimaryButton
                text="Add to diary"
                width={"48%"}
                onPress={handleAdd}
                primary={true}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.scrim,
  },
  modalView: {
    width: "90%",
    maxWidth: 400,
    margin: 20,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
  },
  amount: {
    color: colors.textSoft,
    fontSize: 11,
    fontFamily: "PlusJakartaSans-Regular",
    marginTop: 2,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.page,
    marginVertical: 14,
  },
  servingSection: {
    width: "100%",
  },
  servingLabel: {
    color: colors.text,
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Bold",
    marginBottom: 8,
  },
  servingInputWrapper: {
    width: "100%",
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  servingInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontFamily: "PlusJakartaSans-Medium",
    paddingVertical: 0,
  },
  servingUnit: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: "PlusJakartaSans-Bold",
    marginLeft: 8,
  },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginVertical: 18,
  },
  caloriesValue: {
    color: colors.primary,
    fontSize: 36,
    fontFamily: "PlusJakartaSans-ExtraBold",
  },
  caloriesUnit: {
    color: colors.primary,
    fontSize: 15,
    fontFamily: "PlusJakartaSans-Bold",
  },
  nutrientsBox: {
    width: "100%",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  nutrientsTitle: {
    color: colors.textSoft,
    fontSize: 10,
    fontFamily: "PlusJakartaSans-Bold",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  nutrientsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nutrientItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  nutrientLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: "PlusJakartaSans-Regular",
  },
  nutrientValue: {
    color: colors.text,
    fontFamily: "PlusJakartaSans-Bold",
  },
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editActionsContainer: {
    width: "100%",
  },
  deleteButton: {
    width: "100%",
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.redTint,
    borderWidth: 1,
    borderColor: colors.redTint2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Bold",
  },
});
