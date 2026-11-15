import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import Profile from "../profile";

// Mock router
const mockPush = jest.fn();
const mockDismissTo = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    dismissTo: mockDismissTo,
  }),
}));

// Mock useAuth
const mockLogout = jest.fn();
let mockAuthData = {
  user: {
    id: "user123",
    display_name: "Isabella Smith",
    email: "isabella@example.com",
  },
  profile: {
    tdee: 2200,
    goal: "maintain",
    activity_level: "moderate",
    age: 25,
    gender: "female",
    height_cm: 165,
    weight_kg: 58,
  },
  logout: mockLogout,
};

jest.mock("../../../context/AuthContext", () => ({
  useAuth: () => mockAuthData,
}));

describe("Profile Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthData = {
      user: {
        id: "user123",
        display_name: "Isabella Smith",
        email: "isabella@example.com",
      },
      profile: {
        tdee: 2200,
        goal: "maintain",
        activity_level: "moderate",
        age: 25,
        gender: "female",
        height_cm: 165,
        weight_kg: 58,
      },
      logout: mockLogout,
    };
  });

  describe("Component Rendering", () => {
    it("renders user information, plan targets, and personal detail cards", async () => {
      await render(<Profile />);

      expect(screen.getByText("Isabella Smith")).toBeTruthy();
      expect(screen.getByText("isabella@example.com")).toBeTruthy();

      expect(screen.getByText("Your plan")).toBeTruthy();
      expect(screen.getByText("Daily target")).toBeTruthy();
      expect(screen.getByText("2200 kcal")).toBeTruthy();
      expect(screen.getByText("Maintain")).toBeTruthy();
      expect(screen.getByText("Moderate")).toBeTruthy();

      expect(screen.getByText("Personal details")).toBeTruthy();
      expect(screen.getByText("25 years")).toBeTruthy();
      expect(screen.getByText("Female")).toBeTruthy();
      expect(screen.getByText("165 cm")).toBeTruthy();
      expect(screen.getByText("58 kg")).toBeTruthy();

      expect(screen.getByText("Edit plan")).toBeTruthy();
      expect(screen.getByText("Log out")).toBeTruthy();
    });

    it("renders fallback text when user profile data is empty", async () => {
      mockAuthData = {
        user: null as any,
        profile: null as any,
        logout: mockLogout,
      };

      await render(<Profile />);

      expect(screen.getByText("Emty name")).toBeTruthy();
      expect(screen.getByText("empty email")).toBeTruthy();
    });
  });

  describe("Actions & Navigation", () => {
    it("navigates to calculator when Edit plan is pressed", async () => {
      await render(<Profile />);

      await fireEvent.press(screen.getByText("Edit plan"));

      expect(mockPush).toHaveBeenCalledWith("/(onboarding)/calculator");
    });

    it("calls logout and redirects to login when Log out is pressed", async () => {
      await render(<Profile />);

      await fireEvent.press(screen.getByText("Log out"));

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
        expect(mockDismissTo).toHaveBeenCalledWith("/login");
      });
    });
  });
});
