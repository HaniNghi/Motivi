import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import Login from "../login";
import * as authService from "../../../services/auth";
import { Alert } from "react-native";

// Mock router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock useAuth
const mockLogin = jest.fn();
jest.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock loginUser API
jest.mock("../../../services/auth", () => ({
  loginUser: jest.fn(),
}));

// Spy on Alert
jest.spyOn(Alert, "alert");

describe("Login Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email input, password input, and login button", async () => {
    await render(<Login />);

    expect(screen.getByPlaceholderText("example@gmail.com")).toBeTruthy();
    expect(screen.getByPlaceholderText("••••••••")).toBeTruthy();
    expect(screen.getByText("Log in")).toBeTruthy();
  });

  it("displays validation error when email is blurred empty", async () => {
    await render(<Login />);
    const emailInput = screen.getByPlaceholderText("example@gmail.com");

    await fireEvent(emailInput, "blur");

    expect(screen.getByText("Email cannot be empty.")).toBeTruthy();
  });

  it("displays validation error when email format is invalid", async () => {
    await render(<Login />);
    const emailInput = screen.getByPlaceholderText("example@gmail.com");

    await fireEvent.changeText(emailInput, "invalid-email");
    await fireEvent(emailInput, "blur");

    expect(screen.getByText("Please enter a valid email address.")).toBeTruthy();
  });

  it("displays validation error when password is shorter than 8 characters", async () => {
    await render(<Login />);
    const passwordInput = screen.getByPlaceholderText("••••••••");

    await fireEvent.changeText(passwordInput, "short");
    await fireEvent(passwordInput, "blur");

    expect(screen.getByText("Password must be at least 8 characters.")).toBeTruthy();
  });

  it("clears error message when user starts typing again", async () => {
    await render(<Login />);
    const emailInput = screen.getByPlaceholderText("example@gmail.com");

    // Cause error
    await fireEvent(emailInput, "blur");
    expect(screen.getByText("Email cannot be empty.")).toBeTruthy();

    // Type to clear
    await fireEvent.changeText(emailInput, "a");
    expect(screen.queryByText("Email cannot be empty.")).toBeNull();
  });

  it("submits login successfully when fields are valid", async () => {
    const mockUserSession = {
      access_token: "mock_access_token",
      refresh_token: "mock_refresh_token",
      token_type: "Bearer",
      expires_in: "3600",
      user: {
        id: "123",
        email: "test@example.com",
        display_name: "Test User",
      },
    };

    (authService.loginUser as jest.Mock).mockResolvedValueOnce(mockUserSession);

    await render(<Login />);
    const emailInput = screen.getByPlaceholderText("example@gmail.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const loginButton = screen.getByText("Log in");

    await fireEvent.changeText(emailInput, "test@example.com");
    await fireEvent.changeText(passwordInput, "validpassword123");
    await fireEvent.press(loginButton);

    await waitFor(() => {
      expect(authService.loginUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "validpassword123",
      });
      expect(mockLogin).toHaveBeenCalledWith(mockUserSession);
      expect(Alert.alert).toHaveBeenCalledWith("Success", "Login successfully");
    });
  });

  it("shows an alert error when login API fails", async () => {
    (authService.loginUser as jest.Mock).mockRejectedValueOnce(
      new Error("Invalid credentials")
    );

    await render(<Login />);
    const emailInput = screen.getByPlaceholderText("example@gmail.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const loginButton = screen.getByText("Log in");

    await fireEvent.changeText(emailInput, "test@example.com");
    await fireEvent.changeText(passwordInput, "wrongpassword");
    await fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Fail to login", "Invalid credentials");
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });
});
