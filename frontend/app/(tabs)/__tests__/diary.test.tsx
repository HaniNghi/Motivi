import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
import Diary from "../diary";
import * as diaryService from "../../../services/diary";
import { Alert } from "react-native";

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

// Mock services/diary
jest.mock("../../../services/diary", () => ({
  getDiaryDay: jest.fn(),
  patchEntry: jest.fn(),
  deleteEntry: jest.fn(),
}));

// Spy on Alert
jest.spyOn(Alert, "alert");

const mockEntry = {
  id: 10,
  food_id: 1,
  food_name: "Oatmeal",
  amount_g: 100,
  calories: 150,
  protein_g: 5,
  carbs_g: 27,
  fat_g: 3,
  image_url: null,
};

const mockDiarySessionWithEntries = {
  date: "2026-11-14",
  target: { calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 60 },
  consumed: { calories: 150, protein_g: 5, carbs_g: 27, fat_g: 3 },
  remaining: { calories: 1850, protein_g: 145, carbs_g: 173, fat_g: 57 },
  entries: [mockEntry],
};

const mockEmptyDiarySession = {
  date: "2026-11-14",
  target: { calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 60 },
  consumed: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  remaining: { calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 60 },
  entries: [],
};

describe("Diary Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (diaryService.getDiaryDay as jest.Mock).mockResolvedValue(mockDiarySessionWithEntries);
  });

  describe("Component Rendering", () => {
    it("renders date navigation, food list header, and add food button", async () => {
      await render(<Diary />);

      expect(screen.getByLabelText("Previous day")).toBeTruthy();
      expect(screen.getByLabelText("Next day")).toBeTruthy();
      expect(screen.getByText("Today's foods")).toBeTruthy();
      expect(screen.getByText("+ Add food")).toBeTruthy();

      await waitFor(() => {
        expect(diaryService.getDiaryDay).toHaveBeenCalled();
        expect(screen.getByText("Oatmeal")).toBeTruthy();
      });
    });

    it("displays 'No food recorded' when entry list is empty", async () => {
      (diaryService.getDiaryDay as jest.Mock).mockResolvedValue(mockEmptyDiarySession);

      await render(<Diary />);

      await waitFor(() => {
        expect(screen.getByText("No food recorded")).toBeTruthy();
      });
    });
  });

  describe("Date Navigation", () => {
    it("fetches previous day diary when Previous day button is pressed", async () => {
      await render(<Diary />);

      await waitFor(() => {
        expect(diaryService.getDiaryDay).toHaveBeenCalledTimes(1);
      });

      await fireEvent.press(screen.getByLabelText("Previous day"));

      await waitFor(() => {
        expect(diaryService.getDiaryDay).toHaveBeenCalledTimes(2);
      });
    });

    it("fetches next day diary when Next day button is pressed", async () => {
      await render(<Diary />);

      await waitFor(() => {
        expect(diaryService.getDiaryDay).toHaveBeenCalledTimes(1);
      });

      await fireEvent.press(screen.getByLabelText("Next day"));

      await waitFor(() => {
        expect(diaryService.getDiaryDay).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Modify Entry", () => {
    it("modifies entry serving size and updates diary", async () => {
      (diaryService.patchEntry as jest.Mock).mockResolvedValueOnce({
        ...mockDiarySessionWithEntries,
        consumed: { calories: 300, protein_g: 10, carbs_g: 54, fat_g: 6 },
      });

      await render(<Diary />);

      await waitFor(() => {
        expect(screen.getByText("Oatmeal")).toBeTruthy();
      });

      // Press entry to open modal
      await fireEvent.press(screen.getByText("Oatmeal"));

      await waitFor(() => {
        expect(screen.getByText("Modify")).toBeTruthy();
      });

      await fireEvent.press(screen.getByText("Modify"));

      await waitFor(() => {
        expect(diaryService.patchEntry).toHaveBeenCalledWith(10, 100);
      });
    });

    it("displays error alert when patchEntry API fails", async () => {
      (diaryService.patchEntry as jest.Mock).mockRejectedValueOnce(
        new Error("Update failed")
      );

      await render(<Diary />);

      await waitFor(() => {
        expect(screen.getByText("Oatmeal")).toBeTruthy();
      });

      await fireEvent.press(screen.getByText("Oatmeal"));

      await waitFor(() => {
        expect(screen.getByText("Modify")).toBeTruthy();
      });

      await fireEvent.press(screen.getByText("Modify"));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Failed to update entry", "Update failed");
      });
    });
  });

  describe("Delete Entry", () => {
    it("confirms and deletes entry, then updates diary session", async () => {
      (diaryService.deleteEntry as jest.Mock).mockResolvedValueOnce(mockEmptyDiarySession);

      await render(<Diary />);

      await waitFor(() => {
        expect(screen.getByText("Oatmeal")).toBeTruthy();
      });

      // Press entry to open modal
      await fireEvent.press(screen.getByText("Oatmeal"));

      await waitFor(() => {
        expect(screen.getByText("Delete")).toBeTruthy();
      });

      // Press delete in modal (triggers confirmation Alert)
      await fireEvent.press(screen.getByText("Delete"));

      expect(Alert.alert).toHaveBeenCalledWith(
        "Delete Entry",
        expect.stringContaining("Oatmeal"),
        expect.any(Array)
      );

      // Confirm deletion by invoking destructive button handler
      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const confirmButton = alertButtons.find((btn: any) => btn.text === "Delete");
      await act(async () => {
        confirmButton.onPress();
      });

      await waitFor(() => {
        expect(diaryService.deleteEntry).toHaveBeenCalledWith(10);
      });
    });

    it("displays error alert when deleteEntry API fails", async () => {
      (diaryService.deleteEntry as jest.Mock).mockRejectedValueOnce(
        new Error("Delete failed")
      );

      await render(<Diary />);

      await waitFor(() => {
        expect(screen.getByText("Oatmeal")).toBeTruthy();
      });

      await fireEvent.press(screen.getByText("Oatmeal"));

      await waitFor(() => {
        expect(screen.getByText("Delete")).toBeTruthy();
      });

      await fireEvent.press(screen.getByText("Delete"));

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      const confirmButton = alertButtons.find((btn: any) => btn.text === "Delete");
      await act(async () => {
        confirmButton.onPress();
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Failed to delete entry", "Delete failed");
      });
    });
  });

  describe("Add Food Navigation", () => {
    it("navigates to add food screen with current date parameter", async () => {
      await render(<Diary />);

      await fireEvent.press(screen.getByText("+ Add food"));

      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/(food)/addfood",
        params: { date: expect.any(String) },
      });
    });
  });
});
