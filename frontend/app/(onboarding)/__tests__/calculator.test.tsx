import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import Calculator from "../calculator";
import * as meService from "../../../services/me";
import { Alert } from "react-native";

// Mock router
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
    push: mockPush,
  }),
}));

// Mock useAuth
const mockRefreshMe = jest.fn();
jest.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    refreshMe: mockRefreshMe,
  }),
}));

// Mock services/me
jest.mock("../../../services/me", () => ({
  postProfile: jest.fn(),
  editProfile: jest.fn(),
}));

// Spy on Alert
jest.spyOn(Alert, "alert");

describe("Calculator (Onboarding) Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders headers, input fields, selector buttons, and action buttons on initial mount", async () => {
      await render(<Calculator />);

      expect(screen.getByText("Your daily target")).toBeTruthy();
      expect(screen.getByText("PERSONAL INFO")).toBeTruthy();
      expect(screen.getByPlaceholderText("24")).toBeTruthy(); // Age
      expect(screen.getByText("Female")).toBeTruthy();
      expect(screen.getByText("Male")).toBeTruthy();
      expect(screen.getByPlaceholderText("162")).toBeTruthy(); // Height
      expect(screen.getByPlaceholderText("60")).toBeTruthy(); // Weight

      expect(screen.getByText("ACTIVITY LEVEL")).toBeTruthy();
      expect(screen.getByText("Sedentary")).toBeTruthy();
      expect(screen.getByText("Light")).toBeTruthy();
      expect(screen.getByText("Moderate")).toBeTruthy();
      expect(screen.getByText("Active")).toBeTruthy();
      expect(screen.getByText("Very active")).toBeTruthy();

      expect(screen.getByText("GOAL")).toBeTruthy();
      expect(screen.getByText("Lose weight")).toBeTruthy();
      expect(screen.getByText("Maintain weight")).toBeTruthy();
      expect(screen.getByText("Gain weight")).toBeTruthy();

      expect(screen.getByText("Calculate my target")).toBeTruthy();
      expect(screen.getByText("Cancel")).toBeTruthy();
    });
  });

  describe("Form Validation & Blur Events", () => {
    it("displays validation error when age is blurred empty or outside 14-100 range", async () => {
      await render(<Calculator />);
      const ageInput = screen.getByPlaceholderText("24");

      await fireEvent(ageInput, "blur");
      expect(screen.getByText("Age cannot be empty.")).toBeTruthy();

      await fireEvent.changeText(ageInput, "10");
      await fireEvent(ageInput, "blur");
      expect(screen.getByText("Age must be between 14 and 100.")).toBeTruthy();

      await fireEvent.changeText(ageInput, "150");
      await fireEvent(ageInput, "blur");
      expect(screen.getByText("Age must be between 14 and 100.")).toBeTruthy();

      await fireEvent.changeText(ageInput, "abc");
      await fireEvent(ageInput, "blur");
      expect(screen.getByText("Age must be a number.")).toBeTruthy();
    });

    it("displays validation error when height is blurred empty or outside 100-250 range", async () => {
      await render(<Calculator />);
      const heightInput = screen.getByPlaceholderText("162");

      await fireEvent(heightInput, "blur");
      expect(screen.getByText("Height cannot be empty.")).toBeTruthy();

      await fireEvent.changeText(heightInput, "90");
      await fireEvent(heightInput, "blur");
      expect(screen.getByText("Height must be between 100 and 250.")).toBeTruthy();

      await fireEvent.changeText(heightInput, "300");
      await fireEvent(heightInput, "blur");
      expect(screen.getByText("Height must be between 100 and 250.")).toBeTruthy();
    });

    it("displays validation error when weight is blurred empty or outside 30-300 range", async () => {
      await render(<Calculator />);
      const weightInput = screen.getByPlaceholderText("60");

      await fireEvent(weightInput, "blur");
      expect(screen.getByText("Weight cannot be empty.")).toBeTruthy();

      await fireEvent.changeText(weightInput, "20");
      await fireEvent(weightInput, "blur");
      expect(screen.getByText("Weight must be between 30 and 300.")).toBeTruthy();

      await fireEvent.changeText(weightInput, "400");
      await fireEvent(weightInput, "blur");
      expect(screen.getByText("Weight must be between 30 and 300.")).toBeTruthy();
    });
  });

  describe("Error Message Clearing", () => {
    it("clears error message when user starts re-typing", async () => {
      await render(<Calculator />);
      const ageInput = screen.getByPlaceholderText("24");

      await fireEvent(ageInput, "blur");
      expect(screen.getByText("Age cannot be empty.")).toBeTruthy();

      await fireEvent.changeText(ageInput, "25");
      expect(screen.queryByText("Age cannot be empty.")).toBeNull();
    });
  });

  describe("Form Submission (Happy Path)", () => {
    it("submits valid profile data, refreshes auth context, and navigates to result screen", async () => {
      (meService.postProfile as jest.Mock).mockResolvedValueOnce({
        id: 1,
        tdee: 2200,
      });

      await render(<Calculator />);

      await fireEvent.changeText(screen.getByPlaceholderText("24"), "25");
      await fireEvent.changeText(screen.getByPlaceholderText("162"), "175");
      await fireEvent.changeText(screen.getByPlaceholderText("60"), "70");

      // Select female gender and active level
      await fireEvent.press(screen.getByText("Female"));
      await fireEvent.press(screen.getByText("Active"));
      await fireEvent.press(screen.getByText("Maintain weight"));

      await fireEvent.press(screen.getByText("Calculate my target"));

      await waitFor(() => {
        expect(meService.postProfile).toHaveBeenCalledWith({
          age: 25,
          gender: "female",
          height_cm: 175,
          weight_kg: 70,
          activity_level: "active",
          goal: "maintain",
        });
        expect(mockRefreshMe).toHaveBeenCalledTimes(1);
        expect(Alert.alert).toHaveBeenCalledWith("Success", "Profile created");
        expect(mockReplace).toHaveBeenCalledWith("/result");
      });
    });

    it("falls back to editProfile when profile already exists", async () => {
      (meService.postProfile as jest.Mock).mockRejectedValueOnce({
        code: "profile_exists",
        message: "Profile already exists.",
      });
      (meService.editProfile as jest.Mock).mockResolvedValueOnce({
        id: 1,
        tdee: 2100,
      });

      await render(<Calculator />);

      await fireEvent.changeText(screen.getByPlaceholderText("24"), "30");
      await fireEvent.changeText(screen.getByPlaceholderText("162"), "180");
      await fireEvent.changeText(screen.getByPlaceholderText("60"), "80");

      await fireEvent.press(screen.getByText("Calculate my target"));

      await waitFor(() => {
        expect(meService.postProfile).toHaveBeenCalledTimes(1);
        expect(meService.editProfile).toHaveBeenCalledWith({
          age: 30,
          gender: "male", // default
          height_cm: 180,
          weight_kg: 80,
          activity_level: "sedentary", // default
          goal: "lose", // default
        });
        expect(mockRefreshMe).toHaveBeenCalledTimes(1);
        expect(Alert.alert).toHaveBeenCalledWith("Success", "Profile updated");
        expect(mockReplace).toHaveBeenCalledWith("/result");
      });
    });
  });

  describe("Form Submission (Unhappy Path)", () => {
    it("halts submission and displays inline validation errors when fields are left empty", async () => {
      await render(<Calculator />);

      await fireEvent.press(screen.getByText("Calculate my target"));

      expect(meService.postProfile).not.toHaveBeenCalled();
      expect(meService.editProfile).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();

      expect(screen.getByText("Age cannot be empty.")).toBeTruthy();
      expect(screen.getByText("Height cannot be empty.")).toBeTruthy();
      expect(screen.getByText("Weight cannot be empty.")).toBeTruthy();
    });
  });

  describe("API Error Handling", () => {
    it("shows error alert when postProfile fails with non-duplicate error", async () => {
      (meService.postProfile as jest.Mock).mockRejectedValueOnce(
        new Error("Internal server error")
      );

      await render(<Calculator />);

      await fireEvent.changeText(screen.getByPlaceholderText("24"), "28");
      await fireEvent.changeText(screen.getByPlaceholderText("162"), "170");
      await fireEvent.changeText(screen.getByPlaceholderText("60"), "65");

      await fireEvent.press(screen.getByText("Calculate my target"));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Fail to create profile",
          "Internal server error"
        );
        expect(mockReplace).not.toHaveBeenCalled();
      });
    });

    it("shows error alert when editProfile fails after profile_exists", async () => {
      (meService.postProfile as jest.Mock).mockRejectedValueOnce({
        code: "profile_exists",
        message: "Profile already exists.",
      });
      (meService.editProfile as jest.Mock).mockRejectedValueOnce(
        new Error("Failed updating profile")
      );

      await render(<Calculator />);

      await fireEvent.changeText(screen.getByPlaceholderText("24"), "28");
      await fireEvent.changeText(screen.getByPlaceholderText("162"), "170");
      await fireEvent.changeText(screen.getByPlaceholderText("60"), "65");

      await fireEvent.press(screen.getByText("Calculate my target"));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Fail to edit profile",
          "Failed updating profile"
        );
        expect(mockReplace).not.toHaveBeenCalled();
      });
    });
  });

  describe("Navigation", () => {
    it("triggers router.back when Cancel button is pressed", async () => {
      await render(<Calculator />);
      await fireEvent.press(screen.getByText("Cancel"));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });
});
