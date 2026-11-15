import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import Loading from "../loading";

// Mock router
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("Loading Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders app branding and login link when spinner is false", async () => {
      await render(<Loading spinner={false} />);

      expect(screen.getByText("Motivi")).toBeTruthy();
      expect(screen.getByText("Eat with intention")).toBeTruthy();
      expect(screen.getByText("Go to log in")).toBeTruthy();
    });

    it("navigates to login when 'Go to log in' is pressed", async () => {
      await render(<Loading spinner={false} />);

      await fireEvent.press(screen.getByText("Go to log in"));

      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
