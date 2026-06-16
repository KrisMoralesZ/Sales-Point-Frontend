import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAuth,
  getToken,
  getUser,
  isAuthenticated,
  setAuth,
} from "./auth";

const mockAuthResponse = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  role: "Admin",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  token: "test-token",
};

describe("auth service", () => {
  beforeEach(() => {
    clearAuth();
  });

  it("stores token and user data in localStorage", () => {
    setAuth(mockAuthResponse);

    expect(localStorage.getItem("token")).toBe("test-token");
    expect(localStorage.getItem("user")).toBe(
      JSON.stringify({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "Admin",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
    );
  });

  it("reads stored auth state", () => {
    setAuth(mockAuthResponse);

    expect(getToken()).toBe("test-token");
    expect(getUser()).toEqual({
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(isAuthenticated()).toBe(true);
  });

  it("clears auth state from localStorage", () => {
    setAuth(mockAuthResponse);

    clearAuth();

    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });
});
