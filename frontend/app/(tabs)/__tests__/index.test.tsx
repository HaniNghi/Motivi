import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import Home from "../index";
import * as diaryService from "../../../services/diary";
import * as analyticsService from "../../../services/analytics";

// Mock router
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useFocusEffect: (callback: () => void) => {
    callback();
  },
}));

// Mock AuthContext
const mockUser = {
  id: "123",
  display_name: "John Doe",
  email: "john@example.com",
};
jest.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    profile: {
      tdee: 2200,
      goal: "maintain",
      activity_level: "moderate",
    },
  }),
}));

// Mock services
jest.mock("../../../services/diary", () => ({
  getDiaryDay: jest.fn(),
}));

jest.mock("../../../services/analytics", () => ({
  getWeek: jest.fn(),
}));

// Mock Chart child component to avoid SVG rendering issues in test environment
jest.mock("../../../components/Chart", () => {
  const { Text } = require("react-native");
  return () => <Text testID="mock-chart">Mock Chart</Text>;
});

const mockDiarySession = {
  date: "2026-11-14",
  target: {
    calories: 2200,
    protein_g: 150,
    carbs_g: 250,
    fat_g: 70,
  },
  consumed: {
    calories: 1800,
    protein_g: 120,
    carbs_g: 200,
    fat_g: 50,
  },
  remaining: {
    calories: 400,
    protein_g: 30,
    carbs_g: 50,
    fat_g: 20,
  },
  entries: [],
};

const mockWeekAnalytics = {
  week_start: "2026-11-09",
  week_end: "2026-11-15",
  target_calories: 2200,
  days: [
    { date: "2026-11-09", calories: 2100 },
    { date: "2026-11-10", calories: 2250 },
    { date: "2026-11-11", calories: 2000 },
    { date: "2026-11-12", calories: 1950 },
    { date: "2026-11-13", calories: 2150 },
    { date: "2026-11-14", calories: 1800 },
    { date: "2026-11-15", calories: 0 },
  ],
};

describe("Home Dashboard Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (diaryService.getDiaryDay as jest.Mock).mockResolvedValue(mockDiarySession);
    (analyticsService.getWeek as jest.Mock).mockResolvedValue(mockWeekAnalytics);
  });

  describe("Component Rendering & Initial Mount", () => {
    it("renders user greeting, macros section, quick actions, and week section", async () => {
      await render(<Home />);

      expect(screen.getByText(/John Doe/)).toBeTruthy();
      expect(screen.getByText("MACRONUTRIENTS")).toBeTruthy();
      expect(screen.getByText("Protein")).toBeTruthy();
      expect(screen.getByText("Carbs")).toBeTruthy();
      expect(screen.getByText("Fats")).toBeTruthy();

      expect(screen.getByText("Quick actions")).toBeTruthy();
      expect(screen.getByText("Add food")).toBeTruthy();
      expect(screen.getByText("Diary")).toBeTruthy();
      expect(screen.getByText("Weekly")).toBeTruthy();

      expect(screen.getByText("This week")).toBeTruthy();
      expect(screen.getByText("Recalculate your plan")).toBeTruthy();
    });

    it("fetches diary day and weekly analytics data upon loading", async () => {
      await render(<Home />);

      await waitFor(() => {
        expect(diaryService.getDiaryDay).toHaveBeenCalled();
        expect(analyticsService.getWeek).toHaveBeenCalled();
        expect(screen.getByText("Mock Chart")).toBeTruthy();
      });
    });
  });

  describe("API Error Handling", () => {
    it("handles error gracefully when getDiaryDay rejects", async () => {
      (diaryService.getDiaryDay as jest.Mock).mockRejectedValueOnce({
        code: "fetch_error",
        message: "Failed to load diary",
      });

      await render(<Home />);

      await waitFor(() => {
        expect(diaryService.getDiaryDay).toHaveBeenCalled();
      });
    });

    it("handles error gracefully when getWeek rejects", async () => {
      (analyticsService.getWeek as jest.Mock).mockRejectedValueOnce({
        code: "analytics_error",
        message: "Failed to load analytics",
      });

      await render(<Home />);

      await waitFor(() => {
        expect(analyticsService.getWeek).toHaveBeenCalled();
      });
    });
  });

  describe("Quick Action Navigation", () => {
    it("navigates to add food screen when Add food card is pressed", async () => {
      await render(<Home />);

      await fireEvent.press(screen.getByText("Add food"));

      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/(food)/addfood",
        params: { date: expect.any(String) },
      });
    });

    it("navigates to diary screen when Diary card is pressed", async () => {
      await render(<Home />);

      await fireEvent.press(screen.getByText("Diary"));

      expect(mockPush).toHaveBeenCalledWith("/diary");
    });

    it("navigates to graph screen when Weekly card is pressed", async () => {
      await render(<Home />);

      await fireEvent.press(screen.getByText("Weekly"));

      expect(mockPush).toHaveBeenCalledWith("/graph");
    });

    it("navigates to graph screen when 'See all ➜' button is pressed", async () => {
      await render(<Home />);

      await fireEvent.press(screen.getByText("See all ➜"));

      expect(mockPush).toHaveBeenCalledWith("/graph");
    });

    it("navigates to calculator screen when 'Update ➜' button is pressed", async () => {
      await render(<Home />);

      await fireEvent.press(screen.getByText("Update ➜"));

      expect(mockPush).toHaveBeenCalledWith("/(onboarding)/calculator");
    });
  });
});
