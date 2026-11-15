import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
import AddFood from "../addfood";
import * as foodService from "../../../services/food";
import * as diaryService from "../../../services/diary";
import { Alert } from "react-native";

// Mock router
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
  useLocalSearchParams: () => ({
    date: "2026-11-14",
  }),
  useFocusEffect: jest.fn(),
}));

// Mock services
jest.mock("../../../services/food", () => ({
  getFoods: jest.fn(),
  get_saved_food: jest.fn(),
}));

jest.mock("../../../services/diary", () => ({
  postEntry: jest.fn(),
  getDiaryDay: jest.fn(),
}));

// Spy on Alert
jest.spyOn(Alert, "alert");

const mockFoodsList = [
  {
    id: 1,
    name: "Banana",
    brand: "Fresh",
    calories_per_100g: 89,
    protein_per_100g: 1.1,
    carbs_per_100g: 22.8,
    fat_per_100g: 0.3,
    source: "openfoodfacts",
    image_url: null,
  },
  {
    id: 2,
    name: "Chicken breast",
    brand: null,
    calories_per_100g: 165,
    protein_per_100g: 31,
    carbs_per_100g: 0,
    fat_per_100g: 3.6,
    source: "custom",
    image_url: null,
  },
];

describe("AddFood Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (foodService.getFoods as jest.Mock).mockResolvedValue({
      foods: mockFoodsList,
      total: 2,
    });
    (foodService.get_saved_food as jest.Mock).mockResolvedValue(mockFoodsList);
  });


  describe("Component Rendering", () => {
    it("renders search input, filter tabs, action buttons and food list on mount", async () => {
      await render(<AddFood />);

      expect(screen.getByText("Add food")).toBeTruthy();
      expect(screen.getByText("Done")).toBeTruthy();
      expect(screen.getByPlaceholderText("Search foods")).toBeTruthy();
      expect(screen.getByText("All")).toBeTruthy();
      expect(screen.getByText("Saved")).toBeTruthy();
      expect(screen.getByText("+ Create custom food")).toBeTruthy();
      expect(screen.getByText("Data from OpenFoodFacts")).toBeTruthy();

      await waitFor(() => {
        expect(foodService.getFoods).toHaveBeenCalledWith("", 20);
        expect(screen.getByText("Banana")).toBeTruthy();
        expect(screen.getByText("Chicken breast")).toBeTruthy();
      });
    });
  });

  describe("Tab Switching & Saved Foods", () => {
    it("fetches and displays saved foods when Saved tab is selected", async () => {
      const mockSaved = [
        {
          id: 3,
          name: "Homemade granola",
          calories_per_100g: 450,
          protein_per_100g: 12,
          carbs_per_100g: 60,
          fat_per_100g: 18,
          source: "custom",
          image_url: null,
        },
      ];
      (foodService.get_saved_food as jest.Mock).mockResolvedValueOnce(mockSaved);

      await render(<AddFood />);

      await fireEvent.press(screen.getByText("Saved"));

      await waitFor(() => {
        expect(foodService.get_saved_food).toHaveBeenCalledTimes(1);
        expect(screen.getByText("Homemade granola")).toBeTruthy();
      });
    });

    it("displays 'No saved foods' message when saved foods list is empty", async () => {
      (foodService.get_saved_food as jest.Mock).mockResolvedValueOnce([]);

      await render(<AddFood />);

      await fireEvent.press(screen.getByText("Saved"));

      await waitFor(() => {
        expect(screen.getByText("No saved foods")).toBeTruthy();
      });
    });
  });

  describe("Search Foods Input", () => {
    it("updates search input text and fetches foods after debounce", async () => {
      await render(<AddFood />);
      const searchInput = screen.getByPlaceholderText("Search foods");

      await fireEvent.changeText(searchInput, "Apple");

      await waitFor(
        () => {
          expect(foodService.getFoods).toHaveBeenCalledWith("Apple", 50);
        },
        { timeout: 1500 }
      );
    });
  });

  describe("Add Food Entry (Happy Path)", () => {
    it("opens entry modal on item press and adds food entry to diary", async () => {
      (diaryService.postEntry as jest.Mock).mockResolvedValueOnce({ success: true });

      await render(<AddFood />);

      await waitFor(() => {
        expect(screen.getByText("Banana")).toBeTruthy();
      });

      // Press the food item to open modal
      await fireEvent.press(screen.getByText("Banana"));

      // In AddEntry modal, press "Add to diary"
      await waitFor(() => {
        expect(screen.getByText("Add to diary")).toBeTruthy();
      });

      await fireEvent.press(screen.getByText("Add to diary"));

      await waitFor(() => {
        expect(diaryService.postEntry).toHaveBeenCalledWith({
          food_id: 1,
          date: "2026-11-14",
          amount_g: 100,
        });
      });
    });
  });

  describe("API Error Handling", () => {
    it("displays error alert when postEntry rejects", async () => {
      (diaryService.postEntry as jest.Mock).mockRejectedValueOnce(
        new Error("Database write error")
      );

      await render(<AddFood />);

      await waitFor(() => {
        expect(screen.getByText("Banana")).toBeTruthy();
      });

      await fireEvent.press(screen.getByText("Banana"));

      await waitFor(() => {
        expect(screen.getByText("Add to diary")).toBeTruthy();
      });

      await fireEvent.press(screen.getByText("Add to diary"));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Failed to add a food",
          "Database write error"
        );
      });
    });

    it("displays error message when getFoods fails", async () => {
      (foodService.getFoods as jest.Mock).mockRejectedValueOnce({
        code: "network_error",
        message: "Failed to load foods",
      });

      await render(<AddFood />);

      await waitFor(() => {
        expect(screen.getByText("network_error Failed to load foods")).toBeTruthy();
      });
    });
  });

  describe("Navigation", () => {
    it("navigates back when Done button is pressed", async () => {
      await render(<AddFood />);
      await fireEvent.press(screen.getByText("Done"));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("navigates to custom food screen when '+ Create custom food' is pressed", async () => {
      await render(<AddFood />);
      await fireEvent.press(screen.getByText("+ Create custom food"));
      expect(mockPush).toHaveBeenCalledWith("/(food)/customfood");
    });
  });
});
