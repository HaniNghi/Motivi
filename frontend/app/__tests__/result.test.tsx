import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import ResultScreen from "../result";

// Mock router
const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

// Mock useAuth
const mockProfile = {
  tdee: 2200,
  goal: "lose",
  activity_level: "moderate",
  age: 25,
  gender: "female",
  height_cm: 165,
  weight_kg: 58,
};

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    profile: mockProfile,
  }),
}));

describe("Result Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders daily calorie targets, summary description, stat cards, and action buttons", async () => {
      await render(<ResultScreen />);

      expect(screen.getByText("YOUR DAILY CALORIE NEED")).toBeTruthy();
      expect(screen.getByText("2,200")).toBeTruthy(); // formatted by CircleResult
      expect(screen.getByText(/lose/)).toBeTruthy();
      expect(screen.getByText(/moderate/)).toBeTruthy();

      expect(screen.getByText("25 yrs")).toBeTruthy();
      expect(screen.getByText("Female")).toBeTruthy();
      expect(screen.getByText("165 cm")).toBeTruthy();
      expect(screen.getByText("58 kg")).toBeTruthy();

      expect(screen.getByText("Continue To Home")).toBeTruthy();
      expect(screen.getByText("Recalculate")).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("navigates to tabs home when 'Continue To Home' is pressed", async () => {
      await render(<ResultScreen />);

      await fireEvent.press(screen.getByText("Continue To Home"));

      expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
    });

    it("navigates back to calculator when 'Recalculate' is pressed", async () => {
      await render(<ResultScreen />);

      await fireEvent.press(screen.getByText("Recalculate"));

      expect(mockPush).toHaveBeenCalledWith("/(onboarding)/calculator");
    });
  });
});
