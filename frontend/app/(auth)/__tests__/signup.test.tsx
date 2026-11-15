import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import Signup from "../signup";
import * as authService from "../../../services/auth";
import { Alert } from "react-native";

// Mock router
const mockPush = jest.fn();
const mockDismissTo = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    dismissTo: mockDismissTo,
  }),
}));

// Mock createUser API
jest.mock("../../../services/auth", () => ({
  createUser: jest.fn(),
}));

// Spy on Alert
jest.spyOn(Alert, "alert");

describe("Signup Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders all inputs, create account button, and login navigation link", async () => {
      await render(<Signup />);

      expect(screen.getByText("Create your")).toBeTruthy();
      expect(screen.getByPlaceholderText("Isabella Smith")).toBeTruthy();
      expect(screen.getByPlaceholderText("example@gmail.com")).toBeTruthy();

      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      expect(passwordInputs).toHaveLength(2); // Password and Confirm password

      expect(screen.getByText("Create account")).toBeTruthy();
      expect(screen.getByText(/Already have an account\?/)).toBeTruthy();
    });
  });

  describe("Form Validation & Blur Events", () => {
    it("displays validation error when full name is blurred empty", async () => {
      await render(<Signup />);
      const nameInput = screen.getByPlaceholderText("Isabella Smith");

      await fireEvent(nameInput, "blur");

      expect(screen.getByText("Full name cannot be empty.")).toBeTruthy();
    });

    it("displays validation error when email is blurred empty or invalid", async () => {
      await render(<Signup />);
      const emailInput = screen.getByPlaceholderText("example@gmail.com");

      await fireEvent(emailInput, "blur");
      expect(screen.getByText("Email cannot be empty.")).toBeTruthy();

      await fireEvent.changeText(emailInput, "not-an-email");
      await fireEvent(emailInput, "blur");
      expect(screen.getByText("Please enter a valid email address.")).toBeTruthy();
    });

    it("displays validation error when password is less than 8 characters", async () => {
      await render(<Signup />);
      const [passwordInput] = screen.getAllByPlaceholderText("••••••••");

      await fireEvent(passwordInput, "blur");
      expect(screen.getByText("Password cannot be empty.")).toBeTruthy();

      await fireEvent.changeText(passwordInput, "short");
      await fireEvent(passwordInput, "blur");
      expect(screen.getByText("Password must be at least 8 characters.")).toBeTruthy();
    });

    it("displays validation error when confirm password does not match", async () => {
      await render(<Signup />);
      const [passwordInput, confirmPasswordInput] = screen.getAllByPlaceholderText("••••••••");

      await fireEvent.changeText(passwordInput, "password123");
      await fireEvent.changeText(confirmPasswordInput, "different123");
      await fireEvent(confirmPasswordInput, "blur");

      expect(screen.getByText("Confirm password does not match")).toBeTruthy();
    });
  });

  describe("Error Message Clearing", () => {
    it("clears full name error when user starts typing again", async () => {
      await render(<Signup />);
      const nameInput = screen.getByPlaceholderText("Isabella Smith");

      // Cause error on blur
      await fireEvent(nameInput, "blur");
      expect(screen.getByText("Full name cannot be empty.")).toBeTruthy();

      // Type to clear
      await fireEvent.changeText(nameInput, "J");
      expect(screen.queryByText("Full name cannot be empty.")).toBeNull();
    });
  });

  describe("Form Submission (Happy Path)", () => {
    it("submits registration successfully when all fields are valid", async () => {
      const mockUserSession = {
        access_token: "mock_access_token",
        refresh_token: "mock_refresh_token",
        token_type: "Bearer",
        expires_in: "3600",
        user: {
          id: "456",
          email: "newuser@example.com",
          display_name: "New User",
        },
      };

      (authService.createUser as jest.Mock).mockResolvedValueOnce(mockUserSession);

      await render(<Signup />);
      const nameInput = screen.getByPlaceholderText("Isabella Smith");
      const emailInput = screen.getByPlaceholderText("example@gmail.com");
      const [passwordInput, confirmPasswordInput] = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByText("Create account");

      await fireEvent.changeText(nameInput, "New User");
      await fireEvent.changeText(emailInput, "newuser@example.com");
      await fireEvent.changeText(passwordInput, "validpassword123");
      await fireEvent.changeText(confirmPasswordInput, "validpassword123");

      await fireEvent.press(submitButton);

      await waitFor(() => {
        expect(authService.createUser).toHaveBeenCalledWith({
          display_name: "New User",
          email: "newuser@example.com",
          password: "validpassword123",
        });
        expect(Alert.alert).toHaveBeenCalledWith("Success", "Account created");
        expect(mockDismissTo).toHaveBeenCalledWith("/login");
      });
    });
  });

  describe("Form Submission (Unhappy Path)", () => {
    it("halts submission and shows errors without calling API when fields are empty", async () => {
      await render(<Signup />);
      const submitButton = screen.getByText("Create account");

      await fireEvent.press(submitButton);

      expect(authService.createUser).not.toHaveBeenCalled();
      expect(screen.getByText("Full name cannot be empty.")).toBeTruthy();
      expect(screen.getByText("Email cannot be empty.")).toBeTruthy();
      expect(screen.getByText("Password cannot be empty.")).toBeTruthy();
      expect(screen.getByText("Confirm password cannot be empty.")).toBeTruthy();
      expect(mockDismissTo).not.toHaveBeenCalled();
    });

    it("halts submission without calling API when confirm password does not match", async () => {
      await render(<Signup />);
      const nameInput = screen.getByPlaceholderText("Isabella Smith");
      const emailInput = screen.getByPlaceholderText("example@gmail.com");
      const [passwordInput, confirmPasswordInput] = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByText("Create account");

      await fireEvent.changeText(nameInput, "Valid User");
      await fireEvent.changeText(emailInput, "user@example.com");
      await fireEvent.changeText(passwordInput, "password123");
      await fireEvent.changeText(confirmPasswordInput, "password456");

      await fireEvent.press(submitButton);

      expect(authService.createUser).not.toHaveBeenCalled();
      expect(screen.getByText("Confirm password does not match")).toBeTruthy();
      expect(mockDismissTo).not.toHaveBeenCalled();
    });
  });

  describe("API Error Handling", () => {
    it("shows an alert error when registration API fails", async () => {
      (authService.createUser as jest.Mock).mockRejectedValueOnce(
        new Error("Email is already registered")
      );

      await render(<Signup />);
      const nameInput = screen.getByPlaceholderText("Isabella Smith");
      const emailInput = screen.getByPlaceholderText("example@gmail.com");
      const [passwordInput, confirmPasswordInput] = screen.getAllByPlaceholderText("••••••••");
      const submitButton = screen.getByText("Create account");

      await fireEvent.changeText(nameInput, "New User");
      await fireEvent.changeText(emailInput, "existing@example.com");
      await fireEvent.changeText(passwordInput, "validpassword123");
      await fireEvent.changeText(confirmPasswordInput, "validpassword123");

      await fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Fail to sign up",
          "Email is already registered"
        );
        expect(mockDismissTo).not.toHaveBeenCalled();
      });
    });
  });

  describe("Navigation", () => {
    it("navigates to login screen when Log in link is pressed", async () => {
      await render(<Signup />);
      const loginLink = screen.getByText(/Already have an account\?/);

      await fireEvent.press(loginLink);

      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
