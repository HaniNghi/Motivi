import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import CustomFood from "../customfood";
import * as foodService from "../../../services/food";
import { Alert } from "react-native";

// Mock router
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

// Mock food service
jest.mock("../../../services/food", () => ({
  postCustomFood: jest.fn(),
}));

// Spy on Alert
jest.spyOn(Alert, "alert");

describe("CustomFood Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders title, subtitle, all inputs and action buttons correctly upon mount", async () => {
      await render(<CustomFood />);

      expect(screen.getByText("Custom food")).toBeTruthy();
      expect(screen.getByText("Saved to your food list next time")).toBeTruthy();

      expect(screen.getByPlaceholderText("e.g Homemade granola")).toBeTruthy();
      expect(screen.getByPlaceholderText("e.g. 250")).toBeTruthy();
      expect(screen.getByPlaceholderText("e.g. 10")).toBeTruthy();
      expect(screen.getByPlaceholderText("e.g. 30")).toBeTruthy();
      expect(screen.getByPlaceholderText("e.g. 8")).toBeTruthy();

      expect(screen.getByText("Cancel")).toBeTruthy();
      expect(screen.getByText("Save food")).toBeTruthy();
    });
  });

  describe("Form Validation & Blur Events", () => {
    it("displays validation error when food name is blurred empty", async () => {
      await render(<CustomFood />);
      const input = screen.getByPlaceholderText("e.g Homemade granola");

      await fireEvent(input, "blur");
      expect(screen.getByText("Food name cannot be empty.")).toBeTruthy();
    });

    it("displays validation error when food name exceeds 120 characters", async () => {
      await render(<CustomFood />);
      const input = screen.getByPlaceholderText("e.g Homemade granola");

      await fireEvent.changeText(input, "a".repeat(121));
      await fireEvent(input, "blur");
      expect(screen.getByText("Food name must be at most 120 characters.")).toBeTruthy();
    });

    it("displays validation error when calories is blurred empty or invalid", async () => {
      await render(<CustomFood />);
      const input = screen.getByPlaceholderText("e.g. 250");

      await fireEvent(input, "blur");
      expect(screen.getByText("Calories cannot be empty.")).toBeTruthy();

      await fireEvent.changeText(input, "-10");
      await fireEvent(input, "blur");
      expect(screen.getByText("Calories must be a number 0 or greater.")).toBeTruthy();

      await fireEvent.changeText(input, "not-a-number");
      await fireEvent(input, "blur");
      expect(screen.getByText("Calories must be a number 0 or greater.")).toBeTruthy();
    });

    it("displays validation error when protein is blurred empty or invalid", async () => {
      await render(<CustomFood />);
      const input = screen.getByPlaceholderText("e.g. 10");

      await fireEvent(input, "blur");
      expect(screen.getByText("Protein cannot be empty.")).toBeTruthy();

      await fireEvent.changeText(input, "-5");
      await fireEvent(input, "blur");
      expect(screen.getByText("Protein must be a number 0 or greater.")).toBeTruthy();
    });

    it("displays validation error when carbs is blurred empty or invalid", async () => {
      await render(<CustomFood />);
      const input = screen.getByPlaceholderText("e.g. 30");

      await fireEvent(input, "blur");
      expect(screen.getByText("Carbohydrates cannot be empty.")).toBeTruthy();

      await fireEvent.changeText(input, "invalid");
      await fireEvent(input, "blur");
      expect(screen.getByText("Carbohydrates must be a number 0 or greater.")).toBeTruthy();
    });

    it("displays validation error when fat is blurred empty or invalid", async () => {
      await render(<CustomFood />);
      const input = screen.getByPlaceholderText("e.g. 8");

      await fireEvent(input, "blur");
      expect(screen.getByText("Fat cannot be empty.")).toBeTruthy();

      await fireEvent.changeText(input, "-1");
      await fireEvent(input, "blur");
      expect(screen.getByText("Fat must be a number 0 or greater.")).toBeTruthy();
    });
  });

  describe("Error Message Clearing", () => {
    it("clears validation error when user re-types into input fields", async () => {
      await render(<CustomFood />);
      const nameInput = screen.getByPlaceholderText("e.g Homemade granola");
      const caloriesInput = screen.getByPlaceholderText("e.g. 250");

      // Trigger errors
      await fireEvent(nameInput, "blur");
      expect(screen.getByText("Food name cannot be empty.")).toBeTruthy();

      await fireEvent(caloriesInput, "blur");
      expect(screen.getByText("Calories cannot be empty.")).toBeTruthy();

      // Clear on typing
      await fireEvent.changeText(nameInput, "Protein Bar");
      expect(screen.queryByText("Food name cannot be empty.")).toBeNull();

      await fireEvent.changeText(caloriesInput, "200");
      expect(screen.queryByText("Calories cannot be empty.")).toBeNull();
    });
  });

  describe("Form Submission (Happy Path)", () => {
    it("successfully creates custom food and navigates back", async () => {
      const mockResult = {
        id: 101,
        name: "Oatmeal Bowl",
        calories_per_100g: 150,
        protein_per_100g: 5,
        carbs_per_100g: 27,
        fat_per_100g: 3,
      };
      (foodService.postCustomFood as jest.Mock).mockResolvedValueOnce(mockResult);

      await render(<CustomFood />);

      await fireEvent.changeText(screen.getByPlaceholderText("e.g Homemade granola"), "Oatmeal Bowl");
      await fireEvent.changeText(screen.getByPlaceholderText("e.g. 250"), "150");
      await fireEvent.changeText(screen.getByPlaceholderText("e.g. 10"), "5");
      await fireEvent.changeText(screen.getByPlaceholderText("e.g. 30"), "27");
      await fireEvent.changeText(screen.getByPlaceholderText("e.g. 8"), "3");

      await fireEvent.press(screen.getByText("Save food"));

      await waitFor(() => {
        expect(foodService.postCustomFood).toHaveBeenCalledWith({
          name: "Oatmeal Bowl",
          calories_per_100g: 150,
          protein_per_100g: 5,
          carbs_per_100g: 27,
          fat_per_100g: 3,
        });
        expect(Alert.alert).toHaveBeenCalledWith("Success", "Custom food added");
        expect(mockBack).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Form Submission (Unhappy Path)", () => {
    it("halts submission and displays validation errors without calling API when fields are empty", async () => {
      await render(<CustomFood />);

      await fireEvent.press(screen.getByText("Save food"));

      expect(foodService.postCustomFood).not.toHaveBeenCalled();
      expect(screen.getByText("Food name cannot be empty.")).toBeTruthy();
      expect(screen.getByText("Calories cannot be empty.")).toBeTruthy();
      expect(screen.getByText("Protein cannot be empty.")).toBeTruthy();
      expect(screen.getByText("Carbohydrates cannot be empty.")).toBeTruthy();
      expect(screen.getByText("Fat cannot be empty.")).toBeTruthy();
      expect(mockBack).not.toHaveBeenCalled();
    });

    it("halts submission when inputs contain invalid formats", async () => {
      await render(<CustomFood />);

      await fireEvent.changeText(screen.getByPlaceholderText("e.g Homemade granola"), "Apple");
      await fireEvent.changeText(screen.getByPlaceholderText("e.g. 250"), "-50");
      await fireEvent.changeText(screen.getByPlaceholderText("e.g. 10"), "abc");
      await fireEvent.changeText(screen.getByPlaceholderText("e.g. 30"), "20");
      await fireEvent.changeText(screen.getByPlaceholderText("e.g. 8"), "2");

      await fireEvent.press(screen.getByText("Save food"));

      expect(foodService.postCustomFood).not.toHaveBeenCalled();
      expect(screen.getByText("Calories must be a number 0 or greater.")).toBeTruthy();
      expect(screen.getByText("Protein must be a number 0 or greater.")).toBeTruthy();
    });
  });

  describe("API Error Handling", () => {
    it("displays error alert when postCustomFood API rejects", async () => {
      (foodService.postCustomFood as jest.Mock).mockRejectedValueOnce(
        new Error("Network request failed")
      );

      await render(<CustomFood />);

      await fireEvent.changeText(screen.getByPlaceholderText("e.g Homemade granola"), "Greek Yogurt");
      await fireEvent.changeText(screen.getByPlaceholderText("e.g. 250"), "100");
      await fireEvent.changeText(screen.getByPlaceholderText("e.g. 10"), "10");
      await fireEvent.changeText(screen.getByPlaceholderText("e.g. 30"), "4");
      await fireEvent.changeText(screen.getByPlaceholderText("e.g. 8"), "0");

      await fireEvent.press(screen.getByText("Save food"));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Fail to add custom food",
          "Network request failed"
        );
        expect(mockBack).not.toHaveBeenCalled();
      });
    });
  });

  describe("Navigation", () => {
    it("triggers router.back when Cancel button is pressed", async () => {
      await render(<CustomFood />);
      await fireEvent.press(screen.getByText("Cancel"));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });
});
