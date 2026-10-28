import { createUser, loginUser } from "../auth";
import * as helper from "../helper";

jest.mock("../helper", () => ({
  callApi: jest.fn(),
  handleError: jest.fn(),
}));

describe("auth service", () => {
  const mockUserSession = {
    access_token: "fake_access",
    refresh_token: "fake_refresh",
    token_type: "Bearer",
    expires_in: "3600",
    user: {
      id: "u123",
      email: "test@example.com",
      display_name: "Test User",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("returns UserSession when registration succeeds", async () => {
      (helper.callApi as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserSession,
      });

      const result = await createUser({
        email: "test@example.com",
        password: "password123",
        display_name: "Test User",
      });

      expect(helper.callApi).toHaveBeenCalledWith("POST", "/auth/register", {
        email: "test@example.com",
        password: "password123",
        display_name: "Test User",
      });
      expect(result).toEqual(mockUserSession);
    });

    it("throws an error when registration fails", async () => {
      (helper.callApi as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });
      (helper.handleError as jest.Mock).mockResolvedValueOnce({
        code: "email_exists",
        message: "Email is already taken",
      });

      await expect(
        createUser({
          email: "existing@example.com",
          password: "password123",
          display_name: "Test User",
        })
      ).rejects.toThrow("Email is already taken");
    });
  });

  describe("loginUser", () => {
    it("returns UserSession when login succeeds", async () => {
      (helper.callApi as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserSession,
      });

      const result = await loginUser({
        email: "test@example.com",
        password: "password123",
      });

      expect(helper.callApi).toHaveBeenCalledWith("POST", "/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
      expect(result).toEqual(mockUserSession);
    });

    it("throws an error when login fails", async () => {
      (helper.callApi as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });
      (helper.handleError as jest.Mock).mockResolvedValueOnce({
        code: "invalid_credentials",
        message: "Invalid email or password",
      });

      await expect(
        loginUser({
          email: "test@example.com",
          password: "wrongpassword",
        })
      ).rejects.toThrow("Invalid email or password");
    });
  });
});

