import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import Graph from "../graph";
import * as analyticsService from "../../../services/analytics";

// Mock router
const mockPush = jest.fn();
jest.mock("expo-router", () => {
  const React = require("react");
  return {
    useRouter: () => ({
      push: mockPush,
    }),
    useFocusEffect: (callback: any) => {
      React.useEffect(() => {
        callback();
      }, [callback]);
    },
  };
});

// Mock services/analytics
jest.mock("../../../services/analytics", () => ({
  getWeek: jest.fn(),
}));

// Mock Chart
jest.mock("../../../components/Chart", () => {
  const { Text } = require("react-native");
  return () => <Text testID="weekly-chart">Chart Component</Text>;
});

const mockWeekData = {
  week_start: "2026-11-09T00:00:00.000Z",
  week_end: "2026-11-15T00:00:00.000Z",
  target_calories: 2000,
  days: [
    { date: "2026-11-09", calories: 2100 },
    { date: "2026-11-10", calories: 2200 },
    { date: "2026-11-11", calories: 1900 },
    { date: "2026-11-12", calories: 2050 },
    { date: "2026-11-13", calories: 1800 },
    { date: "2026-11-14", calories: 2100 },
    { date: "2026-11-15", calories: 1850 },
  ],
};

describe("Graph (Weekly Analytics) Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (analyticsService.getWeek as jest.Mock).mockResolvedValue(mockWeekData);
  });

  describe("Component Rendering & Analytics", () => {
    it("renders title, week selector, computed averages, and target stats", async () => {
      await render(<Graph />);

      expect(screen.getByText("Weekly intake")).toBeTruthy();
      expect(screen.getByLabelText("Previous day")).toBeTruthy();
      expect(screen.getByLabelText("Next day")).toBeTruthy();

      await waitFor(() => {
        expect(analyticsService.getWeek).toHaveBeenCalled();
        expect(screen.getByText("Weekly average")).toBeTruthy();
        expect(screen.getByText("Days on target")).toBeTruthy();
        expect(screen.getByText("Calories only")).toBeTruthy();
      });
    });
  });

  describe("Week Navigation", () => {
    it("fetches analytics for previous week when previous button is pressed", async () => {
      await render(<Graph />);

      await waitFor(() => {
        expect(analyticsService.getWeek).toHaveBeenCalledTimes(1);
      });

      await fireEvent.press(screen.getByLabelText("Previous day"));

      await waitFor(() => {
        expect(analyticsService.getWeek).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("API Error Handling", () => {
    it("displays error text when getWeek API rejects", async () => {
      (analyticsService.getWeek as jest.Mock).mockRejectedValueOnce({
        code: "fetch_error",
        message: "Failed to fetch week analytics",
      });

      await render(<Graph />);

      await waitFor(() => {
        expect(screen.getByText("fetch_error Failed to fetch week analytics")).toBeTruthy();
      });
    });
  });
});
